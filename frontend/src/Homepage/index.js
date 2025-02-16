import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  ButtonGroup,
  Col,
  Container,
  Dropdown,
  DropdownButton,
  Form,
  Row,
  ListGroup
} from "react-bootstrap";
import ajax from "../Services/fetchService";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../UserProvider";

const Homepage = () => {
  let navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated, setUser } = useUser();

  const [stories, setStories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      try {
        const response = await ajax(`/api/story`, "GET");
        console.log("Fetch Stories Response Status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched Stories Data:", data);

          if (Array.isArray(data)) {
            setStories(
              data.map((story) => ({
                id: story.id,
                number: story.number,
                name: story.name,
              }))
            );
          } else {
            console.error("Expected an array but received:", data);
            setError("Unexpected response format from server.");
          }
        } else {
          setError("Failed to load stories. Please try again later.");
        }
      } catch (err) {
        console.error("Failed to fetch stories:", err);
        setError("Failed to load stories. Please try again later.");
      }
    };

    fetchStories();
  }, [isAuthenticated, navigate]);


  return (<Container>
    <Row className="mt-4">
      <Col>
        <h1>Homepage</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {stories.length === 0 ? (
          <p>No stories available.</p>
        ) : (
          <ListGroup>
            {stories.map((story) => (
              <ListGroup.Item key={story.id}>
                <strong>{story.name}</strong> (Story #{story.number})
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Col>
    </Row>
  </Container>);
};

export default Homepage;