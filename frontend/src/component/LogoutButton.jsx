import React from "react";
import { useAuthStore } from "../store/useAuthStore";

const LogoutButton = ({ children }) => {
  const { logout } = useAuthStore();

  const onLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button
      type="button"
      className="btn btn-primary w-full flex items-center justify-start gap-2"
      onClick={onLogout}
    >
      {children}
    </button>
  );
};

export default LogoutButton;
