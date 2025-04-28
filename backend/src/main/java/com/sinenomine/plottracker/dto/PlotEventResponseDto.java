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

    @JsonProperty("isInPlot")
    private Boolean isInPlot;

    @JsonProperty("memoryRefId")
    private Long memoryRefId;

    @JsonProperty("prevEventId")
    private Long prevEventId;

    @JsonProperty("tags")
    private List<TagResponseDto> tags;

    public PlotEventResponseDto() {
    }

    public PlotEventResponseDto(String eventType, Long eventId, String title, String date, String description,
                                String content, Boolean isInPlot, Long memoryRefId, Long prevEventId, List<TagResponseDto> tags) {
        this.eventType = eventType;
        this.eventId = eventId;
        this.title = title;
        this.date = date;
        this.description = description;
        this.content = content;
        this.isInPlot = isInPlot;
        this.memoryRefId = memoryRefId;
        this.prevEventId = prevEventId;
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

    public Boolean getInPlot() {
        return isInPlot;
    }

    public void setInPlot(Boolean inPlot) {
        isInPlot = inPlot;
    }

    public Long getMemoryRefId() {
        return memoryRefId;
    }

    public void setMemoryRefId(Long memoryRefId) {
        this.memoryRefId = memoryRefId;
    }

    public Long getPrevEventId() {
        return prevEventId;
    }

    public void setPrevEventId(Long prevEventId) {
        this.prevEventId = prevEventId;
    }

    public List<TagResponseDto> getTags() {
        return tags;
    }

    public void setTags(List<TagResponseDto> tags) {
        this.tags = tags;
    }
}
