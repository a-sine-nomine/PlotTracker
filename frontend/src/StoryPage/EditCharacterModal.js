import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner, Alert, Row, Col, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import apiService from "../Services/apiService";
import "./StoryPage.css";

const EditCharacterModal = ({
  show,
  onHide,
  storyId,
  tagId,
  characterData,
  loading,
  error,
  onChangeField,
  onSave,
}) => {
  const { t } = useTranslation();

  const [imageURL, setImageURL] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    if (!show) {
      setImageURL(null);
      return;
    }
    (async () => {
      try {
        const resp = await apiService.getCharacterImage(storyId, tagId);
        if (!resp.ok) return;
        const blob = await resp.blob();
        setImageURL(URL.createObjectURL(blob));
      } catch (err) {
        console.error("Error fetching character image:", err);
      }
    })();
  }, [show, storyId, tagId]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0] || null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      await apiService.uploadCharacterImage(storyId, tagId, selectedFile);
      const resp = await apiService.getCharacterImage(storyId, tagId);
      const blob = await resp.blob();
      setImageURL(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{t("character.details")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && <Spinner animation="border" />}
        {error && <Alert variant="danger">{error}</Alert>}

        {characterData && (
          <Form>
            <Row>
              {}
              <Col md={8}>
                <Form.Group controlId="formCharacterName" className="mb-3">
                  <Form.Label>{t("character.name")}</Form.Label>
                  <Form.Control
                    type="text"
                    value={characterData.name}
                    onChange={(e) => onChangeField("name", e.target.value)}
                  />
                </Form.Group>

                <Form.Group
                  controlId="formCharacterShortDescription"
                  className="mb-3"
                >
                  <Form.Label>{t("character.shortDescription")}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={characterData.short_description}
                    onChange={(e) =>
                      onChangeField("short_description", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>

              {}
              <Col md={4} className="d-flex flex-column align-items-center">
                {imageURL ? (
                  <img
                    src={imageURL}
                    alt="Character"
                    className="character-image-preview"
                  />
                ) : (
                  <div className="character-image-placeholder">
                    {t("character.noImage", "No Image")}
                  </div>
                )}

                <Form.Group controlId="formCharacterImage" className="w-100">
                  <Form.Label>{}</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Form.Group>
                {uploadError && (
                  <Alert variant="danger" className="w-100 mt-2">
                    {uploadError}
                  </Alert>
                )}
                <Button
                  variant="outline-primary"
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile}
                  className="mt-2 w-100"
                >
                  {uploading
                    ? t("character.uploading", "Uploading…")
                    : t("character.uploadImage", "Upload Image")}
                </Button>
              </Col>
            </Row>

            {}
            <Form.Group controlId="formCharacterDescription" className="mt-4">
              <Form.Label>{t("character.description")}</Form.Label>
              <Form.Control
                as="textarea"
                rows={7}
                value={characterData.description}
                onChange={(e) => onChangeField("description", e.target.value)}
              />
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t("cancel")}
        </Button>
        <Button variant="primary" onClick={onSave} disabled={loading}>
          {t("save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditCharacterModal;
