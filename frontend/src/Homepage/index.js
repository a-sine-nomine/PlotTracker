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
  const user = useUser();

  const [stories, setStories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user.isAuthenticated) {
      navigate("/login");
      return;
    }

    ajax(`/api/story`, "GET")
    .then(
      (response) => {
        setStories(response.map((story) => ({
          id: story.id,
          number: story.number,
          name: story.name
        })));
      }
    ).catch((err) => {
      console.error("Failed to fetch stories:", err);
      setError("Failed to load stories. Please try again later.");
    });;
  }, [user.isAuthenticated, navigate]);


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