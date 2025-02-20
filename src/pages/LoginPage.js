// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginImage from "../assets/images/img_login.svg";
import logo from "../assets/images/logo.png";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const openErrorModal = () => setIsErrorModalOpen(true);
  const closeErrorModal = () => setIsErrorModalOpen(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleLogin = async () => {
    // Tambahkan validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Invalid email format");
      openErrorModal();
      return;
    }

    // Tambahkan validasi password
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      openErrorModal();
      return;
    }

    // Sanitize input (optional, tergantung kebutuhan)
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPassword = password.trim();

    // Set loading ke true saat proses login dimulai
    setLoading(true);

    try {
      // Sign in user with Firebase email/password authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        sanitizedEmail,
        sanitizedPassword
      );
      const user = userCredential.user;

      // Retrieve the user's data from Firestore
      const userDocRef = doc(firestore, "admin", user.uid); // Adjust Firestore collection as needed
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error("User not found in Firestore.");
      }

      const userData = userDoc.data();

      // Check if the user has the admin role
      if (userData.role === "admin") {
        // Gunakan fungsi login dari context
        login({
          token: user.accessToken,
          role: userData.role,
          email: user.email,
          uid: user.uid,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 jam
        });

        // Navigate to the data petugas page
        navigate("/OfficerData", { replace: true });
      } else {
        throw new Error("You do not have admin privileges.");
      }
    } catch (error) {
      // Hindari menampilkan detail error spesifik ke pengguna
      let friendlyErrorMessage = "Login failed. Please check your credentials.";

      switch (error.code) {
        case "auth/invalid-email":
          friendlyErrorMessage = "Invalid email address.";
          break;
        case "auth/user-disabled":
          friendlyErrorMessage = "This account has been disabled.";
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
          friendlyErrorMessage = "Invalid email or password.";
          break;
        default:
          friendlyErrorMessage =
            "An unexpected error occurred. Please try again.";
      }

      setErrorMessage(friendlyErrorMessage);
      openErrorModal();
    } finally {
      // Set loading kembali ke false setelah proses selesai
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="flex h-screen">
      {/* Left Section */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="flex flex-col items-center w-full max-w-md">
          <img src={logo} alt="Logo" className="w-52 -mt-20 mb-20" />

          <div className="w-full max-w-md p-8 bg-[#FBFBFB] shadow-md rounded-lg">
            <h1 className="text-4xl font-bold mt-6 mb-10 text-center text-gray-800">
              Login
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 text-left mb-2"
                >
                  Email
                </label>
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-custom-blue focus:border-custom-blue sm:text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 text-left mb-2"
                >
                  Password
                </label>
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-custom-blue focus:border-custom-blue sm:text-sm"
                  placeholder="••••••••"
                  required
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 mt-6 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {isPasswordVisible ? (
                    <AiFillEyeInvisible size={24} />
                  ) : (
                    <AiFillEye size={24} />
                  )}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-custom-blue text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 hidden md:flex items-center justify-center bg-gray-200">
        <img
          src={loginImage}
          alt="Login"
          className="object-cover h-full w-full"
        />
      </div>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4">Loading...</h2>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}

      {isErrorModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm mx-4">
            <h2 className="text-lg font-semibold mb-6">Login Failed</h2>
            <p className="mb-6">
              {errorMessage || "An error occurred. Please try again."}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeErrorModal}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-300 ease-in-out"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
