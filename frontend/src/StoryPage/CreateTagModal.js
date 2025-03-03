import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import apiService from "../Services/apiService";
import "./StoryPage.css";

const CreateTagModal = ({
  show,
  onHide,
  defaultTagTypeId,
  storyId,
  onTagCreated,
}) => {
  const { t } = useTranslation();
  const [tagName, setTagName] = useState("");

  const handleSave = async () => {
    if (!tagName.trim()) return;
    try {
      const response = await apiService.createTag(storyId, {
        tagName,
        tagTypeId: defaultTagTypeId,
      });
      const newTag = await response.json();
      onTagCreated(newTag);
    } catch (error) {
      console.error("Error creating tag:", error);
    }
    setTagName("");
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t("newTagModal.title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formTagName">
            <Form.Label>{t("newTagModal.tagNameLabel")}</Form.Label>
            <Form.Control
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder={t("newTagModal.tagNameLabel")}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t("deleteConfirmation.cancel")}
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {t("newTagModal.save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateTagModal;
