import { useState, useEffect, useCallback } from "react";

interface User {
  branchName: string;
  createdAt: string;
  email: string;
  firstName: string;
  lastName: string;
  id: number;
  userType: string;
  tillNumber: string;
  branchId: string;
  userImalId: string;
}

const initialUserData: User = {
  email: "",
  firstName: "",
  lastName: "",
  id: 0,
  userType: "",
  createdAt: "",
  branchName: "",
  tillNumber: "",
  branchId: "",
  userImalId: "",
};

export const useUserFromLocalStorage = () => {
  const [userData, setUserData] = useState<User>(initialUserData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getUserFromLocalStorage = useCallback((): User | null => {
    try {
      const currentUser = localStorage.getItem("token");
      if (typeof currentUser === "string" && currentUser.length > 0) {
        const user = JSON.parse(currentUser);
        return user;
      }
      return null;
    } catch (err) {
      console.error("Error parsing user from localStorage:", err);
      setError("Failed to parse user data from localStorage");
      return null;
    }
  }, []);

  const setUserFromLocalStorage = useCallback(() => {
    setIsLoading(true);
    setError(null);

    try {
      const user = getUserFromLocalStorage();
      if (user) {
        setUserData(user);
      } else {
        setUserData(initialUserData);
      }
    } catch (err) {
      setError("Failed to load user data");
      setUserData(initialUserData);
    } finally {
      setIsLoading(false);
    }
  }, [getUserFromLocalStorage]);

  const updateUserInLocalStorage = useCallback((newUserData: User) => {
    try {
      localStorage.setItem("token", JSON.stringify(newUserData));
      setUserData(newUserData);
    } catch (err) {
      console.error("Error saving user to localStorage:", err);
      setError("Failed to save user data to localStorage");
    }
  }, []);

  const clearUserFromLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem("token");
      setUserData(initialUserData);
    } catch (err) {
      console.error("Error clearing user from localStorage:", err);
      setError("Failed to clear user data from localStorage");
    }
  }, []);

  useEffect(() => {
    setUserFromLocalStorage();
  }, [setUserFromLocalStorage]);

  return {
    userData,
    isLoading,
    error,
    setUserFromLocalStorage,
    updateUserInLocalStorage,
    clearUserFromLocalStorage,
    getUserFromLocalStorage,
  };
};
