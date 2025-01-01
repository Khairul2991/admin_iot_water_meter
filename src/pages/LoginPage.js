// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginImage from "../assets/images/img_login.svg";
import logo from "../assets/images/logo.png";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const openErrorModal = () => setIsErrorModalOpen(true);
  const closeErrorModal = () => setIsErrorModalOpen(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleLogin = async () => {
    try {
      // Sign in user with Firebase email/password authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
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
        // Save user info in local storage (optional)
        localStorage.setItem("authToken", user.accessToken);
        localStorage.setItem("userRole", userData.role);
        localStorage.setItem("userEmail", user.email);

        // Navigate to the data petugas page
        navigate("/OfficerData", { replace: true });
      } else {
        throw new Error("You do not have admin privileges.");
      }
    } catch (error) {
      setErrorMessage(error.message || "An error occurred. Please try again.");
      openErrorModal();
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
