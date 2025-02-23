package com.sinenomine.plottracker.controller;

import com.sinenomine.plottracker.dto.PlotEventRequestDto;
import com.sinenomine.plottracker.dto.PlotEventResponseDto;
import com.sinenomine.plottracker.model.PlotEvent;
import com.sinenomine.plottracker.service.PlotEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/plotEvents")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"}, allowCredentials = "true")
public class PlotEventController {

    @Autowired
    private PlotEventService plotEventService;

    // GET one plot event by id
    @GetMapping("/{eventId}")
    public ResponseEntity<?> getPlotEvent(@AuthenticationPrincipal UserDetails userDetails,
                                          @PathVariable Long eventId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        try {
            PlotEvent event = plotEventService.getPlotEventById(eventId, userDetails.getUsername());
            PlotEventResponseDto responseDto = plotEventService.convertToDto(event);
            return ResponseEntity.ok(responseDto);
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("Unauthorized")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    // PUT update one plot event by id
    @PutMapping("/{eventId}")
    public ResponseEntity<?> updatePlotEvent(@AuthenticationPrincipal UserDetails userDetails,
                                             @PathVariable Long eventId,
                                             @Valid @RequestBody PlotEventRequestDto plotEventRequestDto,
                                             BindingResult bindingResult) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        if (bindingResult.hasErrors())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(bindingResult.getAllErrors());
        try {
            PlotEvent updatedEvent = plotEventService.updatePlotEvent(eventId, plotEventRequestDto, userDetails.getUsername());
            PlotEventResponseDto responseDto = plotEventService.convertToDto(updatedEvent);
            return ResponseEntity.ok(responseDto);
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("Unauthorized")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    // DELETE one plot event by id
    @DeleteMapping("/{eventId}")
    public ResponseEntity<?> deletePlotEvent(@AuthenticationPrincipal UserDetails userDetails,
                                             @PathVariable Long eventId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        try {
            plotEventService.deletePlotEvent(eventId, userDetails.getUsername());
            return ResponseEntity.ok("Plot event deleted successfully");
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("Unauthorized")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    // POST add tag to the plot event
    @PostMapping("/{eventId}/tag/{tagId}")
    public ResponseEntity<?> addTagToPlotEvent(@AuthenticationPrincipal UserDetails userDetails,
                                               @PathVariable Long eventId,
                                               @PathVariable Long tagId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        try {
            PlotEvent event = plotEventService.addTagToPlotEvent(eventId, tagId, userDetails.getUsername());
            PlotEventResponseDto responseDto = plotEventService.convertToDto(event);
            return ResponseEntity.ok(responseDto);
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("Unauthorized")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    // DELETE remove tag from plot event
    @DeleteMapping("/{eventId}/tag/{tagId}")
    public ResponseEntity<?> removeTagFromPlotEvent(@AuthenticationPrincipal UserDetails userDetails,
                                                    @PathVariable Long eventId,
                                                    @PathVariable Long tagId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        try {
            PlotEvent event = plotEventService.removeTagFromPlotEvent(eventId, tagId, userDetails.getUsername());
            PlotEventResponseDto responseDto = plotEventService.convertToDto(event);
            return ResponseEntity.ok(responseDto);
        } catch (RuntimeException ex) {
            if (ex.getMessage().contains("Unauthorized")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }
}