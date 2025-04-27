package com.sinenomine.plottracker.service;

import com.sinenomine.plottracker.dto.PlotEventRequestDto;
import com.sinenomine.plottracker.dto.PlotEventResponseDto;
import com.sinenomine.plottracker.dto.TagResponseDto;
import com.sinenomine.plottracker.exception.ResourceNotFoundException;
import com.sinenomine.plottracker.exception.UnauthorizedException;
import com.sinenomine.plottracker.model.PlotEvent;
import com.sinenomine.plottracker.model.Story;
import com.sinenomine.plottracker.model.Tag;
import com.sinenomine.plottracker.enums.EventType;
import com.sinenomine.plottracker.repo.PlotEventRepo;
import com.sinenomine.plottracker.repo.TagRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PlotEventService {

    private final PlotEventRepo plotEventRepo;
    private final TagRepo tagRepo;

    public PlotEventService(PlotEventRepo plotEventRepo, TagRepo tagRepo) {
        this.plotEventRepo = plotEventRepo;
        this.tagRepo = tagRepo;
    }

    public PlotEvent getPlotEventById(String username, Long eventId) {
        PlotEvent event = plotEventRepo.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Plot event not found"));
        if (!event.getStory().getUser().getUsername().equals(username)) {
            throw new UnauthorizedException("Unauthorized access to plot event");
        }
        return event;
    }

    public PlotEvent updatePlotEvent(Long eventId, PlotEventRequestDto dto, String username) {
        PlotEvent savedPlotEvent = new PlotEvent();
        PlotEvent prevEvent = new PlotEvent();
        PlotEvent nextEvent = new PlotEvent();

        PlotEvent plotEvent = getPlotEventById(username, eventId);
        plotEvent.setEventType(EventType.valueOf(dto.getEventType()));
        plotEvent.setTitle(dto.getTitle());
        plotEvent.setDate(dto.getDate());
        plotEvent.setDescription(dto.getDescription());
        plotEvent.setContent(dto.getContent());
        plotEvent.setInPlot(dto.getInPlot());
        Set<Tag> tags = dto.getTags().stream()
                .map(tagId -> tagRepo.findById(tagId)
                        .orElseThrow(() -> new ResourceNotFoundException("Tag not found")))
                .collect(Collectors.toSet());
        plotEvent.setTags(tags);

        if (plotEvent.getMemoryRef() != null) {
            PlotEvent memoryRef = plotEventRepo.findById(plotEvent.getMemoryRef().getEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Memory reference plot event not found"));
            plotEvent.setMemoryRef(memoryRef);
        }

        //delete links
        if (plotEvent.getPrevEvent() != null) prevEvent = plotEvent.getPrevEvent();
        if (plotEvent.getNextEvent() != null) nextEvent = plotEvent.getNextEvent();

        plotEvent.setPrevEvent(null);
        plotEvent.setNextEvent(null);
        plotEventRepo.save(plotEvent);

        if (plotEvent.getPrevEvent() != null && plotEvent.getNextEvent() != null) {
            prevEvent.setNextEvent(nextEvent);
            nextEvent.setPrevEvent(prevEvent);
            plotEventRepo.save(prevEvent);
            plotEventRepo.save(nextEvent);
        } else if (plotEvent.getPrevEvent() != null) {
            prevEvent.setNextEvent(null);
            plotEventRepo.save(prevEvent);
        } else if (plotEvent.getNextEvent() != null) {
            nextEvent.setPrevEvent(null);
            plotEventRepo.save(nextEvent);
        }

        prevEvent = new PlotEvent();
        nextEvent = new PlotEvent();

        //set links
        Set<PlotEvent> eventSet = plotEventRepo.findByStory(plotEvent.getStory().getStoryId());
        List<PlotEvent> events = new java.util.ArrayList<>(eventSet);
        Optional<PlotEvent> firstEvent = events.stream()
                .filter(e -> (e.getPrevEvent() == null && e.getInPlot()))
                .findFirst();

        if (plotEvent.getInPlot()) {
            if (dto.getPrevEventId() == null && firstEvent.isEmpty()) {
                savedPlotEvent = plotEventRepo.save(plotEvent);
            } else if (dto.getPrevEventId() == null) {
                plotEvent.setNextEvent(firstEvent.get());
                savedPlotEvent = plotEventRepo.save(plotEvent);
                firstEvent.get().setPrevEvent(savedPlotEvent);
                plotEventRepo.save(firstEvent.get());
            } else {
                prevEvent = plotEventRepo.findById(dto.getPrevEventId())
                        .orElseThrow(() -> new ResourceNotFoundException("Next event not found"));
                plotEvent.setPrevEvent(prevEvent);

                if (prevEvent.getNextEvent() == null) {
                    savedPlotEvent = plotEventRepo.save(plotEvent);
                    prevEvent.setNextEvent(savedPlotEvent);
                    plotEventRepo.save(prevEvent);
                } else {
                    nextEvent = prevEvent.getNextEvent();
                    nextEvent.setPrevEvent(null);
                    PlotEvent updatedNextEvent = plotEventRepo.save(nextEvent);

                    savedPlotEvent = plotEventRepo.save(plotEvent);
                    prevEvent.setNextEvent(savedPlotEvent);
                    plotEventRepo.save(prevEvent);

                    updatedNextEvent.setPrevEvent(savedPlotEvent);
                    updatedNextEvent = plotEventRepo.save(updatedNextEvent);

                    plotEvent.setNextEvent(updatedNextEvent);
                    savedPlotEvent = plotEventRepo.save(plotEvent);
                }
            }
        }

        plotEventRepo.deletePlotEventTagByStoryId(plotEvent.getStory().getStoryId());
        for (Long tagId : dto.getTags()) {
            addTagToPlotEvent(savedPlotEvent.getEventId(), tagId, username);
        }
        return getPlotEventById(username, savedPlotEvent.getEventId());
    }

    public void deletePlotEvent(Long eventId, String username) {
        PlotEvent event = getPlotEventById(username, eventId);
        plotEventRepo.delete(event);
    }

    public PlotEvent addTagToPlotEvent(Long eventId, Long tagId, String username) {
        PlotEvent event = getPlotEventById(username, eventId);
        Tag tag = tagRepo.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));
        if (!tag.getStory().getStoryId().equals(event.getStory().getStoryId())) {
            throw new UnauthorizedException("Unauthorized access to tag");
        }
        event.getTags().add(tag);
        return plotEventRepo.save(event);
    }

    public PlotEvent removeTagFromPlotEvent(Long eventId, Long tagId, String username) {
        PlotEvent event = getPlotEventById(username, eventId);
        Tag tag = tagRepo.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found"));
        if (!tag.getStory().getStoryId().equals(event.getStory().getStoryId())) {
            throw new UnauthorizedException("Unauthorized access to tag");
        }
        event.getTags().remove(tag);
        return plotEventRepo.save(event);
    }

    public PlotEventResponseDto convertToDto(PlotEvent event) {
        List<TagResponseDto> tagDtos = event.getTags().stream()
                .map(tag -> new TagResponseDto(
                        tag.getTagId(),
                        tag.getTagName(),
                        tag.getTagType().getTagTypeId(),
                        tag.getTagType().getName(),
                        tag.getColor()))
                .collect(Collectors.toList());
        return new PlotEventResponseDto(
                event.getEventType().name(),
                event.getEventId(),
                event.getTitle(),
                event.getDate(),
                event.getDescription(),
                event.getContent(),
                event.getInPlot(),
                event.getMemoryRef() == null ? null : event.getMemoryRef().getEventId(),
                event.getPrevEvent() == null ? null : event.getPrevEvent().getEventId(),
                tagDtos);
    }
}
