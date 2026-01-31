package com.sinenomine.plottracker.controller;

import com.sinenomine.plottracker.dto.*;
import com.sinenomine.plottracker.enums.EventType;
import com.sinenomine.plottracker.model.PlotEvent;
import com.sinenomine.plottracker.model.Story;
import com.sinenomine.plottracker.service.PlotEventService;
import com.sinenomine.plottracker.service.StoryService;
import com.sinenomine.plottracker.service.TagService;
import org.springframework.http.HttpHeaders;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stories")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"}, allowCredentials = "true")
public class StoryController {

    private final StoryService storyService;
    private final PlotEventService plotEventService;
    private final TagService tagService;

    public StoryController(StoryService storyService, PlotEventService plotEventService, TagService tagService) {
        this.storyService = storyService;
        this.plotEventService = plotEventService;
        this.tagService = tagService;
    }

    // GET all user's stories
    @GetMapping("")
    public ResponseEntity<?> getAllStories(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        List<StoryResponseDto> stories = storyService.findByUser(userDetails.getUsername());
        return ResponseEntity.ok(stories);
    }

    // POST create a new story for the user
    @PostMapping("")
    public ResponseEntity<?> createStory(@AuthenticationPrincipal UserDetails userDetails,
                                         @Valid @RequestBody StoryRequestDto storyRequestDto,
                                         BindingResult bindingResult) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        if (bindingResult.hasErrors())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(bindingResult.getAllErrors());

        Story createdStory = storyService.createStory(userDetails.getUsername(), storyRequestDto);

        TagTypeRequestDto tagTypeRequestDto = new TagTypeRequestDto();
        tagTypeRequestDto.setName("Character");
        tagService.createTagType(createdStory.getStoryId(), tagTypeRequestDto, userDetails.getUsername());
        tagTypeRequestDto.setName("Plot line");
        tagService.createTagType(createdStory.getStoryId(), tagTypeRequestDto, userDetails.getUsername());
        tagTypeRequestDto.setName("Location");
        tagService.createTagType(createdStory.getStoryId(), tagTypeRequestDto, userDetails.getUsername());

        createdStory.setUser(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStory);
    }

    // GET a specific story's details by id
    @GetMapping("/{id}")
    public ResponseEntity<?> getStoryDetails(@AuthenticationPrincipal UserDetails userDetails,
                                             @PathVariable Long id) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        Story story = storyService.getStoryDetails(userDetails.getUsername(), id);
        story.setUser(null);
        return ResponseEntity.ok(story);
    }

    // PUT update a specific story by id
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStory(@AuthenticationPrincipal UserDetails userDetails,
                                         @PathVariable Long id,
                                         @Valid @RequestBody StoryRequestDto storyRequestDto,
                                         BindingResult bindingResult) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        if (bindingResult.hasErrors())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(bindingResult.getAllErrors());

        Story updatedStory = storyService.updateStory(userDetails.getUsername(), id, storyRequestDto);
        updatedStory.setUser(null);
        return ResponseEntity.ok(updatedStory);
    }

    // DELETE a specific story by id
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStory(@AuthenticationPrincipal UserDetails userDetails,
                                         @PathVariable Long id) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        storyService.deleteStory(userDetails.getUsername(), id);
        return ResponseEntity.ok("Story deleted successfully");
    }

    // GET all plot events for a specific story with optional sorting
    @GetMapping("/{id}/plotevents")
    public ResponseEntity<?> getPlotEvents(@AuthenticationPrincipal UserDetails userDetails,
                                           @PathVariable Long id,
                                           @RequestParam(name = "sortBy", required = false, defaultValue = "default") String sortBy) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        Set<PlotEvent> events = storyService.getPlotEvents(userDetails.getUsername(), id);
        List<PlotEventResponseDto> plotEventResponseDtos;

        if ("story".equalsIgnoreCase(sortBy)) {
            PlotEvent firstEvent = events.stream()
                    .filter(e -> e.getInPlot() && e.getPrevEvent() == null)
                    .findFirst()
                    .orElse(null);
            List<PlotEvent> orderedEvents = new ArrayList<>();
            while (firstEvent != null) {
                orderedEvents.add(firstEvent);
                firstEvent = firstEvent.getNextEvent();
            }
            plotEventResponseDtos = orderedEvents.stream()
                    .map(plotEventService::convertToDto)
                    .collect(Collectors.toList());
        } else if ("date".equalsIgnoreCase(sortBy)) {
            plotEventResponseDtos = events.stream()
                    .filter(e -> e.getDate() == null)
                    .map(plotEventService::convertToDto)
                    .collect(Collectors.toList());

            plotEventResponseDtos.addAll(events.stream()
                    .filter(e -> e.getDate() != null)
                    .map(plotEventService::convertToDto)
                    .sorted(Comparator.comparing(PlotEventResponseDto::getDate))
                    .toList());
        } else {
            plotEventResponseDtos = events.stream()
                    .map(plotEventService::convertToDto)
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(plotEventResponseDtos);
    }

    // POST add a new plot event to the user's story
    @PostMapping("/{id}/plotevents")
    public ResponseEntity<?> addPlotEvent(@AuthenticationPrincipal UserDetails userDetails,
                                          @PathVariable Long id,
                                          @Valid @RequestBody PlotEventRequestDto plotEventRequestDto,
                                          BindingResult bindingResult) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        if (bindingResult.hasErrors())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(bindingResult.getAllErrors());

        PlotEvent plotEvent = new PlotEvent();
        plotEvent.setEventType(EventType.valueOf(plotEventRequestDto.getEventType()));
        plotEvent.setTitle(plotEventRequestDto.getTitle());
        plotEvent.setDate(plotEventRequestDto.getDate());
        plotEvent.setDescription(plotEventRequestDto.getDescription());
        plotEvent.setContent(plotEventRequestDto.getContent());
        plotEvent.setInPlot(plotEventRequestDto.getInPlot());

        PlotEvent createdPlotEvent = storyService.addPlotEventToStory(
                userDetails.getUsername(),
                id,
                plotEvent,
                plotEventRequestDto.getMemoryRefId(),
                plotEventRequestDto.getPrevEventId(),
                plotEventRequestDto.getTags()
        );
        PlotEventResponseDto responseDto = plotEventService.convertToDto(createdPlotEvent);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    // GET export plot events as a DOCX file
    @GetMapping("/{storyId}/export")
    public ResponseEntity<?> exportPlotEventsAsDocx(@AuthenticationPrincipal UserDetails userDetails,
                                                    @PathVariable Long storyId,
                                                    @RequestParam(name = "as", required = false, defaultValue = "novella") String as) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        byte[] docBytes = storyService.exportPlotEventsAsDocx(userDetails.getUsername(), storyId, as);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
        headers.setContentDispositionFormData("attachment", "plot_events.docx");
        headers.setContentLength(docBytes.length);
        return new ResponseEntity<>(docBytes, headers, HttpStatus.OK);
    }
}
