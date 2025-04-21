import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import apiService from "../Services/apiService";
import { useTranslation } from "react-i18next";
import CharacterModal from "./CharacterModal";
import "./StoryPage.css";

const TagRow = ({ tag, tagTypeName, storyId, onTagUpdated, onTagDeleted }) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [newTagName, setNewTagName] = useState(tag.tagName);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isCharacter = tagTypeName === "Character";

  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [characterData, setCharacterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await apiService.updateTag(storyId, tag.tagId, {
        tagName: newTagName,
        tagTypeId: tag.tagTypeId,
      });
      onTagUpdated(response);
    } catch (err) {
      console.error(err);
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

  const openCharacterModal = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getCharacter(storyId, tag.tagId);
      const data = await response.json();
      setCharacterData(data);
      setShowCharacterModal(true);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCharacter = async () => {
    try {
      const updated = await apiService.updateCharacter(storyId, tag.tagId, {
        name: characterData.name,
        short_description: characterData.short_description,
        description: characterData.description,
      });
      onTagUpdated({ ...tag, tagName: updated.name });
      setShowCharacterModal(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleFieldChange = (field, value) => {
    setCharacterData({ ...characterData, [field]: value });
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
          <button type="submit">{t("save")}</button>
        </form>
      ) : (
        <span
          className="item-text"
          onClick={() => isCharacter && openCharacterModal()}
          style={
            isCharacter
              ? { cursor: "pointer", textDecoration: "underline" }
              : {}
          }
        >
          <span
            className="tag-color-indicator"
            style={{ backgroundColor: tag.color }}
          />
          {tag.tagName}
        </span>
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
            {t("cancel")}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t("deleteConfirmation.confirm")}
          </Button>
        </Modal.Footer>
      </Modal>

      {}
      <CharacterModal
        show={showCharacterModal}
        onHide={() => setShowCharacterModal(false)}
        characterData={characterData}
        loading={loading}
        error={error}
        onChangeField={handleFieldChange}
        onSave={handleSaveCharacter}
      />
    </div>
  );
};

export default TagRow;
