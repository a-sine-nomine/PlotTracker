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
        PlotEvent event = getPlotEventById(username, eventId);
        event.setEventType(EventType.valueOf(dto.getEventType()));
        event.setTitle(dto.getTitle());
        event.setDate(dto.getDate());
        event.setDescription(dto.getDescription());
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
        if (dto.getNextEventId() != null) {
            PlotEvent nextEvent = plotEventRepo.findById(dto.getNextEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Next event not found"));
            event.setNextEvent(nextEvent);
        }
        return plotEventRepo.save(event);
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
                event.getMemoryRef() == null ? null : event.getMemoryRef().getEventId(),
                event.getNextEvent() == null ? null : event.getNextEvent().getEventId(),
                tagDtos);
    }
}
