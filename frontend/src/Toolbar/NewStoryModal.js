import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import apiService from "../Services/apiService";

export default function NewStoryModal({ show, onHide, onNewStoryCreated }) {
  const { t } = useTranslation();
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryDescription, setNewStoryDescription] = useState("");

  const handleSave = async () => {
    try {
      const resp = await apiService.createStory({
        title: newStoryTitle,
        description: newStoryDescription,
      });
      const data = await resp.json();
      onNewStoryCreated && onNewStoryCreated(data);
      setNewStoryTitle("");
      setNewStoryDescription("");
      onHide();
    } catch (err) {
      console.error("Error creating new story:", err);
    }
  };

  const handleClose = () => {
    setNewStoryTitle("");
    setNewStoryDescription("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{t("newStoryModal.title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formNewStoryTitle" className="mb-3">
            <Form.Label>{t("newStoryModal.formTitle")}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t("newStoryModal.formTitle")}
              value={newStoryTitle}
              onChange={(e) => setNewStoryTitle(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formNewStoryDescription">
            <Form.Label>{t("newStoryModal.formDescription")}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder={t("newStoryModal.formDescription")}
              value={newStoryDescription}
              onChange={(e) => setNewStoryDescription(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          {t("cancel")}
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {t("save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
