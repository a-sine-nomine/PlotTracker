package com.sinenomine.plottracker.service;

import com.sinenomine.plottracker.model.Story;
import com.sinenomine.plottracker.model.Users;
import com.sinenomine.plottracker.repo.StoryRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class StoryService {
    Logger log = LoggerFactory.getLogger(StoryService.class);
    @Autowired
    private StoryRepo storyRepo;


    public Set<Story> findByUser(String username) {
        return storyRepo.findByUser(username);
    }
}
