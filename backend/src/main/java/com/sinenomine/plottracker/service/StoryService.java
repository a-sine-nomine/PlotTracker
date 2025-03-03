package com.sinenomine.plottracker.service;

import com.sinenomine.plottracker.dto.StoryRequestDto;
import com.sinenomine.plottracker.dto.StoryResponseDto;
import com.sinenomine.plottracker.model.PlotEvent;
import com.sinenomine.plottracker.model.Story;
import com.sinenomine.plottracker.model.Users;
import com.sinenomine.plottracker.repo.PlotEventRepo;
import com.sinenomine.plottracker.repo.StoryRepo;
import com.sinenomine.plottracker.repo.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class StoryService {
    Logger log = LoggerFactory.getLogger(StoryService.class);
    @Autowired
    private StoryRepo storyRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PlotEventRepo plotEventRepo;

    @Autowired
    private PlotEventService plotEventService;


    // Get all stories for a user
    public List<StoryResponseDto> findByUser(String username) {
        return storyRepo.findByUserResponses(username);
    }

    // Create a new story for the current user
    public Story createStory(String username, StoryRequestDto storyRequestDto) {
        Users user = userRepo.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
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
                .orElseThrow(() -> new RuntimeException("Story not found"));
        if (!story.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized access to story");
        }
        Set<PlotEvent> events = plotEventRepo.findByStory(storyId);
        return events;
    }

    // Add a new plot event to a given story; if provided, resolve memoryRef and nextEvent
    public PlotEvent addPlotEventToStory(String username, Long storyId, PlotEvent plotEvent, Long memoryRefId, Long nextEventId, Set<Long> tags) {
        Story story = getStoryByIdAndUser(storyId, username);
        plotEvent.setStory(story);

        if (memoryRefId != null) {
            PlotEvent memoryRef = plotEventRepo.findById(memoryRefId)
                    .orElseThrow(() -> new RuntimeException("Memory reference plot event not found"));
            plotEvent.setMemoryRef(memoryRef);
        }
        if (nextEventId != null) {
            PlotEvent nextEvent = plotEventRepo.findById(nextEventId)
                    .orElseThrow(() -> new RuntimeException("Next event not found"));
            plotEvent.setNextEvent(nextEvent);
        }
        PlotEvent savedPlotEvent = plotEventRepo.save(plotEvent);
        for(Long tag: tags)
            plotEventService.addTagToPlotEvent(savedPlotEvent.getEventId(), tag, username);
//        story.getPlotEvents().add(savedPlotEvent);
        //storyRepo.save(story);
        return plotEventService.getPlotEventById(savedPlotEvent.getEventId(), username);
    }

    // Helper method to ensure the story exists and belongs to the current user
    Story getStoryByIdAndUser(Long storyId, String username) {
        Story story = storyRepo.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found"));
        if (!story.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized access to story");
        }
        return story;
    }
}
