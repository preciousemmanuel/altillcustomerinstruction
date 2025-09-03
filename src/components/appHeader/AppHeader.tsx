import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";

import { useUserFromLocalStorage } from "@/hooks/account/useUserFromLocalStorage";

export default function AppHeader() {
  const { getUserFromLocalStorage } = useUserFromLocalStorage();
  const user = getUserFromLocalStorage();
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("branchToken");
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-50">
      <nav className="bg-white h-[85px] border-gray-200 px-4 lg:px-12 py-5 shadow-sm">
        <div className="flex flex-wrap justify-between items-center mx-auto">
          <img src="/images/logo.svg" className="h-12 me-8" alt=" Logo" />
          <a className="flex ms-2 md:me-24">
            <div
              className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1"
              id="mobile-menu-2"
            ></div>
          </a>
          {!!user && (
            <div
              className="text-xs flex justify-center items-center text-red-500 cursor-pointer"
              onClick={() => handleLogout()}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
