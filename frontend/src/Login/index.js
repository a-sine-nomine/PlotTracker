import React, { useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserProvider";
import apiService from "../Services/apiService";
import { useTranslation } from "react-i18next";
import "./Login.css";

const Login = () => {
  const { t, i18n } = useTranslation();
  const { setIsAuthenticated } = useUser();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);

  const sendLoginRequest = async () => {
    setErrorMsg("");
    try {
      await apiService.login(username, password);
      setIsAuthenticated(true);
      navigate("/homepage");
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMsg(error.message || t("login.errorMessage"));
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ru" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card
        className="p-4 shadow"
        style={{ borderRadius: "1rem", minWidth: "350px" }}
      >
        <Card.Body>
          <h1
            className="text-center mb-4"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          >
            PlotTracker
          </h1>
          <p className="text-center text-muted mb-4">{t("login.message")}</p>

          <Form.Group className="mb-3" controlId="username">
            <Form.Label>{t("login.username")}</Form.Label>
            <Form.Control
              type="text"
              placeholder={t("login.usernamePlaceholder")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label>{t("login.password")}</Form.Label>
            <Form.Control
              type="password"
              placeholder={t("login.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
            />
          </Form.Group>

          {errorMsg && (
            <div className="text-danger mb-3" style={{ fontWeight: "bold" }}>
              {errorMsg}
            </div>
          )}

          <div className="d-grid">
            <Button variant="primary" onClick={sendLoginRequest}>
              {t("login.loginButton")}
            </Button>
          </div>

          <div className="text-center mt-3">
            <small className="text-muted">
              {t("login.noAccount")}{" "}
              <span
                className="text-primary text-decoration-underline"
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/register")}
              >
                {t("login.signup")}
              </span>
            </small>
          </div>

          <div className="language-switcher mt-3 text-center">
            <span className="lang-toggle" onClick={toggleLanguage}>
              {i18n.language === "en" ? "en" : "ру"}
            </span>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
