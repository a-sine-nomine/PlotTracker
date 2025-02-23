package com.sinenomine.plottracker.dto;

public class TagTypeResponseDto {

    private Long tagTypeId;
    private String name;

    public TagTypeResponseDto(Long tagTypeId, String name) {
        this.tagTypeId = tagTypeId;
        this.name = name;
    }

    public Long getTagTypeId() {
        return tagTypeId;
    }

    public void setTagTypeId(Long tagTypeId) {
        this.tagTypeId = tagTypeId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
