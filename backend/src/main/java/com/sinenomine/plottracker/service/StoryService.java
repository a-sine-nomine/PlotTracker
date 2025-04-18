package com.sinenomine.plottracker.service;

import com.sinenomine.plottracker.dto.StoryRequestDto;
import com.sinenomine.plottracker.dto.StoryResponseDto;
import com.sinenomine.plottracker.exception.DocumentGenerationException;
import com.sinenomine.plottracker.exception.ResourceNotFoundException;
import com.sinenomine.plottracker.exception.UnauthorizedException;
import com.sinenomine.plottracker.model.PlotEvent;
import com.sinenomine.plottracker.model.Story;
import com.sinenomine.plottracker.model.Users;
import com.sinenomine.plottracker.repo.PlotEventRepo;
import com.sinenomine.plottracker.repo.StoryRepo;
import com.sinenomine.plottracker.repo.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Set;

@Service
public class StoryService {

    private final Logger log = LoggerFactory.getLogger(StoryService.class);
    private final StoryRepo storyRepo;
    private final UserRepo userRepo;
    private final PlotEventRepo plotEventRepo;
    private final PlotEventService plotEventService;

    public StoryService(StoryRepo storyRepo, UserRepo userRepo, PlotEventRepo plotEventRepo, PlotEventService plotEventService) {
        this.storyRepo = storyRepo;
        this.userRepo = userRepo;
        this.plotEventRepo = plotEventRepo;
        this.plotEventService = plotEventService;
    }

    // Get all stories for a user
    public List<StoryResponseDto> findByUser(String username) {
        return storyRepo.findByUserResponses(username);
    }

    // Create a new story for the current user
    public Story createStory(String username, StoryRequestDto storyRequestDto) {
        Users user = userRepo.findByUsername(username);
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        Story story = new Story();
        story.setTitle(storyRequestDto.getTitle());
        story.setDescription(storyRequestDto.getDescription());
        story.setUser(user);
        return storyRepo.save(story);
    }

    // Get details for a specific story (only if it belongs to the user)
    public Story getStoryDetails(String username, Long storyId) {
        return getStoryByIdAndUser(storyId, username);
    }

    // Update an existing story
    public Story updateStory(String username, Long storyId, StoryRequestDto storyRequestDto) {
        Story existingStory = getStoryByIdAndUser(storyId, username);
        existingStory.setTitle(storyRequestDto.getTitle());
        existingStory.setDescription(storyRequestDto.getDescription());
        return storyRepo.save(existingStory);
    }

    // Delete a story
    public void deleteStory(String username, Long storyId) {
        Story story = getStoryByIdAndUser(storyId, username);
        storyRepo.delete(story);
    }

    // Get all plot events for a given story
    public Set<PlotEvent> getPlotEvents(String username, Long storyId) {
        Story story = storyRepo.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));
        if (!story.getUser().getUsername().equals(username)) {
            throw new UnauthorizedException("Unauthorized access to story");
        }
        return plotEventRepo.findByStory(storyId);
    }

    // Add a new plot event to a given story; if provided, resolve memoryRef and nextEvent
    public PlotEvent addPlotEventToStory(String username, Long storyId, PlotEvent plotEvent, Long memoryRefId, Long nextEventId, Set<Long> tags) {
        Story story = getStoryByIdAndUser(storyId, username);
        plotEvent.setStory(story);
        if (memoryRefId != null) {
            PlotEvent memoryRef = plotEventRepo.findById(memoryRefId)
                    .orElseThrow(() -> new ResourceNotFoundException("Memory reference plot event not found"));
            plotEvent.setMemoryRef(memoryRef);
        }
        if (nextEventId != null) {
            PlotEvent nextEvent = plotEventRepo.findById(nextEventId)
                    .orElseThrow(() -> new ResourceNotFoundException("Next event not found"));
            plotEvent.setNextEvent(nextEvent);
        }
        PlotEvent savedPlotEvent = plotEventRepo.save(plotEvent);
        for (Long tagId : tags) {
            plotEventService.addTagToPlotEvent(savedPlotEvent.getEventId(), tagId, username);
        }
        return plotEventService.getPlotEventById(username, savedPlotEvent.getEventId());
    }

    // Helper method to ensure the story exists and belongs to the current user
    Story getStoryByIdAndUser(Long storyId, String username) {
        Story story = storyRepo.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story not found"));
        if (!story.getUser().getUsername().equals(username)) {
            throw new UnauthorizedException("Unauthorized access to story");
        }
        return story;
    }

    // Export plot events as a DOCX file for the specified story
    public byte[] exportPlotEventsAsDocx(String username, Long storyId) {
        Set<PlotEvent> eventSet = getPlotEvents(username, storyId);
        List<PlotEvent> events = new java.util.ArrayList<>(eventSet);
        PlotEvent firstEvent = events.stream()
                .filter(e -> e.getPrevEvent() == null)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No starting event found"));
        List<PlotEvent> orderedEvents = new java.util.ArrayList<>();
        PlotEvent current = firstEvent;
        while (current != null) {
            orderedEvents.add(current);
            current = current.getNextEvent();
        }
        StringBuilder sb = new StringBuilder();
        for (PlotEvent pe : orderedEvents) {
            if (pe.getContent() != null) {
                sb.append(pe.getContent()).append("\n\n");
            }
        }
        String finalContent = sb.toString();

        try (org.apache.poi.xwpf.usermodel.XWPFDocument doc = new org.apache.poi.xwpf.usermodel.XWPFDocument();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            org.apache.poi.xwpf.usermodel.XWPFParagraph paragraph = doc.createParagraph();
            org.apache.poi.xwpf.usermodel.XWPFRun run = paragraph.createRun();
            run.setText(finalContent);
            doc.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new com.sinenomine.plottracker.exception.DocumentGenerationException("Error generating document: " + e.getMessage());
        }
    }
}