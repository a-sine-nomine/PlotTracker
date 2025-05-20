import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import apiService from "../Services/apiService";

export default function DeleteAccountModal({ show, onHide }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [deleteAccountPassword, setDeleteAccountPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [genericError, setGenericError] = useState("");

  const handleDeleteAccount = async () => {
    setGenericError("");
    setFieldErrors({});

    try {
      await apiService.deleteUser({ password: deleteAccountPassword });
      navigate("/register");
    } catch (err) {
      const validationErrors = Array.isArray(err.body) ? err.body : [];

      if (validationErrors.length > 0) {
        const newFieldErrors = {};
        validationErrors.forEach(({ field, code, rejectedValue }) => {
          newFieldErrors[field] = t(code, rejectedValue);
        });
        setFieldErrors(newFieldErrors);
      } else {
        setGenericError(
          err.message ||
            t("userOptions.deleteAccountError", "Password is incorrect")
        );
      }
    }
  };

  const handleClose = () => {
    setDeleteAccountPassword("");
    setGenericError("");
    setFieldErrors({});
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
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

        {}
        {genericError && <p className="text-danger fw-bold">{genericError}</p>}

        <Form.Group controlId="deleteAccountPassword" className="mb-3">
          <Form.Label>{t("userOptions.password", "Password")}</Form.Label>
          <Form.Control
            type="password"
            value={deleteAccountPassword}
            onChange={(e) => {
              setDeleteAccountPassword(e.target.value);
              setFieldErrors((f) => ({ ...f, currentPassword: undefined }));
            }}
            isInvalid={!!fieldErrors.currentPassword}
          />
          <Form.Control.Feedback type="invalid">
            {fieldErrors.currentPassword}
          </Form.Control.Feedback>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          {t("cancel", "Cancel")}
        </Button>
        <Button variant="danger" onClick={handleDeleteAccount}>
          {t("userOptions.delete", "Delete")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
