package com.sinenomine.plottracker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CharacterResponseDto {

    @JsonProperty("character_id")
    private Long characterId;

    @JsonProperty("name")
    private String name;

    @JsonProperty("short_description")
    private String shortDescription;

    @JsonProperty("description")
    private String description;

    public CharacterResponseDto(Long characterId, String name, String shortDescription, String description) {
        this.characterId = characterId;
        this.name = name;
        this.shortDescription = shortDescription;
        this.description = description;
    }

    public Long getCharacterId() {
        return characterId;
    }

    public void setCharacterId(Long characterId) {
        this.characterId = characterId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
