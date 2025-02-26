// src/pages/AddOfficer.jsx
// eslint-disable-next-line no-unused-vars
import React, { useState, useRef, useEffect } from "react";
import "../Number.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { isAuthenticated } from "../utils/authUtils";

const AddOfficer = () => {
  const [formData, setFormData] = useState({
    name: "",
    id: "",
    email: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({});
  const inputRefs = useRef({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/", { 
        state: { 
          message: "Session expired. Please login again." 
        } 
      });
    }
  }, [navigate]);

  // Fungsi untuk mengubah setiap kata menjadi huruf besar
  const capitalizeWords = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Jika input adalah nama, gunakan capitalize
    if (name === "name") {
      processedValue = capitalizeWords(value);
    }

    let newErrors = { ...errors };

    setFormData({ ...formData, [name]: processedValue });

    if (!processedValue.trim()) {
      newErrors[name] = `${
        name.charAt(0).toUpperCase() + name.slice(1)
      } is required`;
    } else if (name === "email" && !validateEmail(processedValue)) {
      newErrors[name] = "Invalid email format";
    } else {
      delete newErrors[name];
    }

    setErrors(newErrors);

    // Scroll to the first error if any
    const firstErrorElement = Object.keys(newErrors)[0];
    if (firstErrorElement) {
      inputRefs.current[firstErrorElement]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    let firstErrorElement = null;

    Object.keys(formData).forEach((key) => {
      if (!formData[key].trim()) {
        newErrors[key] = `${
          key.charAt(0).toUpperCase() + key.slice(1)
        } is required`;
        if (!firstErrorElement) {
          firstErrorElement = inputRefs.current[key];
        }
      } else if (key === "email" && !validateEmail(formData[key])) {
        newErrors[key] = "Invalid email format";
        if (!firstErrorElement) {
          firstErrorElement = inputRefs.current[key];
        }
      }
    });
    setErrors(newErrors);

    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/register-officer", // Endpoint backend
        {
          name: formData.name,
          id: formData.id,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          role: "officer", // Role bisa Anda sesuaikan
        }
      );

      if (response.status === 200) {
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error adding officer:", error);
      alert(
        `Failed to register officer: ${
          error.response?.data?.error || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWithConfirmation = async (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirmModal = (e) => {
    e.preventDefault();
    setShowModal(false);
    handleSubmit();
  };

  const handleCancelModal = () => {
    setShowModal(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/OfficerData", { replace: true });
  };

  const handleCancel = () => {
    window.location.href = "/OfficerData";
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
            Add Officer Data
          </h1>
          <form onSubmit={handleSubmitWithConfirmation}>
            <div className="form-2 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-2 md:my-4">
              <h2 className="text-md md:text-xl font-bold mb-6 text-start">
                Officer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-start">
                {[
                  { name: "name", label: "Name" },
                  { name: "id", label: "ID Officer" },
                  { name: "email", label: "Email" },
                  { name: "phoneNumber", label: "Phone Number" },
                ].map(({ name, label }) => {
                  return (
                    <div className="mb-3 md:mb-4" key={name}>
                      <label
                        className="block text-xs md:text-base text-gray-700 mb-1 md:mb-2"
                        htmlFor={name}
                      >
                        {label}
                      </label>
                      <input
                        type={"text"}
                        id={name}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        ref={(el) => (inputRefs.current[name] = el)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs md:text-base"
                      />
                      {errors[name] && (
                        <p className="text-red-500 text-xs md:text-sm mt-1">
                          {errors[name]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 md:mt-8 flex justify-between">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-black py-2 px-4 rounded-md text-xs md:text-base
                 hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded-md text-xs md:text-base
                 hover:bg-blue-600 transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-3/4 md:w-11/12 max-w-xs md:max-w-sm">
            <h2 className="text-md md:text-xl font-bold mb-4 md:mb-6">
              Confirm Add Officer
            </h2>
            <p className="mb-4 md:mb-6 text-xs md:text-base">
              Are you sure you want to add this data?
            </p>
            <div className="flex justify-center gap-4 md:gap-6">
              <button
                onClick={handleCancelModal}
                className="py-2 px-3 md:px-4 text-xs md:text-base bg-gray-300 hover:bg-gray-400 text-black rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmModal}
                className="py-2 px-3 md:px-4 text-xs md:text-base bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Confirm
              </button>
            </div>
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
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-40">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-2/3 md:w-11/12 max-w-xs md:max-w-sm text-center">
            <h2 className="text-md md:text-xl font-semibold mb-4 md:mb-6">
              Success
            </h2>
            <p className="mb-4 md:mb-6 text-xs md:text-base">
              Data added successfully!
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
    </div>
  );
};

export default AddOfficer;
