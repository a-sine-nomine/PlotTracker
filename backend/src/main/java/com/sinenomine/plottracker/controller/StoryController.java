package com.sinenomine.plottracker.controller;

import com.sinenomine.plottracker.dto.*;
import com.sinenomine.plottracker.enums.EventType;
import com.sinenomine.plottracker.model.PlotEvent;
import com.sinenomine.plottracker.model.Story;
import com.sinenomine.plottracker.service.PlotEventService;
import com.sinenomine.plottracker.service.StoryService;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
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
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@RestController
@RequestMapping("/api/stories")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"}, allowCredentials = "true")
public class StoryController {
    @Autowired
    private StoryService storyService;

    @Autowired
    private PlotEventService plotEventService;

    // GET all user's stories
    @GetMapping("")
    public ResponseEntity<?> getAllStories(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        String username = userDetails.getUsername();
        List<StoryResponseDto> stories = storyService.findByUser(username);
        return ResponseEntity.ok(stories);
    }

    // POST create a new story for the user
    @PostMapping("")
    public ResponseEntity<?> createStory(@AuthenticationPrincipal UserDetails userDetails,
                                         @Valid @RequestBody StoryRequestDto storyRequestDto, BindingResult bindingResult) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        if (bindingResult.hasErrors())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(bindingResult.getAllErrors());

        String username = userDetails.getUsername();
        Story createdStory = storyService.createStory(username, storyRequestDto);
        createdStory.setUser(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStory);
    }

    // GET a specific story's details by id
    @GetMapping("/{id}")
    public ResponseEntity<?> getStoryDetails(@AuthenticationPrincipal UserDetails userDetails,
                                             @PathVariable Long id) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        String username = userDetails.getUsername();
        Story story = storyService.getStoryDetails(username, id);
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

        String username = userDetails.getUsername();
        Story updatedStory = storyService.updateStory(username, id, storyRequestDto);
        updatedStory.setUser(null);
        return ResponseEntity.ok(updatedStory);
    }

    // DELETE a specific story by id
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStory(@AuthenticationPrincipal UserDetails userDetails,
                                         @PathVariable Long id) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        String username = userDetails.getUsername();
        storyService.deleteStory(username, id);
        return ResponseEntity.ok("Story deleted successfully");
    }

    // GET all plot events for a specific story
    @GetMapping("/{id}/plotevents{sortBy}")
    public ResponseEntity<?> getPlotEvents(@AuthenticationPrincipal UserDetails userDetails,
                                           @PathVariable Long id,
                                           @RequestParam String sortBy) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        String username = userDetails.getUsername();
        Set<PlotEvent> events = storyService.getPlotEvents(username, id);
        List<PlotEventResponseDto> plotEventResponseDtos;
        if (sortBy.equals("story")) {
            PlotEvent firstEvent = events.stream()
                    .filter(e -> e.getPrevEvent() == null)
                    .findFirst()
                    .orElse(null);
            List<PlotEvent> orderedEvents = new ArrayList<>();
            while (firstEvent != null) {
                System.out.println(firstEvent.getEventId());
                orderedEvents.add(firstEvent);
                firstEvent = firstEvent.getNextEvent();
            }
            plotEventResponseDtos = orderedEvents.stream()
                    .map(event -> plotEventService.convertToDto(event))
                    .collect(Collectors.toList());
        } else if (sortBy.equals("date")) {
            plotEventResponseDtos = events.stream()
                    .map(event -> plotEventService.convertToDto(event))
                    .collect(Collectors.toList());
            plotEventResponseDtos.sort(Comparator.comparing(PlotEventResponseDto::getDate));
        } else {
            plotEventResponseDtos = events.stream()
                    .map(event -> plotEventService.convertToDto(event))
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

        String username = userDetails.getUsername();

        PlotEvent plotEvent = new PlotEvent();
        plotEvent.setEventType(EventType.valueOf(plotEventRequestDto.getEventType()));
        plotEvent.setTitle(plotEventRequestDto.getTitle());
        plotEvent.setDate(plotEventRequestDto.getDate());
        plotEvent.setDescription(plotEventRequestDto.getDescription());
        plotEvent.setContent(plotEventRequestDto.getContent());

        PlotEvent createdPlotEvent = storyService.addPlotEventToStory(
                username, id, plotEvent,
                plotEventRequestDto.getMemoryRefId(), plotEventRequestDto.getNextEventId(), plotEventRequestDto.getTags()
        );
        PlotEventResponseDto responseDto = plotEventService.convertToDto(createdPlotEvent);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }


    // export plot events as a DOCX file.
    @GetMapping("/{storyId}/export")
    public ResponseEntity<?> exportPlotEventsAsDocx(@AuthenticationPrincipal UserDetails userDetails,
                                                    @PathVariable Long storyId) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        String username = userDetails.getUsername();
        // Todo: check auth

        Set<PlotEvent> eventSet = storyService.getPlotEvents(username, storyId);
        List<PlotEvent> events = new ArrayList<>(eventSet);
        PlotEvent firstEvent = events.stream()
                .filter(e -> e.getPrevEvent() == null)
                .findFirst()
                .orElse(null);
        if (firstEvent == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No starting event found");
        }
        List<PlotEvent> orderedEvents = new ArrayList<>();
        PlotEvent current = firstEvent;
        while (current != null) {
            orderedEvents.add(current);
            current = current.getNextEvent();
        }

        StringBuilder sb = new StringBuilder();
        for (PlotEvent pe : orderedEvents) {
            if (pe.getContent() != null) {
                sb.append(pe.getContent());
                sb.append("\n\n");
            }
        }
        String finalContent = sb.toString();

        // Create a DOCX document using Apache POI.
        try (XWPFDocument doc = new XWPFDocument();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            XWPFParagraph paragraph = doc.createParagraph();
            XWPFRun run = paragraph.createRun();
            run.setText(finalContent);

            doc.write(baos);
            byte[] docBytes = baos.toByteArray();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
            headers.setContentDispositionFormData("attachment", "plot_events.docx");
            headers.setContentLength(docBytes.length);

            return new ResponseEntity<>(docBytes, headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating document");
        }
    }
}