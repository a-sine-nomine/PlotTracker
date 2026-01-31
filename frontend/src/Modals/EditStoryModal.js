import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import apiService from "../Services/apiService";

export default function EditStoryModal({
  show,
  onHide,
  story,
  onStoryUpdated,
}) {
  const { t } = useTranslation();

  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  useEffect(() => {
    if (story) {
      setEditedTitle(story.title || "");
      setEditedDescription(story.description || "");
    }
  }, [story, show]);

  const handleSave = async () => {
    try {
      const response = await apiService.updateStory(story.storyId, {
        title: editedTitle,
        description: editedDescription,
      });
      const data = await response.json();
      onStoryUpdated && onStoryUpdated(data);
      setEditedTitle("");
      setEditedDescription("");
      onHide();
    } catch (err) {
      console.error("Error updating story:", err);
    }
  };

  const handleClose = () => {
    setEditedTitle("");
    setEditedDescription("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{t("editStoryModal.title", "Edit Story")}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group controlId="formEditStoryTitle" className="mb-3">
            <Form.Label>{t("editStoryModal.formTitle", "Title")}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t("editStoryModal.formTitle", "Title")}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formEditStoryDescription">
            <Form.Label>
              {t("editStoryModal.formDescription", "Description")}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder={t("editStoryModal.formDescription", "Description")}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          {t("cancel", "Cancel")}
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {t("save", "Save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
