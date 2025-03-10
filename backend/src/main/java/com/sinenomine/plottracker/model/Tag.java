package com.sinenomine.plottracker.model;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tag_id")
    private Long tagId;

    @ManyToOne
    @JoinColumn(name = "story_id", nullable = false)
    private Story story;

    @Column(name = "tag_name", nullable = false, length = 100)
    private String tagName;

    @Column(name = "color", nullable = false, length = 7)
    private String color;

    // Relationship to TagType
    @ManyToOne
    @JoinColumn(name = "tag_type_id", nullable = false)
    private TagType tagType;

    @ManyToMany(mappedBy = "tags")
    private Set<PlotEvent> plotEvents = new HashSet<>();

    public Tag() {
    }

    public Tag(String tagName, TagType tagType, String color) {
        this.tagName = tagName;
        this.tagType = tagType;
        this.color = color;
    }

    public Long getTagId() {
        return tagId;
    }

    public void setTagId(Long tagId) {
        this.tagId = tagId;
    }

    public Story getStory() {
        return story;
    }

    public void setStory(Story story) {
        this.story = story;
    }

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

    public TagType getTagType() {
        return tagType;
    }

    public void setTagType(TagType tagType) {
        this.tagType = tagType;
    }

    public Set<PlotEvent> getPlotEvents() {
        return plotEvents;
    }

    public void setPlotEvents(Set<PlotEvent> plotEvents) {
        this.plotEvents = plotEvents;
    }
}