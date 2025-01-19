import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./Login";
import Homepage from "./Homepage";
import { useUser } from "./UserProvider";

function App() {
  const [roles, setRoles] = useState([]);
  const user = useUser();

  useEffect(() => {
    setRoles(getRolesFromJWT());
  }, [user.jwt]);

  function getRolesFromJWT() {
    if (user.jwt) {
      const decodedJwt = jwtDecode(user.jwt);
      return decodedJwt.authorities;
    }
    return [];
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/homepage" element={<Homepage />} />
    </Routes>
  );
}

export default App;
