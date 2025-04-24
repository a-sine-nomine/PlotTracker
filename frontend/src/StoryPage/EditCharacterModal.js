import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
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
    if (!show) return setImageURL(null);
    (async () => {
      try {
        const resp = await apiService.getCharacterImage(storyId, tagId);
        if (!resp.ok) {
          setImageURL(null);
          return;
        }
        const contentType = resp.headers.get("content-type");

        if (!contentType || contentType === "application/json") {
          setImageURL(null);
          return;
        }
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
          <>
            <div className="form-group">
              <label>{t("character.name")}</label>
              <input
                className="form-control"
                value={characterData.name}
                onChange={(e) => onChangeField("name", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>{t("character.shortDescription")}</label>
              <textarea
                className="form-control"
                rows={3}
                value={characterData.short_description}
                onChange={(e) =>
                  onChangeField("short_description", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>{t("character.description")}</label>
              <textarea
                className="form-control"
                rows={5}
                value={characterData.description}
                onChange={(e) => onChangeField("description", e.target.value)}
              />
            </div>

            {}
            <div className="form-group mt-4">
              <label>{t("character.image")}</label>
              {imageURL && (
                <div className="mb-2">
                  <img
                    src={imageURL}
                    alt="Character"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="form-control mb-2"
                onChange={handleFileChange}
              />
              {uploadError && <Alert variant="danger">{uploadError}</Alert>}
              <Button
                variant="outline-primary"
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
              >
                {uploading
                  ? t("character.uploading", "Uploading…")
                  : t("character.uploadImage", "Upload Image")}
              </Button>
            </div>
          </>
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
