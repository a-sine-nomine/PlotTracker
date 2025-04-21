import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import CreateTagModal from "./CreateTagModal";
import TagRow from "./TagRow";
import apiService from "../Services/apiService";
import "./StoryPage.css";

const NON_EDITABLE = ["Character", "Location", "Plot line"];

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

  const isNonEditable = NON_EDITABLE.includes(tagType.name);
  const displayName = isNonEditable
    ? t(`tagTypeRow.${tagType.name}`)
    : tagType.name;

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

  const handleTagCreated = (newTag) => onTagUpdated(newTag);
  const handleKeyDown = (e) => e.key === "Enter" && handleRenameSubmit(e);

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
            <button type="submit">{t("save")}</button>
          </form>
        ) : (
          <span className="item-text">{displayName}</span>
        )}
        {!editing && (
          <>
            <span
              className="icon item-plus-icon"
              style={{ opacity: 0 }} //todo change
              onClick={(e) => {
                //e.stopPropagation();
                //setShowCreateTagModal(true);
              }}
            >
              ＋
            </span>
            <span
              className="icon item-edit-icon"
              style={
                isNonEditable ? { opacity: 0.5, cursor: "not-allowed" } : {}
              }
              onClick={(e) => {
                e.stopPropagation();
                !isNonEditable && setEditing(true);
              }}
            >
              ✎
            </span>
            <span
              className="icon item-delete-icon"
              style={
                isNonEditable ? { opacity: 0.5, cursor: "not-allowed" } : {}
              }
              onClick={(e) => {
                e.stopPropagation();
                !isNonEditable && setShowDeleteModal(true);
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
              tagTypeName={tagType.name}
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
              {t("cancel")}
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
