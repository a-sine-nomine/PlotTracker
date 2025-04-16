package com.sinenomine.plottracker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class PlotEventResponseDto {

    @JsonProperty("eventType")
    private String eventType;

    @JsonProperty("eventId")
    private Long eventId;

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
    private List<TagResponseDto> tags;

    public PlotEventResponseDto() {
    }

    public PlotEventResponseDto(String eventType, Long eventId, String title, String date, String description,
                                String content, Long memoryRefId, Long nextEventId, List<TagResponseDto> tags) {
        this.eventType = eventType;
        this.eventId = eventId;
        this.title = title;
        this.date = date;
        this.description = description;
        this.content = content;
        this.memoryRefId = memoryRefId;
        this.nextEventId = nextEventId;
        this.tags = tags;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
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

    public List<TagResponseDto> getTags() {
        return tags;
    }

    public void setTags(List<TagResponseDto> tags) {
        this.tags = tags;
    }
}
