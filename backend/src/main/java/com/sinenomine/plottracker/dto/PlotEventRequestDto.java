package com.sinenomine.plottracker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

import java.util.Set;

public class PlotEventRequestDto {

    @NotBlank(message = "Event type is required")
    @JsonProperty("eventType")
    private String eventType;

    @NotBlank(message = "Title is required")
    @JsonProperty("title")
    private String title;

    @JsonProperty("date")
    private String date;

    @JsonProperty("description")
    private String description;

    @JsonProperty("content")
    private String content;

    @JsonProperty("memoryRefId")
    private Long memoryRefId;

    @JsonProperty("nextEventId")
    private Long nextEventId;

    @JsonProperty("tags")
    private Set<Long> tags;

    // Getters and setters

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getMemoryRefId() {
        return memoryRefId;
    }

    public void setMemoryRefId(Long memoryRefId) {
        this.memoryRefId = memoryRefId;
    }

    public Long getNextEventId() {
        return nextEventId;
    }

    public void setNextEventId(Long nextEventId) {
        this.nextEventId = nextEventId;
    }

    public Set<Long> getTags() {
        return tags;
    }

    public void setTags(Set<Long> tags) {
        this.tags = tags;
    }
}
