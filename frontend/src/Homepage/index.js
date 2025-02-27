// src/Homepage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../Services/apiService";
import "./Homepage.css";

const Homepage = () => {
  const [stories, setStories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await apiService.getStories();
        const data = await response.json();
        setStories(data);
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };

    fetchStories();
  }, []);

  const handleStoryClick = (storyId) => {
    navigate(`/story/${storyId}`);
  };

  return (
    <div className="homepage-container">
      <div className="left-panel">
        {stories.map((story) => (
          <div
            key={story.storyId}
            className="story-title"
            onClick={() => handleStoryClick(story.storyId)}
          >
            {story.title}
          </div>
        ))}
      </div>
      <div className="center-panel">
        <p>Select a story from the left to view its plot events.</p>
      </div>
    </div>
  );
};

export default Homepage;
