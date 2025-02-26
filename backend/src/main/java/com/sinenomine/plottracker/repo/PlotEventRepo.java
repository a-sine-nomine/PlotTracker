package com.sinenomine.plottracker.repo;

import com.sinenomine.plottracker.model.PlotEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface PlotEventRepo extends JpaRepository<PlotEvent, Long> {
    @Query("select p from PlotEvent p where p.story.storyId = :storyId")
    Set<PlotEvent> findByStory(Long storyId);

//    @Query("select new com.sinenomine.plottracker.dto.PlotEventResponseDto(p.getEventType().getName(), p.eventId, p.title, p.date, p.description, p.content, p.memoryRef, p.nextEvent) from PlotEvent p where p.story.storyId = :storyId")
//    List<PlotEvent> findByStoryResponse(Long storyId);
}