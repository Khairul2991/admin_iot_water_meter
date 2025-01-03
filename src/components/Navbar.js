// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from "react";
import { FaUser } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import logoIcon from "../assets//images/logo.png";
import logoutIcon from "../assets/images/logout.svg";

function Navbar() {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("formData");
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getNavLinkClass = (path) => {
    return location.pathname === path
      ? "text-white border-b-2 border-white rounded-none"
      : "text-white hover:text-gray-300 hover:underline";
  };

  return (
    <nav className="bg-custom-blue p-4 fixed top-0 left-0 w-full z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/OfficerData" className="inline w-52">
          <img src={logoIcon} alt="Logo" className="w-12" />
        </a>
        <div className="flex items-center gap-6">
          <a
            href="/OfficerData"
            className={`${getNavLinkClass(
              "/OfficerData"
            )} p-2 rounded-md text-md font-medium transition duration-300 ease-in-out`}
          >
            Officer Data
          </a>
          <a
            href="/UserData"
            className={`${getNavLinkClass(
              "/UserData"
            )} p-2 rounded-md text-md font-medium transition duration-300 ease-in-out`}
          >
            User Data
          </a>
          <div className="relative" ref={profileDropdownRef}>
            <FaUser
              className="text-white hover:bg-white hover:text-custom-blue cursor-pointer hover:rounded-full rounded-full p-1 transition duration-300 ease-in-out"
              size={36}
              onClick={toggleProfileDropdown}
            />
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 items-center bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                <a
                  href="/ChangeAdminPassword"
                  className="flex justify-between w-full text-left font-medium px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Change Password
                  <img className="ml-1" src={logoutIcon} alt="Logout Icon" />
                </a>
                <button
                  className="flex justify-between w-full text-left font-medium px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Logout
                  <img src={logoutIcon} alt="Logout Icon" className="mt-1" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
