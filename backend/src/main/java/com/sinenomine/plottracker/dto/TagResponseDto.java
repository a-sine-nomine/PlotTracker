package com.sinenomine.plottracker.dto;

public class TagResponseDto {
    private Long tagId;
    private String tagName;
    private Long tagTypeId;
    private String tagTypeName;

    // Constructors
    public TagResponseDto() {
    }

    public TagResponseDto(Long tagId, String tagName, Long tagTypeId, String tagTypeName) {
        this.tagId = tagId;
        this.tagName = tagName;
        this.tagTypeId = tagTypeId;
        this.tagTypeName = tagTypeName;
    }

    public Long getTagId() {
        return tagId;
    }

    public void setTagId(Long tagId) {
        this.tagId = tagId;
    }

    public String getTagName() {
        return tagName;
    }

    public void setTagName(String tagName) {
        this.tagName = tagName;
    }

    public Long getTagTypeId() {
        return tagTypeId;
    }

    public void setTagTypeId(Long tagTypeId) {
        this.tagTypeId = tagTypeId;
    }

    public String getTagTypeName() {
        return tagTypeName;
    }

    public void setTagTypeName(String tagTypeName) {
        this.tagTypeName = tagTypeName;
    }
}
