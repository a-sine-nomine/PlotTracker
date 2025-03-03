package com.sinenomine.plottracker.dto;

public class StoryResponseDto {

    private Long StoryId;
    private String title;

    private String description;

    public StoryResponseDto(Long storyId, String title, String description) {
        StoryId = storyId;
        this.title = title;
        this.description = description;
    }

    public Long getStoryId() {
        return StoryId;
    }

    public void setStoryId(Long storyId) {
        StoryId = storyId;
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
