import React, { useState, useEffect } from "react";
import { Navbar, Nav, Dropdown, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import apiService from "../Services/apiService";
import { useTranslation } from "react-i18next";

import ChangePasswordModal from "./ChangePasswordModal";
import DeleteAccountModal from "./DeleteAccountModal";
import NewStoryModal from "./NewStoryModal";
import NewEventModal from "./NewEventModal";
import AboutModal from "./AboutModal";
import NewTagModal from "../Modals/NewTagModal";
import NewTagTypeModal from "./NewTagTypeModal";

import "./Toolbar.css";

const Toolbar = ({
  onNewStoryCreated,
  onNewTagTypeCreated,
  onNewTagCreated,
  onNewEventCreated,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { storyId } = useParams();
  const [username, setUsername] = useState("");

  const [showNewStoryModal, setShowNewStoryModal] = useState(false);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showNewTagModal, setShowNewTagModal] = useState(false);
  const [showNewTagTypeModal, setShowNewTagTypeModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

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
  }, []);

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

  const handleExport = async (exportType) => {
    if (!storyId) return;
    try {
      const response = await apiService.exportStory(storyId, exportType);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "plot_events.docx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting story:", error);
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
                onClick={() => storyId && setShowNewEventModal(true)}
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

          <Dropdown align="end" className="export-dropdown">
            <Dropdown.Toggle variant="light" id="dropdown-export">
              {t("toolbar.export", "Export")}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleExport("script")}>
                {t("toolbar.exportAsScript", "As script")}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleExport("novella")}>
                {t("toolbar.exportAsNovel", "As novel")}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>

        <Nav className="ms-auto me-3 user-options">
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
              <Dropdown.Item onClick={handleLogout}>
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
      {}
      <ChangePasswordModal
        show={showChangePasswordModal}
        onHide={() => setShowChangePasswordModal(false)}
      />
      <DeleteAccountModal
        show={showDeleteAccountModal}
        onHide={() => setShowDeleteAccountModal(false)}
      />
      <NewStoryModal
        show={showNewStoryModal}
        onHide={() => setShowNewStoryModal(false)}
        onNewStoryCreated={onNewStoryCreated}
      />
      <NewEventModal
        show={showNewEventModal}
        onHide={() => setShowNewEventModal(false)}
        storyId={storyId}
        onEventCreated={onNewEventCreated}
      />
      <AboutModal
        show={showAboutModal}
        onHide={() => setShowAboutModal(false)}
      />
      <NewTagModal
        show={showNewTagModal}
        onHide={() => setShowNewTagModal(false)}
        onTagCreated={onNewTagCreated}
        storyId={storyId}
      />
      <NewTagTypeModal
        show={showNewTagTypeModal}
        onHide={() => setShowNewTagTypeModal(false)}
        onTagTypeCreated={onNewTagTypeCreated}
        storyId={storyId}
      />
    </>
  );
};

export default Toolbar;
