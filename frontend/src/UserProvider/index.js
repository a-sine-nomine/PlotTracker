import React, { createContext, useContext, useState, useEffect } from "react";
import ajax from "../Services/fetchService";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const validateAuth = async () => {
      try {
        const response = await ajax(`/api/auth/validate`, "GET");
        console.log(
          "UserProvider validateAuth response status:",
          response.status
        );

        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("UserProvider: Error validating auth:", error);
        setIsAuthenticated(false);
      }
    };

    validateAuth();
  }, []);

  const value = { isAuthenticated, setIsAuthenticated };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}

export { useUser, UserProvider };
