package com.sinenomine.plottracker.controller;

import com.sinenomine.plottracker.dto.PlotEventRequestDto;
import com.sinenomine.plottracker.dto.PlotEventResponseDto;
import com.sinenomine.plottracker.model.PlotEvent;
import com.sinenomine.plottracker.service.PlotEventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/plotEvents")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"}, allowCredentials = "true")
public class PlotEventController {

    private final PlotEventService plotEventService;

    public PlotEventController(PlotEventService plotEventService) {
        this.plotEventService = plotEventService;
    }

    // GET one plot event by id
    @GetMapping("/{eventId}")
    public ResponseEntity<?> getPlotEvent(@AuthenticationPrincipal UserDetails userDetails,
                                          @PathVariable Long eventId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        PlotEvent event = plotEventService.getPlotEventById(userDetails.getUsername(), eventId);
        PlotEventResponseDto responseDto = plotEventService.convertToDto(event);
        return ResponseEntity.ok(responseDto);
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

        PlotEvent updatedEvent = plotEventService.updatePlotEvent(eventId, plotEventRequestDto, userDetails.getUsername());
        PlotEventResponseDto responseDto = plotEventService.convertToDto(updatedEvent);
        return ResponseEntity.ok(responseDto);
    }

    // DELETE one plot event by id
    @DeleteMapping("/{eventId}")
    public ResponseEntity<?> deletePlotEvent(@AuthenticationPrincipal UserDetails userDetails,
                                             @PathVariable Long eventId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        plotEventService.deletePlotEvent(eventId, userDetails.getUsername());
        return ResponseEntity.ok("Plot event deleted successfully");
    }

    // POST add tag to the plot event
    @PostMapping("/{eventId}/tag/{tagId}")
    public ResponseEntity<?> addTagToPlotEvent(@AuthenticationPrincipal UserDetails userDetails,
                                               @PathVariable Long eventId,
                                               @PathVariable Long tagId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        PlotEvent event = plotEventService.addTagToPlotEvent(eventId, tagId, userDetails.getUsername());
        PlotEventResponseDto responseDto = plotEventService.convertToDto(event);
        return ResponseEntity.ok(responseDto);
    }

    // DELETE remove tag from plot event
    @DeleteMapping("/{eventId}/tag/{tagId}")
    public ResponseEntity<?> removeTagFromPlotEvent(@AuthenticationPrincipal UserDetails userDetails,
                                                    @PathVariable Long eventId,
                                                    @PathVariable Long tagId) {
        if (userDetails == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        PlotEvent event = plotEventService.removeTagFromPlotEvent(eventId, tagId, userDetails.getUsername());
        PlotEventResponseDto responseDto = plotEventService.convertToDto(event);
        return ResponseEntity.ok(responseDto);
    }
}
