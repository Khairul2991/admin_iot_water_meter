// src/pages/AddUser.jsx
// eslint-disable-next-line no-unused-vars
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../Number.css";
import { useNavigate } from "react-router-dom";

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    street: "",
    city: "",
    province: "",
    country: "",
    waterMeter1: {
      address: "",
      id: "",
    },
  });

  const [errors, setErrors] = useState({});
  const inputRefs = useRef({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };

    // Handle nested waterMeter1 fields
    if (name === "waterMeterAddress" || name === "waterMeterId") {
      setFormData({
        ...formData,
        waterMeter1: {
          ...formData.waterMeter1,
          [name === "waterMeterAddress" ? "address" : "id"]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (name === "email" && !validateEmail(value)) {
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
      if (key === "waterMeter1") {
        // Validate nested fields in waterMeter1
        if (!formData.waterMeter1.address) {
          newErrors.waterMeterAddress = "Water Meter Address is required";
          if (!firstErrorElement) {
            firstErrorElement = inputRefs.current.waterMeterAddress;
          }
        }
        if (!formData.waterMeter1.id) {
          newErrors.waterMeterId = "Water Meter ID is required";
          if (!firstErrorElement) {
            firstErrorElement = inputRefs.current.waterMeterId;
          }
        }
      } else {
        if (!formData[key]) {
          newErrors[key] = `${
            key.charAt(0).toUpperCase() +
            key.slice(1).replace(/([A-Z])/g, " $1")
          } is required`;
          if (!firstErrorElement) {
            firstErrorElement = inputRefs.current[key];
          }
        }

        // Additional email validation
        if (key === "email" && formData[key] && !validateEmail(formData[key])) {
          newErrors[key] = "Invalid email format";
          if (!firstErrorElement) {
            firstErrorElement = inputRefs.current[key];
          }
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
        "http://localhost:5000/api/register-user",
        {
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          street: formData.street,
          city: formData.city,
          province: formData.province,
          country: formData.country,
          waterMeter1: formData.waterMeter1,
          role: "user",
        }
      );

      if (response.status === 200) {
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error registering user:", error);
      alert(
        `Failed to add user: ${error.response?.data?.error || error.message}`
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
    navigate("/UserData", { replace: true });
  };

  const handleCancel = () => {
    window.location.href = "/UserData";
  };

  return (
    <div
      className="min-h-screen flex justify-center"
      style={{ paddingTop: "6.5rem" }}
    >
      <main className="pb-8 w-full max-w-7xl">
        <div className="form-1 bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Add User Data</h1>
          <form onSubmit={handleSubmitWithConfirmation}>
            <div className="form-2 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
              <h1 className="text-xl font-bold mb-6 text-start">User Data</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-start">
                {[
                  { name: "name", label: "Name" },
                  { name: "email", label: "Email" },
                  { name: "phoneNumber", label: "Phone Number" },
                  { name: "street", label: "Street" },
                  { name: "city", label: "City" },
                  { name: "province", label: "Province" },
                  { name: "country", label: "Country" },
                  { name: "waterMeterAddress", label: "Water Meter Address" },
                  { name: "waterMeterId", label: "Water Meter ID" },
                ].map(({ name, label }) => (
                  <div className="mb-4" key={name}>
                    <label className="block text-gray-700 mb-2" htmlFor={name}>
                      {label}
                    </label>
                    <input
                      type="text"
                      id={name}
                      name={name}
                      value={
                        name === "waterMeterAddress" || name === "waterMeterId"
                          ? formData.waterMeter1[
                              name === "waterMeterAddress" ? "address" : "id"
                            ]
                          : formData[name]
                      }
                      onChange={handleChange}
                      ref={(el) => (inputRefs.current[name] = el)}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                    {errors[name] && (
                      <p className="text-red-500 text-sm">{errors[name]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-black py-2 px-4 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded-md"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-8">Confirmation</h2>
            <p className="mb-8">Are you sure you want to add this data?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelModal}
                className="bg-gray-300 text-black py-2 px-4 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmModal}
                className="bg-blue-500 text-white py-2 px-4 rounded-md"
              >
                Yes
              </button>
            </div>
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
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md text-center">
            <h2 className="text-xl font-semibold mb-8">Success</h2>
            <p className="mb-8">Data added successfully!</p>
            <button
              onClick={handleCloseSuccessModal}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUser;
