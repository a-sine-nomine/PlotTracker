package com.sinenomine.plottracker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class StoryResponseDto {

    @JsonProperty("storyId")
    private Long storyId;

    @JsonProperty("title")
    private String title;

    @JsonProperty("description")
    private String description;

    public StoryResponseDto(Long storyId, String title, String description) {
        this.storyId = storyId;
        this.title = title;
        this.description = description;
    }

    public Long getStoryId() {
        return storyId;
    }

    public void setStoryId(Long storyId) {
        this.storyId = storyId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
