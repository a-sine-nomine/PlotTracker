package com.sinenomine.plottracker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class TagRequestDto {
    @NotBlank(message = "Tag name is required")
    @Size(max = 100, message = "Tag name must be at most 100 characters")
    @JsonProperty("tagName")
    private String tagName;

    @JsonProperty("color")
    private String color;

    @NotNull(message = "Tag type id is required")
    @JsonProperty("tagTypeId")
    private Long tagTypeId;

    public String getTagName() {
        return tagName;
    }

    public void setTagName(String tagName) {
        this.tagName = tagName;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Long getTagTypeId() {
        return tagTypeId;
    }

    public void setTagTypeId(Long tagTypeId) {
        this.tagTypeId = tagTypeId;
    }
}
