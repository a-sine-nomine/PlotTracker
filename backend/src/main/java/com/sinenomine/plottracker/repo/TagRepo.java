package com.sinenomine.plottracker.repo;

import com.sinenomine.plottracker.dto.TagResponseDto;
import com.sinenomine.plottracker.model.Tag;
import com.sinenomine.plottracker.model.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface TagRepo extends JpaRepository<Tag, Long> {
    Set<Tag> findByStory(Story story);

    @Query("SELECT new com.sinenomine.plottracker.dto.TagResponseDto(t.tagId, t.tagName, t.tagType.tagTypeId, t.tagType.name, t.color) " +
            "FROM Tag t WHERE t.story = :story")
    List<TagResponseDto> findByStoryResponses(Story story);
}
