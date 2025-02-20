// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from "react";
import { FaUser, FaBars, FaTimes } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import logoIcon from "../assets//images/logo.png";
import logoutIcon from "../assets/images/logout.svg";

function Navbar() {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMenuMobileOpen, setIsMenuMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const profileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleProfileDropdown = (event) => {
    // Mencegah event propagation agar tidak langsung tertutup
    event.stopPropagation();
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const toggleMobileMenu = (event) => {
    event.stopPropagation();
    setIsMenuMobileOpen(!isMenuMobileOpen);
    setIsProfileDropdownOpen(false);
  };

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
    setIsProfileDropdownOpen(false);
    setIsMenuMobileOpen(false);
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  const confirmLogout = async () => {
    setLoading(true);
    try {
      // Sign out dari Firebase
      await signOut(auth);

      // Gunakan logout dari context yang sudah menghapus seluruh data dari secure storage
      logout();

      // Navigate ke halaman login
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Optional: Tambahkan error handling atau toast notification
      alert("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Tutup profile dropdown jika klik di luar
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }

      // Tutup mobile menu jika klik di luar
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMenuMobileOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Tutup mobile menu saat navigasi berganti
  useEffect(() => {
    setIsMenuMobileOpen(false);
  }, [location.pathname]);

  const getNavLinkClass = (path) => {
    return location.pathname === path
      ? "text-white border-b-2 border-white rounded-none"
      : "text-white hover:text-gray-300 hover:underline";
  };

  return (
    <>
      <nav className="bg-custom-blue p-4 fixed top-0 left-0 w-full z-50 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <a href="/OfficerData" className="inline w-52">
            <img src={logoIcon} alt="Logo" className="w-12" />
          </a>

          {/* Right Section */}
          <div className="flex items-center gap-6">
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
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
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-white hover:text-gray-300 p-1"
            >
              {isMenuMobileOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            {/* Profile Icon */}
            <div className="relative" ref={profileDropdownRef}>
              <FaUser
                className="text-white hover:bg-white hover:text-custom-blue cursor-pointer hover:rounded-full rounded-full p-1 transition duration-300 ease-in-out"
                size={36}
                onClick={toggleProfileDropdown}
              />
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 items-center bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                  <a
                    href="/ChangeAdminPassword"
                    className="flex justify-between w-full text-left font-medium px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Change Password
                    <img className="ml-1" src={logoutIcon} alt="Logout Icon" />
                  </a>
                  <button
                    className="flex justify-between w-full text-left font-medium px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={openLogoutModal}
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

      {/* Mobile Menu */}
      {isMenuMobileOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden bg-custom-blue shadow-lg mt-20 -mb-20"
        >
          <div className="container mx-auto py-2">
            <a
              href="/OfficerData"
              className={`${getNavLinkClass(
                "/OfficerData"
              )} block px-4 py-3 text-md font-medium`}
              onClick={() => setIsMenuMobileOpen(false)}
            >
              Officer Data
            </a>
            <a
              href="/UserData"
              className={`${getNavLinkClass(
                "/UserData"
              )} block px-4 py-3 text-md font-medium`}
              onClick={() => setIsMenuMobileOpen(false)}
            >
              User Data
            </a>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-8 text-center">
              Logout Confirmation
            </h2>
            <p className="text-center mb-8">Are you sure you want to logout?</p>
            <div className="flex justify-center space-x-12">
              <button
                onClick={closeLogoutModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className={`px-4 py-2 text-white rounded-md transition duration-300 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
                disabled={loading}
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
