package com.sinenomine.plottracker.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
public class TagType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tag_type_id")
    private Long tagTypeId;

    @Column(nullable = false, length = 50)
    private String name;

//    @OneToMany(mappedBy = "tagType", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<Tag> tags = new ArrayList<>();

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
}