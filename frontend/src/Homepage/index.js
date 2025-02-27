import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../Services/apiService";
import Toolbar from "../Toolbar";
import { useTranslation } from "react-i18next";
import "./Homepage.css";

const Homepage = () => {
  const [stories, setStories] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchStories = async () => {
    try {
      const response = await apiService.getStories();
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.error("Error fetching stories:", error);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleStoryClick = (storyId) => {
    navigate(`/story/${storyId}`);
  };

  const handleNewStoryCreated = (newStory) => {
    setStories([...stories, newStory]);
  };

  return (
    <div className="homepage-wrapper">
      <Toolbar onNewStoryCreated={handleNewStoryCreated} />
      <div className="homepage-container">
        <div className="left-panel">
          <h3 className="panel-header">{t("homepage.title")}</h3>
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
          <div className="center-hint">{t("homepage.hint")}</div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
