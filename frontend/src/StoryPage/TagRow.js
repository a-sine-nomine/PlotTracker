import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import apiService from "../Services/apiService";
import { useTranslation } from "react-i18next";
import EditCharacterModal from "./EditCharacterModal";
import EditTagModal from "./EditTagModal";
import "./StoryPage.css";

const TagRow = ({ tag, tagTypeName, storyId, onTagUpdated, onTagDeleted }) => {
  const { t } = useTranslation();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditCharacterModal, setShowEditCharacterModal] = useState(false);

  const [characterData, setCharacterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isCharacter = tagTypeName === "Character";

  const handleDelete = async () => {
    try {
      await apiService.deleteTag(storyId, tag.tagId);
      onTagDeleted(tag.tagId);
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
    setShowDeleteModal(false);
  };

  const openEditCharacterModal = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getCharacter(storyId, tag.tagId);
      const data = await response.json();
      setCharacterData(data);
      setShowEditCharacterModal(true);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCharacter = async () => {
    try {
      const response = await apiService.updateCharacter(storyId, tag.tagId, {
        name: characterData.name,
        short_description: characterData.short_description,
        description: characterData.description,
      });
      const updatedChar = await response.json();
      onTagUpdated({ ...tag, tagName: updatedChar.name });
      setShowEditCharacterModal(false);
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
      {}
      <span
        className="item-text"
        onClick={() => isCharacter && openEditCharacterModal()}
        style={
          isCharacter ? { cursor: "pointer", textDecoration: "underline" } : {}
        }
      >
        <span
          className="tag-color-indicator"
          style={{ backgroundColor: tag.color }}
        />
        {tag.tagName}
      </span>

      {}
      <span
        className="icon item-edit-icon"
        onClick={(e) => {
          e.stopPropagation();
          setShowEditModal(true);
        }}
      >
        ✎
      </span>

      {}
      <span
        className="icon item-delete-icon"
        onClick={(e) => {
          e.stopPropagation();
          setShowDeleteModal(true);
        }}
      >
        🗑
      </span>

      {}
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
      <EditCharacterModal
        show={showEditCharacterModal}
        onHide={() => setShowEditCharacterModal(false)}
        characterData={characterData}
        loading={loading}
        error={error}
        onChangeField={handleFieldChange}
        onSave={handleSaveCharacter}
      />

      {}
      <EditTagModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        storyId={storyId}
        tag={tag}
        onTagUpdated={onTagUpdated}
      />
    </div>
  );
};

export default TagRow;
