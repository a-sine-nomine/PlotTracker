package com.sinenomine.plottracker.model;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
public class Story {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "story_id")
    private Long storyId;

    @Column(nullable = false)
    private String title;

    private String description;

    private String dateFormat;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

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

    public String getDateFormat() {
        return dateFormat;
    }

    public void setDateFormat(String dateFormat) {
        this.dateFormat = dateFormat;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Story)) return false;
        Story story = (Story) o;
        return storyId.equals(story.storyId) && user.equals(story.user);
    }

    @Override
    public int hashCode() {
        return Objects.hash(storyId, user);
    }
}