// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "antd";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import {
  getAuth,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from "firebase/auth";
import { getUserEmail, isAuthenticated } from "../utils/authUtils";

const ChangeAdminPassword = () => {
  const [formData, setFormData] = useState({
    passwordlama: "",
    passwordbaru: "",
    konfirmasipasswordbaru: "",
  });

  const navigate = useNavigate();
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState({
    passwordlama: false,
    passwordbaru: false,
    konfirmasipasswordbaru: false,
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/", {
        state: {
          message: "Session expired. Please login again.",
        },
      });
    }
  }, [navigate]);

  useEffect(() => {
    if (formData.passwordbaru && formData.konfirmasipasswordbaru) {
      if (formData.passwordbaru !== formData.konfirmasipasswordbaru) {
        setErrorMessage("Confirm new password does not match new password.");
      } else {
        setErrorMessage("");
      }
    }
  }, [formData.passwordbaru, formData.konfirmasipasswordbaru]);

  useEffect(() => {
    if (formData.passwordbaru.length > 0 && formData.passwordbaru.length <= 7) {
      setPasswordError("Password must be at least 8 characters long.");
    } else {
      setPasswordError("");
    }
  }, [formData.passwordbaru]);

  const togglePasswordVisibility = (field) => {
    setIsPasswordVisible((prevVisibility) => ({
      ...prevVisibility,
      [field]: !prevVisibility[field],
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBack = () => {
    navigate("/OfficerData");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (errorMessage || passwordError) {
      const combinedErrorMessage = `${errorMessage} ${passwordError}`.trim();
      setError(combinedErrorMessage || "Please check the form again.");
      // Jangan izinkan submit jika ada error
      return;
    }
    // Tampilkan modal konfirmasi
    setShowConfirmModal(true);
  };

  // Fungsi untuk konfirmasi submit
  const handleConfirmSubmit = async () => {
    // Tutup modal konfirmasi
    setShowConfirmModal(false);

    setLoading(true);
    setError(null);

    try {
      // Dapatkan email pengguna dari localStorage
      const userEmail = getUserEmail();

      if (!userEmail) {
        setError("User email not found");
        setLoading(false);
        return;
      }

      // Buat kredensial untuk re-autentikasi
      const credential = EmailAuthProvider.credential(
        userEmail,
        formData.passwordlama
      );

      // Re-autentikasi pengguna
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, formData.passwordbaru);

      // Tampilkan modal sukses
      setShowSuccessModal(true);
    } catch (error) {
      // Tangani berbagai jenis kesalahan
      if (
        error.message.includes("invalid-credential") ||
        error.message.includes("wrong-password")
      ) {
        setError("Old password is incorrect.");
      } else if (error.code === "auth/weak-password") {
        setError("New password is too weak.");
      } else {
        setError(
          error.message || "Failed to change password. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/OfficerData", { replace: true });
  };

  return (
    <div
      className="min-h-screen flex justify-center px-4"
      style={{
        paddingTop: window.innerWidth <= 768 ? "6rem" : "6.5rem",
        minHeight: "100vh",
      }}
    >
      <main className="pb-8 w-full max-w-7xl">
        <div className="form-1 bg-white shadow overflow-hidden sm:rounded-lg p-4 md:p-8">
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">
            Change Admin Password
          </h1>
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              className="mb-2 md:mb-4"
            />
          )}
          <div className="form-3 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-2 md:my-4">
            <h2 className="text-md md:text-xl font-bold mb-4 md:mb-6 text-start">
              Admin Login Account
            </h2>
            <h3 className="text-xs md:text-base mb-6 text-start text-red-600">
              ⚠️ Be careful changing this data!
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-start">
              {[
                {
                  name: "passwordlama",
                  label: "Current Password",
                  visibility: "passwordlama",
                },
                {
                  name: "passwordbaru",
                  label: "New Password",
                  visibility: "passwordbaru",
                  note: "* Password must be at least 8 characters long.",
                },
                {
                  name: "konfirmasipasswordbaru",
                  label: "Confirm New Password",
                  visibility: "konfirmasipasswordbaru",
                },
              ].map(({ name, label, visibility, note }) => (
                <div key={name} className="mb-3 md:mb-4 relative">
                  <label className="block text-xs md:text-base text-gray-700 mb-1 md:mb-2">
                    {label}
                  </label>
                  <div className="relative">
                    <input
                      type={isPasswordVisible[visibility] ? "text" : "password"}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs md:text-base 
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(visibility)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-600"
                    >
                      {isPasswordVisible[visibility] ? (
                        <AiFillEyeInvisible className="w-4 h-4 md:w-5 md:h-5" />
                      ) : (
                        <AiFillEye className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </button>
                  </div>
                  {note && (
                    <p
                      className="text-gray-600 mt-1 font-bold"
                      style={{
                        fontSize:
                          window.innerWidth <= 768 ? "0.625rem" : "0.825rem",
                      }}
                    >
                      {note}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {errorMessage && (
              <p className="text-red-500 text-xs md:text-sm mt-1 text-start">
                {errorMessage}
              </p>
            )}
          </div>

          <div className="mt-6 md:mt-8 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="bg-gray-300 text-black py-2 px-4 rounded-md text-xs md:text-base
                 hover:bg-gray-400 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-blue-500 text-white py-2 px-4 rounded-md text-xs md:text-base
                 hover:bg-blue-600 transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </main>

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-11/12 max-w-xs md:max-w-md text-center">
            <h2 className="text-md md:text-xl font-bold mb-4 md:mb-6">
              Confirm Password Change
            </h2>
            <p className="mb-4 md:mb-6 text-xs md:text-base">
              Are you sure you want to change your password?
            </p>
            <div className="flex justify-center gap-4 md:gap-6">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="py-2 px-3 md:px-4 text-xs md:text-base bg-gray-300 hover:bg-gray-400 text-black
                 rounded-md transition duration-300 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="py-2 px-3 md:px-4 text-xs md:text-base bg-blue-500 hover:bg-blue-600 text-white
                 rounded-md transition duration-300 ease-in-out"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-40">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-2/3 md:w-11/12 max-w-xs md:max-w-sm text-center">
            <h2 className="text-md md:text-xl font-semibold mb-4 md:mb-6">
              Success
            </h2>
            <p className="mb-4 md:mb-6 text-xs md:text-base">
              Password Changed Successfully!
            </p>
            <button
              onClick={handleCloseSuccessModal}
              className="bg-blue-500 text-white px-4 py-2 text-xs md:text-base rounded-md hover:bg-blue-700
               transition duration-300 ease-in-out"
            >
              OK
            </button>
          </div>
        </div>
      )}
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
    </div>
  );
};

export default ChangeAdminPassword;
