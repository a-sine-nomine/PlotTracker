import React, { useState, useEffect } from "react";
import { Navbar, Nav, Dropdown, Modal, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import apiService from "../Services/apiService";
import { useTranslation } from "react-i18next";
import "./Toolbar.css";

const Toolbar = ({ onNewStoryCreated }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [showNewStoryModal, setShowNewStoryModal] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryDescription, setNewStoryDescription] = useState("");

  const [showAboutModal, setShowAboutModal] = useState(false);

  const [showNewTagModal, setShowNewTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedStoryId, setSelectedStoryId] = useState("");
  const [selectedTagTypeId, setSelectedTagTypeId] = useState("");
  const [tagTypes, setTagTypes] = useState([]);
  const [userStories, setUserStories] = useState([]);

  useEffect(() => {
    const fetchUserStories = async () => {
      try {
        const response = await apiService.getStories();
        const data = await response.json();
        setUserStories(data);
        if (data.length > 0) {
          setSelectedStoryId(data[0].storyId);
        }
      } catch (error) {
        console.error("Error fetching user stories:", error);
      }
    };
    fetchUserStories();
  }, []);

  useEffect(() => {
    const fetchTagTypes = async () => {
      if (!selectedStoryId) return;
      try {
        const response = await apiService.getTagTypes(selectedStoryId);
        const data = await response.json();
        setTagTypes(data);
        if (data.length > 0) {
          setSelectedTagTypeId(data[0].tagTypeId);
        }
      } catch (error) {
        console.error("Error fetching tag types:", error);
      }
    };
    fetchTagTypes();
  }, [selectedStoryId]);

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ru" : "en";
    i18n.changeLanguage(newLang);
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
    navigate("/login");
  };

  const handleSaveNewStory = async () => {
    try {
      const storyDto = {
        title: newStoryTitle,
        description: newStoryDescription,
      };
      const response = await apiService.createStory(storyDto);
      const data = await response.json();
      if (onNewStoryCreated) {
        onNewStoryCreated(data);
      }
      setNewStoryTitle("");
      setNewStoryDescription("");
      setShowNewStoryModal(false);
    } catch (error) {
      console.error("Error creating new story:", error);
    }
  };

  const handleSaveNewTag = async () => {
    try {
      const tagDto = {
        tagName: newTagName,
        tagTypeId: selectedTagTypeId,
      };
      const response = await apiService.createTag(selectedStoryId, tagDto);
      const data = await response.json();
      console.log("New tag created:", data);
      setNewTagName("");
      setShowNewTagModal(false);
    } catch (error) {
      console.error("Error creating new tag:", error);
    }
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="toolbar">
        <Navbar.Brand className="ms-3">{t("toolbar.brand")}</Navbar.Brand>
        <Nav className="me-auto">
          <Dropdown>
            <Dropdown.Toggle variant="light" id="dropdown-file">
              {t("toolbar.file")}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setShowNewStoryModal(true)}>
                {t("toolbar.newStory")}
              </Dropdown.Item>
              <Dropdown.Item disabled>{t("toolbar.newEvent")}</Dropdown.Item>
              <Dropdown.Item onClick={() => setShowNewTagModal(true)}>
                {t("toolbar.newTag")}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown className="ms-3">
            <Dropdown.Toggle variant="light" id="dropdown-help">
              {t("toolbar.help")}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => window.open("https://github.com/", "_blank")}
              >
                {t("toolbar.documentation")}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setShowAboutModal(true)}>
                {t("toolbar.about")}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>

        <Nav className="ms-auto me-3">
          <Button
            variant="link"
            className="language-toggle"
            onClick={toggleLanguage}
          >
            {i18n.language === "en" ? "en" : "ру"}
          </Button>
          <Button variant="outline-secondary" onClick={handleLogout}>
            {t("toolbar.logOut")}
          </Button>
        </Nav>
      </Navbar>

      {/* New Story Modal */}
      <Modal
        show={showNewStoryModal}
        onHide={() => setShowNewStoryModal(false)}
      >
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
          <Button
            variant="secondary"
            onClick={() => setShowNewStoryModal(false)}
          >
            {t("newStoryModal.cancel")}
          </Button>
          <Button variant="primary" onClick={handleSaveNewStory}>
            {t("newStoryModal.save")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* About Modal */}
      <Modal show={showAboutModal} onHide={() => setShowAboutModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t("toolbar.aboutTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t("toolbar.aboutBodyLine1")}</p>
          <p>{t("toolbar.aboutBodyLine2")}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowAboutModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* New Tag Modal */}
      <Modal show={showNewTagModal} onHide={() => setShowNewTagModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t("newTagModal.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Story Select */}
            <Form.Group controlId="formSelectStory" className="mb-3">
              <Form.Label>{t("newTagModal.storyLabel")}</Form.Label>
              <Form.Control
                as="select"
                value={selectedStoryId}
                onChange={(e) => setSelectedStoryId(e.target.value)}
              >
                {userStories &&
                  userStories.map((story) => (
                    <option key={story.storyId} value={story.storyId}>
                      {story.title}
                    </option>
                  ))}
              </Form.Control>
            </Form.Group>

            {/* Tag Name */}
            <Form.Group controlId="formTagName" className="mb-3">
              <Form.Label>{t("newTagModal.tagNameLabel")}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t("newTagModal.tagNameLabel")}
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </Form.Group>

            {/* Tag Type */}
            <Form.Group controlId="formTagType" className="mb-3">
              <Form.Label>{t("newTagModal.tagTypeLabel")}</Form.Label>
              <Form.Control
                as="select"
                value={selectedTagTypeId}
                onChange={(e) => setSelectedTagTypeId(e.target.value)}
              >
                {tagTypes &&
                  tagTypes.map((tt) => (
                    <option key={tt.tagTypeId} value={tt.tagTypeId}>
                      {tt.name}
                    </option>
                  ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewTagModal(false)}>
            {t("newTagModal.cancel")}
          </Button>
          <Button variant="primary" onClick={handleSaveNewTag}>
            {t("newTagModal.save")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Toolbar;
