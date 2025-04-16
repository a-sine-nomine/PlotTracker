package com.sinenomine.plottracker.model;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
public class TagType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tag_type_id")
    private Long tagTypeId;

    @Column(nullable = false, length = 50)
    private String name;

    @ManyToOne
    @JoinColumn(name = "story_id", nullable = false)
    private Story story;

    public TagType() {
    }

    public TagType(String name) {
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

    public Story getStory() {
        return story;
    }

    public void setStory(Story story) {
        this.story = story;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TagType)) return false;
        TagType tagType = (TagType) o;
        return tagTypeId.equals(tagType.tagTypeId) && Objects.equals(story, tagType.story);
    }

    @Override
    public int hashCode() {
        return Objects.hash(tagTypeId, story);
    }
}
