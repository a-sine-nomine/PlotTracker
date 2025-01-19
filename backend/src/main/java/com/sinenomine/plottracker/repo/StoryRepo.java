package com.sinenomine.plottracker.repo;

import com.sinenomine.plottracker.model.Story;
import com.sinenomine.plottracker.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Set;
public interface StoryRepo extends JpaRepository<Story, Long> {

    @Query("select s from Story s where s.user.username = :username")
    Set<Story> findByUser(String username);
}
