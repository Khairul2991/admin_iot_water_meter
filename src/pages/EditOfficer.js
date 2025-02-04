// src/pages/EditOfficer.jsx
// eslint-disable-next-line no-unused-vars
import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../Number.css";

const EditOfficer = () => {
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

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if data is provided in location state
        if (location.state && location.state.data) {
          // Set form data from the selected record
          setFormData({
            uid: location.state.data.key, // Gunakan key dari Firebase
            name: location.state.data.name || "",
            id: location.state.data.id || "",
            email: location.state.data.email || "",
            phoneNumber: location.state.data.phoneNumber || "",
          });
        } else {
          navigate("/OfficerData");
        }
      } catch (error) {
        let errorMessage =
          "An error occurred while retrieving data. Please try again later.";

        if (error.response) {
          // Server responded with a status other than 200 range
          errorMessage = error.response.data.message || errorMessage;
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = "No response from server. Check your connection.";
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage = error.message;
        }

        // Display the error message to the user
        alert(errorMessage);
        // Optionally navigate away or handle the error state
        navigate("/OfficerData");
      }
    };

    fetchData();
  }, [location.state, navigate]);

  // Tambahkan fungsi capitalizeWords
  const capitalizeWords = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    let newErrors = { ...errors };

    // Kapitalisasi untuk field-field tertentu
    const capitalizationFields = ["name"];

    if (capitalizationFields.includes(name)) {
      processedValue = capitalizeWords(value);
    }

    setFormData({ ...formData, [name]: processedValue });

    if (!processedValue.trim()) {
      newErrors[name] = `${
        name.charAt(0).toUpperCase() + name.slice(1)
      } is required`;
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

  const validateForm = () => {
    const newErrors = {};
    let firstErrorElement = null;

    Object.keys(formData).forEach((key) => {
      const value = String(formData[key] || ""); // Pastikan selalu string
      if (!value.trim()) {
        newErrors[key] = `${
          key.charAt(0).toUpperCase() + key.slice(1)
        } is required`;
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
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No token found");
      }

      // Kirim data yang diperbarui ke backend
      await axios.patch(
        `http://localhost:5000/api/edit-officer/${formData.uid}`,
        {
          name: formData.name,
          id: formData.id,
          phoneNumber: formData.phoneNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setShowSuccessModal(true);
    } catch (error) {
      let errorMessage = "An error occurred. Please try again later.";

      if (error.response) {
        if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Check your connection.";
      } else {
        errorMessage = error.message;
      }

      alert(errorMessage);
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
      className="min-h-screen flex justify-center"
      style={{ paddingTop: "6.5rem" }}
    >
      <main className="pb-8 w-full max-w-7xl">
        <div className="form-1 bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Edit Officer Data
          </h1>
          <form onSubmit={handleSubmitWithConfirmation}>
            <div className="form-2 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
              <h1 className="text-xl font-bold mb-6 text-start">
                Officer Data
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-start">
                {[
                  { name: "name", label: "Name" },
                  { name: "id", label: "ID Officer" },
                  { name: "email", label: "Email", isDisabled: true },
                  { name: "phoneNumber", label: "Phone Number" },
                ].map(({ name, label, isDisabled }) => {
                  return (
                    <div className="mb-4" key={name}>
                      <label
                        className="block text-gray-700 mb-2"
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
                        disabled={isDisabled}
                        className={`border border-gray-300 rounded-md p-2 w-full ${
                          isDisabled ? "bg-gray-200 cursor-not-allowed" : ""
                        }`}
                      />
                      {errors[name] && (
                        <p className="text-red-500 text-sm">{errors[name]}</p>
                      )}
                      {name === "email" && (
                        <p className="text-gray-600 font-bold text-sm mt-1">
                          * email cannot be changed
                        </p>
                      )}
                    </div>
                  );
                })}
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
          <div className="bg-white px-8 py-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-8">Confirmation</h2>
            <p className="mb-8">Are you sure you want to change this data?</p>
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
            <p className="mb-8">Data updated successfully!</p>
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

export default EditOfficer;
