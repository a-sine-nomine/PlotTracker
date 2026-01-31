import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import apiService from "../Services/apiService";
import Toolbar from "../Toolbar";
import { useTranslation } from "react-i18next";
import EditStoryModal from "../Modals/EditStoryModal";
import "./Homepage.css";

const Homepage = () => {
  const [stories, setStories] = useState([]);
  const [deleteStory, setDeleteStory] = useState(null);
  const [editStory, setEditStory] = useState(null);
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

  const handleDeleteConfirm = async () => {
    try {
      await apiService.deleteStory(deleteStory.storyId);
      setStories((prev) =>
        prev.filter((s) => s.storyId !== deleteStory.storyId)
      );
    } catch (error) {
      console.error("Error deleting story:", error);
    }
    setDeleteStory(null);
  };

  return (
    <div className="homepage-wrapper">
      <Toolbar
        onNewStoryCreated={(newStory) =>
          setStories((prev) => [...prev, newStory])
        }
      />

      <div className="homepage-container">
        <div className="left-panel">
          <h3 className="panel-header">{t("homepage.title")}</h3>
          {stories.map((story) => (
            <div
              key={story.storyId}
              className="story-title"
              onClick={() => handleStoryClick(story.storyId)}
            >
              {}
              <span className="story-text">{story.title}</span>

              {}
              <span
                className="icon edit-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditStory(story);
                }}
              >
                ✎
              </span>

              {}
              <span
                className="icon delete-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteStory(story);
                }}
              >
                🗑
              </span>
            </div>
          ))}
        </div>

        <div className="center-panel">
          <div className="center-hint">{t("homepage.hint")}</div>
        </div>
      </div>

      {}
      <Modal show={!!deleteStory} onHide={() => setDeleteStory(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("deleteConfirmation.story.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("deleteConfirmation.story.body")}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteStory(null)}>
            {t("cancel")}
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            {t("deleteConfirmation.confirm")}
          </Button>
        </Modal.Footer>
      </Modal>

      {}
      <EditStoryModal
        show={!!editStory}
        story={editStory}
        onHide={() => setEditStory(null)}
        onStoryUpdated={(updated) => {
          setStories((prev) =>
            prev.map((s) => (s.storyId === updated.storyId ? updated : s))
          );
          setEditStory(null);
        }}
      />
    </div>
  );
};

export default Homepage;
