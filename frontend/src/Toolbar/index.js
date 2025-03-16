import React, { useState, useEffect } from "react";
import { Navbar, Nav, Dropdown, Modal, Button, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import apiService from "../Services/apiService";
import { useTranslation } from "react-i18next";
import "./Toolbar.css";

const Toolbar = ({ onNewStoryCreated }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { storyId } = useParams();
  const [username, setUsername] = useState("");

  const [showNewStoryModal, setShowNewStoryModal] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryDescription, setNewStoryDescription] = useState("");

  const [showAboutModal, setShowAboutModal] = useState(false);

  const [showNewTagModal, setShowNewTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#000000");
  const [selectedStoryIdForTag, setSelectedStoryIdForTag] = useState("");
  const [selectedTagTypeId, setSelectedTagTypeId] = useState("");
  const [tagTypes, setTagTypes] = useState([]);

  const [showNewTagTypeModal, setShowNewTagTypeModal] = useState(false);
  const [newTagTypeName, setNewTagTypeName] = useState("");
  const [selectedStoryIdForTagType, setSelectedStoryIdForTagType] =
    useState("");

  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [eventType, setEventType] = useState("dated");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventContent, setEventContent] = useState("");
  const [eventMemoryRefId, setEventMemoryRefId] = useState("");
  const [eventNextEventId, setEventNextEventId] = useState("");
  const [storyEvents, setStoryEvents] = useState([]);

  const [userStories, setUserStories] = useState([]);

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState("");
  const [deleteAccountError, setDeleteAccountError] = useState("");

  useEffect(() => {
    const fetchUserStories = async () => {
      try {
        const response = await apiService.getStories();
        const data = await response.json();
        setUserStories(data);
        if (data.length > 0) {
          setSelectedStoryIdForTag(data[0].storyId);
          setSelectedStoryIdForTagType(data[0].storyId);
        }
      } catch (error) {
        console.error("Error fetching user stories:", error);
      }
    };
    fetchUserStories();
  }, []);

  useEffect(() => {
    const fetchTagTypes = async () => {
      if (!selectedStoryIdForTag) return;
      try {
        const response = await apiService.getTagTypes(selectedStoryIdForTag);
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
  }, [selectedStoryIdForTag]);

  useEffect(() => {
    if (!storyId) return;
    const fetchStoryEvents = async () => {
      try {
        const response = await apiService.getPlotEvents(storyId);
        const data = await response.json();
        setStoryEvents(data);
      } catch (error) {
        console.error("Error fetching story events:", error);
      }
    };
    fetchStoryEvents();
  }, [storyId]);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await apiService.getUserDetails();
        const data = await response.json();
        setUsername(data.username);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUsername();
  }, [username]);

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
        color: newTagColor,
      };
      const response = await apiService.createTag(
        selectedStoryIdForTag,
        tagDto
      );
      const data = await response.json();
      console.log("New tag created:", data);
      setNewTagName("");
      setNewTagColor("#000000");
      setShowNewTagModal(false);
    } catch (error) {
      console.error("Error creating new tag:", error);
    }
  };

  const handleSaveNewTagType = async () => {
    try {
      const tagTypeDto = {
        name: newTagTypeName,
      };
      const response = await apiService.createTagType(
        selectedStoryIdForTagType,
        tagTypeDto
      );
      const data = await response.json();
      console.log("New tag type created:", data);
      setNewTagTypeName("");
      setShowNewTagTypeModal(false);
    } catch (error) {
      console.error("Error creating new tag type:", error);
    }
  };

  const handleSaveNewEvent = async () => {
    if (!storyId) return;
    try {
      const eventDto = {
        eventType,
        title: eventTitle,
        date: eventDate,
        description: eventDescription,
        content: eventContent,
        memoryRefId: eventMemoryRefId || null,
        nextEventId: eventNextEventId || null,
        tags: [],
      };
      const response = await apiService.addPlotEvent(storyId, eventDto);
      const data = await response.json();
      console.log("New event created:", data);

      setEventType("dated");
      setEventTitle("");
      setEventDate("");
      setEventDescription("");
      setEventContent("");
      setEventMemoryRefId("");
      setEventNextEventId("");
      setShowNewEventModal(false);
    } catch (error) {
      console.error("Error creating new event:", error);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== repeatNewPassword) {
      setPasswordError(
        t("userOptions.passwordMismatch", "New passwords do not match")
      );
      return;
    }
    setPasswordError("");
    setPasswordSuccess("");
    const passwordDto = {
      currentPassword: oldPassword,
      newPassword: newPassword,
    };
    try {
      const response = await apiService.changePassword(passwordDto);
      setPasswordSuccess(
        t("userOptions.passwordChanged", "Password changed successfully")
      );
      setOldPassword("");
      setNewPassword("");
      setRepeatNewPassword("");
    } catch (error) {
      setPasswordError(
        error.message ||
          t("userOptions.passwordIncorrect", "Incorrect current password")
      );
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteAccountError("");
    const passwordDto = { password: deleteAccountPassword };
    try {
      await apiService.deleteUser(passwordDto);
      navigate("/register");
    } catch (error) {
      setDeleteAccountError(
        error.message ||
          t("userOptions.deleteAccountError", "Password is incorrect")
      );
    }
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="toolbar">
        <Navbar.Brand
          className="ms-3"
          onClick={() => navigate("/homepage")}
          style={{ cursor: "pointer" }}
        >
          {t("toolbar.brand")}
        </Navbar.Brand>
        <Nav className="me-auto">
          <Dropdown>
            <Dropdown.Toggle variant="light" id="dropdown-file">
              {t("toolbar.file")}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setShowNewStoryModal(true)}>
                {t("toolbar.newStory")}
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  if (storyId) setShowNewEventModal(true);
                }}
              >
                {t("toolbar.newEvent")}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setShowNewTagModal(true)}>
                {t("toolbar.newTag")}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setShowNewTagTypeModal(true)}>
                {t("toolbar.newTagType")}
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

        <Nav className="ms-auto me-3 user-options">
          {/* User Options Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="link"
              id="user-dropdown"
              className="user-dropdown-toggle"
            >
              <div className="user-avatar">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="user-name">
                {username.length <= 15
                  ? username
                  : username.substring(0, 15) + "..."}
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Header className="user-options-username">
                {username}
              </Dropdown.Header>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => setShowChangePasswordModal(true)}>
                {t("userOptions.changePassword", "Change password")}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleLogout(true)}>
                {t("userOptions.logOut", "Log out")}
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => setShowDeleteAccountModal(true)}
                className="user-options-delete-account"
              >
                {t("userOptions.deleteAccount", "Delete account")}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button
            variant="link"
            className="language-toggle"
            onClick={toggleLanguage}
          >
            {i18n.language === "en" ? "en" : "ру"}
          </Button>
        </Nav>
      </Navbar>

      {/* Change Password Modal */}
      <Modal
        show={showChangePasswordModal}
        onHide={() => {
          setShowChangePasswordModal(false);
          setPasswordError("");
          setPasswordSuccess("");
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {t("userOptions.changePassword", "Change password")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {passwordError && <p className="error-message">{passwordError}</p>}
          {passwordSuccess && (
            <p className="success-message">{passwordSuccess}</p>
          )}
          <Form>
            <Form.Group controlId="oldPassword" className="mb-3">
              <Form.Label>
                {t("userOptions.oldPassword", "Old password")}
              </Form.Label>
              <Form.Control
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="newPassword" className="mb-3">
              <Form.Label>
                {t("userOptions.newPassword", "New password")}
              </Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="repeatNewPassword" className="mb-3">
              <Form.Label>
                {t("userOptions.repeatNewPassword", "Repeat new password")}
              </Form.Label>
              <Form.Control
                type="password"
                value={repeatNewPassword}
                onChange={(e) => setRepeatNewPassword(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowChangePasswordModal(false)}
          >
            {t("userOptions.cancel", "Cancel")}
          </Button>
          <Button variant="primary" onClick={handleChangePassword}>
            {t("userOptions.change", "Change")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        show={showDeleteAccountModal}
        onHide={() => {
          setShowDeleteAccountModal(false);
          setDeleteAccountError("");
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {t("userOptions.deleteAccount", "Delete account")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {t(
              "userOptions.deleteAccountWarning",
              "This action is permanent. Please enter your password to confirm account deletion."
            )}
          </p>
          {deleteAccountError && (
            <p className="error-message">{deleteAccountError}</p>
          )}
          <Form.Group controlId="deleteAccountPassword" className="mb-3">
            <Form.Label>{t("userOptions.password", "Password")}</Form.Label>
            <Form.Control
              type="password"
              value={deleteAccountPassword}
              onChange={(e) => setDeleteAccountPassword(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteAccountModal(false)}
          >
            {t("userOptions.cancel", "Cancel")}
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            {t("userOptions.delete", "Delete")}
          </Button>
        </Modal.Footer>
      </Modal>

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

      {/* New Event Modal */}
      {storyId && (
        <Modal
          show={showNewEventModal}
          onHide={() => setShowNewEventModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>{t("newEventModal.title")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formEventType" className="mb-3">
                <Form.Label>{t("newEventModal.eventTypeLabel")}</Form.Label>
                <Form.Control
                  as="select"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                >
                  <option value="dated">dated</option>
                  <option value="memory">memory</option>
                  <option value="undated">undated</option>
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="formEventTitle" className="mb-3">
                <Form.Label>{t("newEventModal.titleLabel")}</Form.Label>
                <Form.Control
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formEventDate" className="mb-3">
                <Form.Label>{t("newEventModal.dateLabel")}</Form.Label>
                <Form.Control
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formEventDescription" className="mb-3">
                <Form.Label>{t("newEventModal.descriptionLabel")}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formEventContent" className="mb-3">
                <Form.Label>{t("newEventModal.contentLabel")}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={eventContent}
                  onChange={(e) => setEventContent(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formEventMemoryRefId" className="mb-3">
                <Form.Label>{t("newEventModal.memoryRefIdLabel")}</Form.Label>
                <Form.Control
                  as="select"
                  value={eventMemoryRefId}
                  onChange={(e) => setEventMemoryRefId(e.target.value)}
                >
                  <option value="">{t("newEventModal.noneOption")}</option>
                  {storyEvents.map((ev) => (
                    <option key={ev.eventId} value={ev.eventId}>
                      {ev.title}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="formEventNextEventId" className="mb-3">
                <Form.Label>{t("newEventModal.nextEventIdLabel")}</Form.Label>
                <Form.Control
                  as="select"
                  value={eventNextEventId}
                  onChange={(e) => setEventNextEventId(e.target.value)}
                >
                  <option value="">{t("newEventModal.noneOption")}</option>
                  {storyEvents.map((ev) => (
                    <option key={ev.eventId} value={ev.eventId}>
                      {ev.title}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowNewEventModal(false)}
            >
              {t("newEventModal.cancel")}
            </Button>
            <Button variant="primary" onClick={handleSaveNewEvent}>
              {t("newEventModal.save")}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

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
                value={selectedStoryIdForTag}
                onChange={(e) => setSelectedStoryIdForTag(e.target.value)}
              >
                {userStories.map((story) => (
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
                {tagTypes.map((tt) => (
                  <option key={tt.tagTypeId} value={tt.tagTypeId}>
                    {tt.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {/* New Color Field */}
            <Form.Group controlId="formTagColor" className="mb-3">
              <Form.Label>{t("newTagModal.colorLabel")}</Form.Label>
              <Form.Control
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
              />
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

      {/* New Tag Type Modal */}
      <Modal
        show={showNewTagTypeModal}
        onHide={() => setShowNewTagTypeModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("newTagTypeModal.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Story Select */}
            <Form.Group controlId="formSelectStoryForTagType" className="mb-3">
              <Form.Label>{t("newTagTypeModal.storyLabel")}</Form.Label>
              <Form.Control
                as="select"
                value={selectedStoryIdForTagType}
                onChange={(e) => setSelectedStoryIdForTagType(e.target.value)}
              >
                {userStories.map((story) => (
                  <option key={story.storyId} value={story.storyId}>
                    {story.title}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {/* Tag Type Name */}
            <Form.Group controlId="formTagTypeName" className="mb-3">
              <Form.Label>{t("newTagTypeModal.tagTypeNameLabel")}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t("newTagTypeModal.tagTypeNameLabel")}
                value={newTagTypeName}
                onChange={(e) => setNewTagTypeName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowNewTagTypeModal(false)}
          >
            {t("newTagTypeModal.cancel")}
          </Button>
          <Button variant="primary" onClick={handleSaveNewTagType}>
            {t("newTagTypeModal.save")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Toolbar;
