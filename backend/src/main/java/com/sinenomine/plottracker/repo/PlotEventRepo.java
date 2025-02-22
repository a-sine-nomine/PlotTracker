package com.sinenomine.plottracker.repo;

import com.sinenomine.plottracker.model.PlotEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface PlotEventRepo extends JpaRepository<PlotEvent, Long> {
    @Query("select p from PlotEvent p where p.story.storyId = :storyId")
    Set<PlotEvent> findByStory(Long storyId);
}