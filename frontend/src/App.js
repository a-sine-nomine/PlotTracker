import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./Login";
import Register from "./Register";
import Homepage from "./Homepage";
import { useUser } from "./UserProvider";
import PrivateRoute from "./PrivateRoute";

function App() {
  const [roles, setRoles] = useState([]);
  const user = useUser();

  // useEffect(() => {
  //   setRoles(getRolesFromJWT());
  // }, [user.jwt]);

  // function getRolesFromJWT() {
  //   if (user.jwt) {
  //     const decodedJwt = jwtDecode(user.jwt);
  //     return decodedJwt.authorities;
  //   }
  //   return [];
  // }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/homepage"
        element={
          <PrivateRoute>
            <Homepage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
