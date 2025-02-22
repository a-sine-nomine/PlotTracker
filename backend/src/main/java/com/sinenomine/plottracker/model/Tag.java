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

    @Column(name = "tag_name", nullable = false, length = 100)
    private String tagName;

    // Relationship to TagType
    @ManyToOne
    @JoinColumn(name = "tag_type_id", nullable = false)
    private TagType tagType;

    @ManyToMany(mappedBy = "tags")
    private Set<PlotEvent> plotEvents = new HashSet<>();

    public Tag() {
    }

    public Tag(String tagName, TagType tagType) {
        this.tagName = tagName;
        this.tagType = tagType;
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