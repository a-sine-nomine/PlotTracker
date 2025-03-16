package com.sinenomine.plottracker.service;


import com.sinenomine.plottracker.dto.PlotEventRequestDto;
import com.sinenomine.plottracker.dto.PlotEventResponseDto;
import com.sinenomine.plottracker.dto.TagResponseDto;
import com.sinenomine.plottracker.model.PlotEvent;
import com.sinenomine.plottracker.model.Tag;
import com.sinenomine.plottracker.enums.EventType;
import com.sinenomine.plottracker.repo.PlotEventRepo;
import com.sinenomine.plottracker.repo.TagRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PlotEventService {
    @Autowired
    private PlotEventRepo plotEventRepo;

    @Autowired
    private TagRepo tagRepo;

    public PlotEvent getPlotEventByIdAndUser(Long eventId, String username) {
        PlotEvent event = plotEventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Plot event not found"));
        if (!event.getStory().getUser().getUsername().equals(username))
            throw new RuntimeException("Unauthorized access to plot event");
        return event;
    }

    public PlotEvent getPlotEventById(Long eventId, String username) {
        return getPlotEventByIdAndUser(eventId, username);
    }

    public PlotEvent updatePlotEvent(Long eventId, PlotEventRequestDto dto, String username) {
        PlotEvent event = getPlotEventByIdAndUser(eventId, username);
        event.setEventType(EventType.valueOf(dto.getEventType()));
        event.setTitle(dto.getTitle());
        event.setDate(dto.getDate());
        event.setDescription(dto.getDescription());
        event.setContent(dto.getContent());
        //todo add protection
        Set<Tag> tags = dto.getTags().stream().map(tagId -> tagRepo.findById(tagId).orElseThrow(() -> new RuntimeException("Tag not found"))).collect(Collectors.toSet());
        event.setTags(tags);
        if (dto.getMemoryRefId() != null) {
            PlotEvent memoryRef = plotEventRepo.findById(dto.getMemoryRefId())
                    .orElseThrow(() -> new RuntimeException("Memory reference plot event not found"));
            event.setMemoryRef(memoryRef);
        }
        if (dto.getNextEventId() != null) {
            PlotEvent nextEvent = plotEventRepo.findById(dto.getNextEventId())
                    .orElseThrow(() -> new RuntimeException("Next event not found"));
            event.setNextEvent(nextEvent);
        }
        return plotEventRepo.save(event);
    }

    public void deletePlotEvent(Long eventId, String username) {
        PlotEvent event = getPlotEventByIdAndUser(eventId, username);
        plotEventRepo.delete(event);
    }

    public PlotEvent addTagToPlotEvent(Long eventId, Long tagId, String username) {
        PlotEvent event = getPlotEventByIdAndUser(eventId, username);
        Tag tag = tagRepo.findById(tagId)
                .orElseThrow(() -> new RuntimeException("Tag not found"));
        if (!tag.getStory().getStoryId().equals(event.getStory().getStoryId()))
            throw new RuntimeException("Unauthorized access to tag");
        event.getTags().add(tag);
        return plotEventRepo.save(event);
    }

    public PlotEvent removeTagFromPlotEvent(Long eventId, Long tagId, String username) {
        PlotEvent event = getPlotEventByIdAndUser(eventId, username);
        Tag tag = tagRepo.findById(tagId)
                .orElseThrow(() -> new RuntimeException("Tag not found"));
        if (!tag.getStory().getStoryId().equals(event.getStory().getStoryId()))
            throw new RuntimeException("Unauthorized access to tag");
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
