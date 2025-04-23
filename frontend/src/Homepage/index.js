import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
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

  const StoryRow = ({ story }) => {
    const [editing, setEditing] = useState(false);
    const [newTitle, setNewTitle] = useState(story.title);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleRenameSubmit = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const response = await apiService.updateStory(story.storyId, {
          title: newTitle,
          description: story.description,
        });
        const updatedStory = await response.json();
        setStories((prevStories) =>
          prevStories.map((s) =>
            s.storyId === story.storyId ? updatedStory : s
          )
        );
      } catch (error) {
        console.error("Error updating story:", error);
      }
      setEditing(false);
    };

    const handleDeleteConfirm = async (e) => {
      e.stopPropagation();
      setShowDeleteModal(false);
      try {
        await apiService.deleteStory(story.storyId);
        setStories((prevStories) =>
          prevStories.filter((s) => s.storyId !== story.storyId)
        );
      } catch (error) {
        console.error("Error deleting story:", error);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleRenameSubmit(e);
      }
    };

    return (
      <div
        className="story-title"
        onClick={() => {
          if (!editing) handleStoryClick(story.storyId);
        }}
      >
        {editing ? (
          <form onSubmit={handleRenameSubmit} className="rename-form">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
            <button type="submit">Save</button>
          </form>
        ) : (
          <span className="story-text">{story.title}</span>
        )}
        {}
        {!editing && (
          <>
            <span
              className="icon edit-icon"
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
            >
              ✎
            </span>
            <span
              className="icon delete-icon"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
            >
              🗑
            </span>
          </>
        )}

        {}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{t("deleteConfirmation.story.title")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{t("deleteConfirmation.story.body")}</Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              {t("cancel")}
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              {t("deleteConfirmation.confirm")}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  };

  return (
    <div className="homepage-wrapper">
      <Toolbar
        onNewStoryCreated={(newStory) => setStories([...stories, newStory])}
      />
      <div className="homepage-container">
        <div className="left-panel">
          <h3 className="panel-header">{t("homepage.title")}</h3>
          {stories.map((story) => (
            <StoryRow key={story.storyId} story={story} />
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
