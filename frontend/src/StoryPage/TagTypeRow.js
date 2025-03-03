import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import CreateTagModal from "./CreateTagModal";
import TagRow from "./TagRow";
import apiService from "../Services/apiService";
import "./StoryPage.css";

const TagTypeRow = ({
  tagType,
  tags,
  isOpen,
  onToggle,
  storyId,
  onTagTypeUpdated,
  onTagTypeDeleted,
  onTagUpdated,
  onTagDeleted,
}) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(tagType.name);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await apiService.updateTagType(
        storyId,
        tagType.tagTypeId,
        { name: newName }
      );
      const updatedTagType = await response.json();
      onTagTypeUpdated(updatedTagType);
    } catch (error) {
      console.error("Error updating tag type:", error);
    }
    setEditing(false);
  };

  const handleDelete = async () => {
    try {
      await apiService.deleteTagType(storyId, tagType.tagTypeId);
      onTagTypeDeleted(tagType.tagTypeId);
    } catch (error) {
      console.error("Error deleting tag type:", error);
    }
    setShowDeleteModal(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRenameSubmit(e);
  };

  const handleTagCreated = (newTag) => {
    onTagUpdated(newTag);
  };

  return (
    <div className="tag-type-group">
      <div className="item-row" onClick={onToggle}>
        {editing ? (
          <form onSubmit={handleRenameSubmit} className="item-rename-form">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button type="submit">Save</button>
          </form>
        ) : (
          <span className="item-text">{tagType.name}</span>
        )}
        {!editing && (
          <>
            <span
              className="icon item-plus-icon"
              onClick={(e) => {
                e.stopPropagation();
                setShowCreateTagModal(true);
              }}
            >
              ＋
            </span>
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
      </div>
      {isOpen && (
        <div className="tags-list">
          {tags.map((tag) => (
            <TagRow
              key={tag.tagId}
              tag={tag}
              storyId={storyId}
              onTagUpdated={onTagUpdated}
              onTagDeleted={onTagDeleted}
            />
          ))}
        </div>
      )}
      {showDeleteModal && (
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{t("deleteConfirmation.tagType.title")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{t("deleteConfirmation.tagType.body")}</Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              {t("deleteConfirmation.cancel")}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              {t("deleteConfirmation.confirm")}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      {showCreateTagModal && (
        <CreateTagModal
          show={showCreateTagModal}
          onHide={() => setShowCreateTagModal(false)}
          defaultTagTypeId={tagType.tagTypeId}
          storyId={storyId}
          onTagCreated={handleTagCreated}
        />
      )}
    </div>
  );
};

export default TagTypeRow;
