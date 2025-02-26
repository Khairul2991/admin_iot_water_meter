// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import loginImage from "../assets/images/img_login.jpg";
import logo from "../assets/images/logo.png";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { Alert } from "antd";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation(); // Tambahkan ini
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState("");

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const openErrorModal = () => setIsErrorModalOpen(true);
  const closeErrorModal = () => setIsErrorModalOpen(false);

  useEffect(() => {
    // Periksa apakah ada pesan dari navigasi sebelumnya
    if (location.state && location.state.message) {
      setSessionExpiredMessage(location.state.message);

      // Hapus state setelah menampilkan pesan
      window.history.replaceState({}, document.title);

      // Set timeout untuk menghilangkan pesan setelah 3 detik
      const timer = setTimeout(() => {
        setSessionExpiredMessage("");
      }, 5000);

      // Bersihkan timeout jika komponen di-unmount
      return () => clearTimeout(timer);
    }
  }, [location]);

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
        setErrorMessage("User not found. Please contact support.");
        openErrorModal();
        setLoading(false);
        return;
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
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 jam
        });

        // Navigate to the data petugas page
        navigate("/OfficerData", { replace: true });
      } else {
        setErrorMessage("You do not have admin privileges.");
        openErrorModal();
        setLoading(false);
        return;
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
          friendlyErrorMessage = "No account found with this email.";
          break;
        case "auth/wrong-password":
          friendlyErrorMessage = "Invalid email or password.";
          break;
        case "auth/invalid-credential":
          friendlyErrorMessage = "Invalid login credentials. Please try again.";
          break;
        default:
          friendlyErrorMessage = error.message;
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
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left Section */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-white">
        <div className="fixed top-4 px-4 w-full md:max-w-md z-50">
          {sessionExpiredMessage && (
            <Alert
              message={sessionExpiredMessage}
              type="warning"
              showIcon
              closable
              onClose={() => setSessionExpiredMessage("")}
            />
          )}
        </div>
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="-mt-8 md:-mt-20 mb-12 md:mb-20">
            <img
              src={logo}
              alt="Logo"
              className="w-40 md:w-52"
            />
            <span className="text-black font-bold text-2xl md:text-4xl sm:block">
              WaterMeter
            </span>
          </div>

          <div className="w-full p-4 md:p-8 bg-[#FBFBFB] shadow-md rounded-lg">
            <h1 className="text-2xl md:text-4xl font-bold mt-2 md:mt-6 mb-6 md:mb-10 text-center text-gray-800">
              Login
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs md:text-sm font-medium text-gray-700 text-left mb-1 md:mb-2"
                >
                  Email
                </label>
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md 
                  shadow-sm focus:outline-none focus:ring-1 focus:ring-custom-blue focus:border-custom-blue"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-xs md:text-sm font-medium text-gray-700 text-left mb-1 md:mb-2"
                >
                  Password
                </label>
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 pr-10 text-sm md:text-base border border-gray-300 
                  rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-custom-blue focus:border-custom-blue"
                  placeholder="••••••••"
                  required
                />
                <div
                  className="absolute right-0 pr-3 flex items-center cursor-pointer 
                  text-gray-500 hover:text-blue-600"
                  style={{
                    top: "50%", // Posisi vertikal 50% dari parent
                  }}
                  onClick={togglePasswordVisibility}
                >
                  {isPasswordVisible ? (
                    <AiFillEyeInvisible className="md:w-6 md:h-6 w-5 h-5" />
                  ) : (
                    <AiFillEye className="md:w-6 md:h-6 w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-custom-blue text-white px-4 py-2 text-sm md:text-base rounded-md
                 hover:bg-blue-700 transition duration-300 ease-in-out"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Section (hidden on mobile) */}
      <div className="flex-1 hidden md:flex items-center justify-center bg-gray-200">
        <img
          src={loginImage}
          alt="Login"
          className="object-cover h-full w-full"
        />
      </div>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-40">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-11/12 max-w-xs md:max-w-md text-center">
            <h2 className="text-md md:text-xl font-semibold mb-4">
              Loading...
            </h2>
            <div
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent border-solid rounded-full
             animate-spin mx-auto"
            ></div>
          </div>
        </div>
      )}

      {isErrorModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-4 md:p-6 rounded-lg w-full max-w-xs md:max-w-md mx-4">
            <h2 className="text-md md:text-lg font-semibold mb-4 md:mb-6">
              Login Failed
            </h2>
            <p className="mb-4 md:mb-6 text-xs md:text-base">
              {errorMessage || "An error occurred. Please try again."}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeErrorModal}
                className="bg-red-500 text-white px-4 py-2 text-xs md:text-base rounded-md hover:bg-gray-600
                 transition duration-300 ease-in-out"
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
