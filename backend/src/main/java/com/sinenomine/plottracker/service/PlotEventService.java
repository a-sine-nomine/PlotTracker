package com.sinenomine.plottracker.service;

import com.sinenomine.plottracker.dto.PlotEventRequestDto;
import com.sinenomine.plottracker.dto.PlotEventResponseDto;
import com.sinenomine.plottracker.dto.TagResponseDto;
import com.sinenomine.plottracker.exception.ResourceNotFoundException;
import com.sinenomine.plottracker.exception.UnauthorizedException;
import com.sinenomine.plottracker.model.PlotEvent;
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

        PlotEvent event = getPlotEventById(username, eventId);
        event.setEventType(EventType.valueOf(dto.getEventType()));
        event.setTitle(dto.getTitle());
        event.setDate(dto.getDate());
        event.setDescription(dto.getDescription());
        event.setInPlot(dto.getInPlot());
        event.setContent(dto.getContent());
        Set<Tag> tags = dto.getTags().stream()
                .map(tagId -> tagRepo.findById(tagId)
                        .orElseThrow(() -> new ResourceNotFoundException("Tag not found")))
                .collect(Collectors.toSet());
        event.setTags(tags);

        if (dto.getMemoryRefId() != null) {
            PlotEvent memoryRef = plotEventRepo.findById(dto.getMemoryRefId())
                    .orElseThrow(() -> new ResourceNotFoundException("Memory reference plot event not found"));
            event.setMemoryRef(memoryRef);
        }
        if (dto.getPrevEventId() != null) {
            prevEvent = plotEventRepo.findById(dto.getPrevEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Prev event not found"));
            event.setPrevEvent(prevEvent);
        }

        if (event.getInPlot()) {
            if (event.getPrevEvent() == null) {
                Set<PlotEvent> eventSet = plotEventRepo.findByStory(event.getStory().getStoryId());
                List<PlotEvent> events = new java.util.ArrayList<>(eventSet);
                Optional<PlotEvent> firstEvent = events.stream()
                        .filter(e -> (e.getPrevEvent() == null && e.getInPlot()))
                        .findFirst();

                if (firstEvent.isEmpty()) {
                    savedPlotEvent = plotEventRepo.save(event);
                } else {
                    event.setNextEvent(firstEvent.get());
                    savedPlotEvent = plotEventRepo.save(event);
                    firstEvent.get().setPrevEvent(savedPlotEvent);
                    plotEventRepo.save(firstEvent.get());
                }
            } else {
                nextEvent = prevEvent.getNextEvent();
                event.setNextEvent(nextEvent);
                savedPlotEvent = plotEventRepo.save(event);
                prevEvent.setNextEvent(savedPlotEvent);
                plotEventRepo.save(prevEvent);
                nextEvent.setPrevEvent(savedPlotEvent);
                plotEventRepo.save(nextEvent);
            }
        }

        plotEventRepo.deletePlotEventTagByStoryId(event.getStory().getStoryId());
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
