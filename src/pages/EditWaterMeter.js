// src/pages/EditWaterMeter.jsx
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthToken, isAuthenticated } from "../utils/authUtils";
import "../Number.css";

const EditWaterMeter = () => {
  const [formData, setFormData] = useState({
    waterMeters: {},
  });

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [meterToDelete, setMeterToDelete] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [waterMeterCount, setWaterMeterCount] = useState(1);

  const location = useLocation();
  const navigate = useNavigate();

    useEffect(() => {
      if (!isAuthenticated()) {
        navigate("/");
        throw new Error("Session expired. Please login again.");
      }
    }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if data is provided in location state
        if (location.state && location.state.data) {
          const userData = location.state.data;

          // Ekstrak dan urutkan water meter keys berdasarkan nomor
          const waterMeterKeys = Object.keys(userData)
            .filter((key) => key.startsWith("waterMeter"))
            .sort((a, b) => {
              // Ekstrak nomor dari kunci water meter
              const numA = parseInt(a.replace("waterMeter", ""), 10) || 0;
              const numB = parseInt(b.replace("waterMeter", ""), 10) || 0;
              return numA - numB;
            });

          // Buat objek water meters yang terurut
          const waterMeters = waterMeterKeys.reduce((acc, key) => {
            // Hanya tambahkan water meter yang memiliki data
            if (userData[key].id || userData[key].address) {
              acc[key] = {
                id: userData[key].id || "",
                address: userData[key].address || "",
              };
            }
            return acc;
          }, {});

          setFormData({
            uid: userData.key,
            waterMeters: waterMeters,
          });

          // Set water meter count berdasarkan nomor tertinggi
          const maxWaterMeterNumber =
            waterMeterKeys.length > 0
              ? Math.max(
                  ...waterMeterKeys.map(
                    (key) => parseInt(key.replace("waterMeter", ""), 10) || 0
                  )
                )
              : 0;

          setWaterMeterCount(maxWaterMeterNumber);
        } else {
          // Jika tidak ada data, set waterMeters menjadi objek kosong
          setFormData({
            waterMeters: {},
          });
          setWaterMeterCount(0);
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
        navigate("/UserData");
      }
    };

    fetchData();
  }, [location.state, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check if it's a water meter input
    const waterMeterMatch = name.match(/^(waterMeter\d+)_(id|address)$/);

    if (waterMeterMatch) {
      const [, meterKey, field] = waterMeterMatch;
      setFormData((prev) => ({
        ...prev,
        waterMeters: {
          ...prev.waterMeters,
          [meterKey]: {
            ...prev.waterMeters[meterKey],
            [field]: value,
          },
        },
      }));
    } else {
      // Regular input handling
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addWaterMeter = () => {
    // Temukan nomor water meter tertinggi yang sudah ada
    const existingNumbers = Object.keys(formData.waterMeters).map(
      (key) => parseInt(key.replace("waterMeter", ""), 10) || 0
    );

    const nextNumber =
      existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

    const newMeterKey = `waterMeter${nextNumber}`;

    setFormData((prev) => ({
      ...prev,
      waterMeters: {
        ...prev.waterMeters,
        [newMeterKey]: { id: "", address: "" },
      },
    }));

    setWaterMeterCount(nextNumber);
  };

  const removeWaterMeter = (meterKey) => {
    setFormData((prev) => {
      const newWaterMeters = { ...prev.waterMeters };
      delete newWaterMeters[meterKey];
      return { ...prev, waterMeters: newWaterMeters };
    });
    setWaterMeterCount((prev) => prev - 1);
  };

  // Tambahkan fungsi baru untuk menangani konfirmasi delete
  const handleDeleteConfirmation = (meterKey) => {
    setMeterToDelete(meterKey);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (meterToDelete) {
      removeWaterMeter(meterToDelete);
      setShowDeleteModal(false);
      setMeterToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setMeterToDelete(null);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No token found");
      }

      // Dapatkan semua keys water meter dan urutkan berdasarkan nomor
      const sortedMeterKeys = Object.keys(formData.waterMeters).sort((a, b) => {
        const numA = parseInt(a.replace("waterMeter", ""), 10) || 0;
        const numB = parseInt(b.replace("waterMeter", ""), 10) || 0;
        return numA - numB;
      });

      // Buat objek water meter baru dengan reindexing
      const reindexedWaterMeters = sortedMeterKeys.reduce((acc, key, index) => {
        // Gunakan index + 1 untuk membuat nomor baru yang berurutan
        const newKey = `waterMeter${index + 1}`;

        acc[newKey] = {
          id: formData.waterMeters[key].id,
          address: formData.waterMeters[key].address,
        };

        return acc;
      }, {});

      // Log data yang akan dikirim
      console.log("UID:", formData.uid);
      console.log("Water Meter Data:", formData.waterMeters);

      // Kirim data yang diperbarui ke endpoint baru
      await axios.patch(
        `http://localhost:5000/api/edit-water-meters/${formData.uid}`,
        { waterMeters: reindexedWaterMeters },
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
        // Log detail response error
        console.error("Error Response:", error.response);

        if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Log detail request error
        console.error("Error Request:", error.request);
        errorMessage = "No response from server. Check your connection.";
      } else {
        // Log error message
        console.error("Error Message:", error.message);
        errorMessage = error.message;
      }

      // Tampilkan error yang lebih informatif
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
    navigate("/UserData", { replace: true });
  };

  const handleCancel = () => {
    navigate("/UserData");
  };

  return (
    <div
      className="min-h-screen flex justify-center"
      style={{ paddingTop: "6.5rem" }}
    >
      <main className="pb-8 w-full max-w-7xl">
        <div className="form-1 bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Edit Water Meter
          </h1>
          <form onSubmit={handleSubmitWithConfirmation}>
            {/* Water Meters Section */}
            <div className="form-2 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Water Meter</h1>
                <button
                  type="button"
                  onClick={addWaterMeter}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Add Water Meter
                </button>
              </div>

              {Object.entries(formData.waterMeters).map(
                ([meterKey, meterData], index) => (
                  <div
                    key={meterKey}
                    className="mb-4 p-4 border rounded-lg relative"
                  >
                    {Object.keys(formData.waterMeters).length >= 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteConfirmation(meterKey)}
                        className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md"
                      >
                        Remove
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Water Meter ID {index + 1}
                        </label>
                        <input
                          type="text"
                          name={`${meterKey}_id`}
                          value={meterData.id}
                          onChange={handleChange}
                          className="border border-gray-300 rounded-md p-2 w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Water Meter Address {index + 1}
                        </label>
                        <input
                          type="text"
                          name={`${meterKey}_address`}
                          value={meterData.address}
                          onChange={handleChange}
                          className="border border-gray-300 rounded-md p-2 w-full"
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
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

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white px-8 py-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-8">Confirm Deletion</h2>
            <p className="mb-8">
              Are you sure you want to remove this water meter?
            </p>
            <div className="flex justify-center gap-12">
              <button
                onClick={handleCancelDelete}
                className="bg-gray-300 text-black py-2 px-4 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-500 text-white py-2 px-4 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

export default EditWaterMeter;
