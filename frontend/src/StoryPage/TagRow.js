import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import apiService from "../Services/apiService";
import { useTranslation } from "react-i18next";
import "./StoryPage.css";

const TagRow = ({ tag, storyId, onTagUpdated, onTagDeleted }) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [newTagName, setNewTagName] = useState(tag.tagName);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await apiService.updateTag(storyId, tag.tagId, {
        tagName: newTagName,
        tagTypeId: tag.tagTypeId,
      });
      const updatedTag = await response.json();
      onTagUpdated(updatedTag);
    } catch (error) {
      console.error("Error updating tag:", error);
    }
    setEditing(false);
  };

  const handleDelete = async () => {
    try {
      await apiService.deleteTag(storyId, tag.tagId);
      onTagDeleted(tag.tagId);
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
    setShowDeleteModal(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRenameSubmit(e);
  };

  return (
    <div className="item-row" onClick={(e) => e.stopPropagation()}>
      {editing ? (
        <form onSubmit={handleRenameSubmit} className="item-rename-form">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button type="submit">Save</button>
        </form>
      ) : (
        <span className="item-text">{tag.tagName}</span>
      )}
      {!editing && (
        <>
          <span
            className="icon item-edit-icon"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
          >
            ✎
          </span>
          <span
            className="icon item-delete-icon"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(true);
            }}
          >
            🗑
          </span>
        </>
      )}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("deleteConfirmation.tag.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("deleteConfirmation.tag.body")}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            {t("deleteConfirmation.cancel")}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t("deleteConfirmation.confirm")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TagRow;
