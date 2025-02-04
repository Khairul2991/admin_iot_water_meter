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
    if (formData.passwordbaru && formData.konfirmasipasswordbaru) {
      if (formData.passwordbaru !== formData.konfirmasipasswordbaru) {
        setErrorMessage("Confirm new password does not match new password.");
      } else {
        setErrorMessage("");
      }
    }
  }, [formData.passwordbaru, formData.konfirmasipasswordbaru]);

  useEffect(() => {
    if (formData.passwordbaru.length > 0 && formData.passwordbaru.length <= 5) {
      setPasswordError("Password must be more than 5 characters.");
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
      const userEmail = localStorage.getItem("userEmail");

      if (!userEmail) {
        throw new Error("User email not found");
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
      className=" flex items-center justify-center"
      style={{ paddingTop: "6.5rem" }}
    >
      <main className="pb-8 w-full max-w-7xl">
        <div className="form-1 bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-14 text-center">
            Change Admin Password
          </h1>
          {error && (
            <Alert message={error} type="error" showIcon className="mb-4" />
          )}
          <div className="form-3 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
            <h1 className="text-xl font-bold mb-6 text-start">
              Admin Login Account
            </h1>
            <h1 className="text-l mb-6 text-start text-red-600">
              Be careful changing this data!
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-start">
              <div className="mb-4 relative">
                <label className="block text-gray-700 mb-2">Old Password</label>
                <input
                  type={isPasswordVisible.passwordlama ? "text" : "password"}
                  name="passwordlama"
                  value={formData.passwordlama}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 mt-2 flex items-center cursor-pointer"
                  onClick={() => togglePasswordVisibility("passwordlama")}
                >
                  {isPasswordVisible.passwordlama ? (
                    <AiFillEyeInvisible />
                  ) : (
                    <AiFillEye />
                  )}
                </div>
              </div>
              <div className="mb-4 relative">
                <label className="block text-gray-700 mb-2">New Password</label>
                <div className="flex items-center">
                  <input
                    type={isPasswordVisible.passwordbaru ? "text" : "password"}
                    name="passwordbaru"
                    value={formData.passwordbaru}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md p-2 w-full pr-10"
                  />
                  <div
                    className="absolute inset-y-0 right-0 pr-3 mt-2 flex items-center cursor-pointer"
                    onClick={() => togglePasswordVisibility("passwordbaru")}
                  >
                    {isPasswordVisible.passwordbaru ? (
                      <AiFillEyeInvisible />
                    ) : (
                      <AiFillEye />
                    )}
                  </div>
                </div>
                <p className="text-gray-500 font-bold text-sm mt-1">
                  Password must be more than 5 characters.
                </p>
              </div>
              <div className="mb-4 relative">
                <label className="block text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type={
                    isPasswordVisible.konfirmasipasswordbaru
                      ? "text"
                      : "password"
                  }
                  name="konfirmasipasswordbaru"
                  value={formData.konfirmasipasswordbaru}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 mt-8 flex items-center cursor-pointer"
                  onClick={() =>
                    togglePasswordVisibility("konfirmasipasswordbaru")
                  }
                >
                  {isPasswordVisible.konfirmasipasswordbaru ? (
                    <AiFillEyeInvisible />
                  ) : (
                    <AiFillEye />
                  )}
                </div>
              </div>
            </div>
            {errorMessage && (
              <p className="text-red-600 text-sm text-start">{errorMessage}</p>
            )}
          </div>

          <div className="mt-14 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="bg-gray-300 text-black py-2 px-4 rounded-md"
            >
              Back
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-blue-500 text-white py-2 px-4 rounded-md"
            >
              Submit
            </button>
          </div>
        </div>
      </main>

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center">
            <h2 className="text-xl font-semibold mb-10">
              Confirm Password Change
            </h2>
            <p className="mb-10">
              Are you sure you want to change your password?
            </p>
            <div className="flex justify-center space-x-12">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 transition duration-300 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center">
            <h2 className="text-xl font-semibold mb-8">Success</h2>
            <p className="mb-8">Password Changed Successfully!</p>
            <button
              onClick={handleCloseSuccessModal}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4">Loading...</h2>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeAdminPassword;
