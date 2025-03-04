// src/pages/UserData.js
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Alert } from "antd";
import { FaEdit, FaTrash } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import { firestore } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuthToken, isAuthenticated } from "../utils/authUtils";
import axios from "axios";
import ExcelJS from "exceljs";
import { useNavigate } from "react-router-dom";
import { Buffer } from "buffer";
window.Buffer = Buffer;

const UserData = () => {
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [sorter, setSorter] = useState({ columnKey: null, order: null });
  const [showExportPopup, setShowExportPopup] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
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

  const renderHighlightedText = (text, search) => {
    if (!search.trim()) return text;
    const parts = text.split(new RegExp(`(${search})`, "gi")) || [];
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <span key={i} style={{ backgroundColor: "yellow" }}>
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const handleSearch = (value) => {
    setSearchQuery(value);

    const filtered = records.filter((record) => {
      // Cari di kolom utama
      const mainFieldsMatch = Object.keys(record).some((key) => {
        if (
          key !== "key" &&
          key !== "waterMeters" &&
          typeof record[key] === "string"
        ) {
          return record[key].toLowerCase().includes(value.toLowerCase());
        }
        return false;
      });

      // Cari di water meters
      const waterMetersMatch = Object.values(record.waterMeters || {}).some(
        (waterMeter) => {
          if (typeof waterMeter === "object") {
            return (
              (waterMeter.id &&
                waterMeter.id.toLowerCase().includes(value.toLowerCase())) ||
              (waterMeter.address &&
                waterMeter.address.toLowerCase().includes(value.toLowerCase()))
            );
          }
          return false;
        }
      );

      return mainFieldsMatch || waterMetersMatch;
    });

    setFilteredRecords(filtered);
  };

  const getAllWaterMeterKeys = (data) => {
    const allKeys = new Set();
    data.forEach((record) => {
      Object.keys(record.waterMeters || {})
        .filter((key) => key.startsWith("waterMeter"))
        .map((key) => {
          // Ekstrak nomor dari key waterMeter
          const match = key.match(/waterMeter(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .forEach((num) => allKeys.add(num));
    });

    // Urutkan keys numerik
    return Array.from(allKeys).sort((a, b) => a - b);
  };

  const allWaterMeterKeys = getAllWaterMeterKeys(records);

  // Dynamically add waterMeter columns with two sub-columns: ID and Address
  const waterMeterColumns = allWaterMeterKeys.flatMap((num) => {
    const key = `waterMeter${num}`;
    return [
      {
        title: (
          <div style={{ textAlign: "center" }}>{`Water Meter ID ${num}`}</div>
        ),
        dataIndex: ["waterMeters", key, "id"],
        key: `${key}_id`,
        align: "center",
        width: 180,
        render: (id) => (id ? renderHighlightedText(id, searchQuery) : "--"),
      },
      {
        title: (
          <div
            style={{ textAlign: "center" }}
          >{`Water Meter Address ${num}`}</div>
        ),
        dataIndex: ["waterMeters", key, "address"],
        key: `${key}_address`,
        align: "center",
        width: 250,
        render: (address) =>
          address ? renderHighlightedText(address, searchQuery) : "--",
      },
    ];
  });

  const isMobile = window.innerWidth <= 768;

  const columns = [
    {
      title: "No.",
      dataIndex: "no",
      key: "no",
      align: "center",
      fixed: isMobile ? false : "left",
      width: 60,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: <div style={{ textAlign: "center" }}>{`Name`}</div>,
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      fixed: isMobile ? false : "left",
      width: 220,
      render: (text) => renderHighlightedText(text, searchQuery),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
      sorter: (a, b) => a.email.localeCompare(b.email),
      width: 220,
      render: (text) => renderHighlightedText(text, searchQuery),
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      align: "center",
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
      width: 150,
      render: (text) => renderHighlightedText(text, searchQuery),
    },
    {
      title: "Street",
      dataIndex: "street",
      key: "street",
      align: "center",
      sorter: (a, b) => a.street.localeCompare(b.street),
      width: 350,
      render: (text) => renderHighlightedText(text, searchQuery),
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      align: "center",
      sorter: (a, b) => a.city.localeCompare(b.city),
      width: 200,
      render: (text) => renderHighlightedText(text, searchQuery),
    },
    {
      title: "Province",
      dataIndex: "province",
      key: "province",
      align: "center",
      sorter: (a, b) => a.province.localeCompare(b.province),
      width: 200,
      render: (text) => renderHighlightedText(text, searchQuery),
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      align: "center",
      sorter: (a, b) => a.country.localeCompare(b.country),
      width: 200,
      render: (text) => renderHighlightedText(text, searchQuery),
    },
    ...waterMeterColumns,
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      fixed: isMobile ? false : "right",
      align: "center",
      render: (text, record) => (
        <div>
          <Button
            icon={<FaEdit />}
            className="bg-green-300 fill-white hover:text-custom-blue rounded-lg p-2 transition
             duration-300 ease-in-out mb-4 text-xs md:text-base"
            onClick={() => handleEditData(record.key)} // Handle navigation to EditPetugas
          >
            Edit User Data
          </Button>
          <Button
            icon={<FaEdit />}
            className="bg-blue-300 fill-white hover:text-custom-blue rounded-lg p-2 transition
             duration-300 ease-in-out text-xs md:text-base"
            onClick={() => handleEditWaterMeter(record.key)} // Handle Add Water Meter functionality
          >
            Edit Water Meter
          </Button>
        </div>
      ),
      width: 240,
    },
  ];

  const handleEditData = (key) => {
    const selectedData = records.find((record) => record.key === key);
    navigate("/EditUser", { state: { data: selectedData } });
  };

  const handleEditWaterMeter = (key) => {
    const selectedData = records.find((record) => record.key === key);
    navigate("/EditWaterMeter", { state: { data: selectedData } });
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      const q = query(
        collection(firestore, "users"),
        where("role", "==", "user")
      );
      const querySnapshot = await getDocs(q);

      const dataWithIds = querySnapshot.docs.map((doc, index) => {
        const data = doc.data();
        const waterMeters = Object.keys(data)
          .filter((key) => key.startsWith("waterMeter"))
          .reduce((acc, key) => {
            acc[key] = data[key];
            return acc;
          }, {});

        return {
          key: doc.id,
          no: index + 1,
          ...data,
          waterMeters,
        };
      });

      setRecords(dataWithIds);
      setFilteredRecords(dataWithIds);

      setLoading(false);
    } catch (error) {
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    setSorter(sorter);
    setPagination(pagination);
    const sortedRecords = [...filteredRecords].sort((a, b) => {
      if (sorter.columnKey) {
        const aValue = a[sorter.columnKey];
        const bValue = b[sorter.columnKey];
        if (sorter.order === "ascend") {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      }
      return 0;
    });
    setFilteredRecords(sortedRecords);
  };

  const handleAddData = () => {
    navigate("/AddUser");
  };

  const handleDeleteData = () => {
    if (selectedRowKeys.length > 0) {
      setShowModal(true);
    }
  };

  const handleRowSelection = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const handleConfirmModal = (e) => {
    e.preventDefault();
    setShowModal(false);
    handleDeleteSelectedRows();
  };

  const handleDeleteSelectedRows = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      // Kirim request ke backend untuk menghapus users
      await axios.delete("http://localhost:5000/api/delete-users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          userIds: selectedRowKeys, // Gunakan selectedRowKeys yang berisi ID user
        },
      });

      // Update state setelah berhasil menghapus
      setRecords((prevRecords) =>
        prevRecords.filter((record) => !selectedRowKeys.includes(record.key))
      );
      setFilteredRecords((prevRecords) =>
        prevRecords.filter((record) => !selectedRowKeys.includes(record.key))
      );

      setSelectedRowKeys([]);
      setLoading(false);
      setShowSuccessModal(true);
    } catch (error) {
      setError("Failed to delete data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const confirmExport = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("UserData");

      // Definisikan kolom yang akan di-export
      const exportColumns = [
        { title: "Name", dataIndex: "name" },
        { title: "Email", dataIndex: "email" },
        { title: "Phone Number", dataIndex: "phoneNumber" },
        { title: "Street", dataIndex: "street" },
        { title: "City", dataIndex: "city" },
        { title: "Province", dataIndex: "province" },
        { title: "Country", dataIndex: "country" },
      ];

      // Tambahkan kolom Water Meter secara dinamis
      const maxWaterMeters = Math.max(
        ...filteredRecords.map((record) => {
          // Hitung jumlah water meter yang sebenarnya
          const waterMeterCount = Object.keys(record.waterMeters || {})
            .filter((key) => key.startsWith("waterMeter"))
            .map((key) => parseInt(key.replace("waterMeter", ""))).length;
          return waterMeterCount;
        })
      );

      for (let i = 1; i <= maxWaterMeters; i++) {
        exportColumns.push(
          { title: `Water Meter ${i} ID`, dataIndex: `waterMeter${i}ID` },
          {
            title: `Water Meter ${i} Address`,
            dataIndex: `waterMeter${i}Address`,
          }
        );
      }

      // Fungsi untuk membersihkan data
      const cleanRecord = (record) => {
        const cleaned = {};

        // Tambahkan data utama
        exportColumns.slice(0, 7).forEach((col) => {
          cleaned[col.dataIndex] = record[col.dataIndex] || "";
        });

        // Tambahkan data water meter
        for (let i = 1; i <= maxWaterMeters; i++) {
          const key = `waterMeter${i}`;
          const waterMeter = record.waterMeters?.[key] || {};

          cleaned[`waterMeter${i}ID`] = waterMeter.id || "";
          cleaned[`waterMeter${i}Address`] = waterMeter.address || "";
        }

        return cleaned;
      };

      // Bersihkan dan proses data
      const processedRecords = filteredRecords
        .map(cleanRecord)
        .filter((record) => Object.values(record).some((val) => val !== ""));

      // Add headers
      const headers = ["No.", ...exportColumns.map((col) => col.title)];
      worksheet.addRow(headers);

      // Format header row
      worksheet.getRow(1).height = 30;
      worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.font = { bold: true };
      });

      // Sort filteredRecords based on current sorter state
      let sortedRecords = [...processedRecords];
      if (sorter.columnKey && sorter.order) {
        sortedRecords.sort((a, b) => {
          const aValue = a[sorter.columnKey];
          const bValue = b[sorter.columnKey];

          // Ensure comparison based on type
          if (typeof aValue === "string" && typeof bValue === "string") {
            return sorter.order === "ascend"
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          } else if (typeof aValue === "number" && typeof bValue === "number") {
            return sorter.order === "ascend"
              ? aValue - bValue
              : bValue - aValue;
          }
          return 0; // Default case if types are inconsistent
        });
      }

      // Prepare and add data
      // Prepare and add data
      for (let [index, record] of sortedRecords.entries()) {
        const rowData = [
          index + 1, // New sequential "No." column
          ...exportColumns.map((col) => record[col.dataIndex] || ""),
        ];
        const row = worksheet.addRow(rowData);
        row.height = 25;

        // Format data rows
        row.eachCell((cell) => {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        });
      }

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          let columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength + 2 < 10 ? 10 : maxLength + 2;
      });

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "user_data.xlsx";
      link.click();

      setShowExportPopup(false);
      Modal.success({
        title: "Export Success",
        content: "Data exported successfully.",
        centered: true,
      });
    } catch (error) {
      setShowExportPopup(false);
      Modal.error({
        title: "Export Failed",
        content: "Unable to export data. Please try again.",
        centered: true,
      });
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: handleRowSelection,
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/UserData", { replace: true });
  };

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div
      className="pb-8 px-4 sm:px-6 lg:px-8"
      style={{
        paddingTop: window.innerWidth <= 768 ? "6rem" : "6.5rem",
        minHeight: "100vh",
      }}
    >
      <div className="bg-white shadow sm:rounded-lg p-4 md:p-6">
        <div className="flex justify-start gap-3">
          <h1 className="text-lg md:text-2xl font-bold mb-10">User Data</h1>
          <MdRefresh
            className="bg-gray-300 fill-black rounded-lg p-2 cursor-pointer hover:bg-gray-400"
            size={window.innerWidth <= 768 ? 30 : 36}
            onClick={handleRefresh}
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-6">
          {/* Action Buttons */}
          <div className="w-full md:w-auto flex flex-col-reverse md:flex-row gap-2 md:gap-4">
            <div className="flex flex-row md:flex-row gap-2 md:gap-4">
              <Button
                type="secondary"
                className="w-full md:w-auto bg-custom-blue text-white px-3 py-1 md:px-4 md:py-2 
                rounded-md hover:bg-blue-700 text-xs md:text-base"
                onClick={handleAddData}
              >
                Add Data
              </Button>
              <Button
                type="secondary"
                className="w-full md:w-auto bg-green-600 text-white px-3 py-1 md:px-4 md:py-2 
                rounded-md hover:bg-green-700 text-xs md:text-base"
                onClick={() => setShowExportPopup(true)}
              >
                Export
              </Button>
            </div>
          </div>
          {/* Search and Delete */}
          <div className="w-full md:w-auto flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <p className="text-sm md:text-base font-semibold">Search:</p>
              <input
                type="text"
                className="border border-gray-300 rounded-md p-1 md:p-2 text-sm md:text-base flex-grow md:flex-grow-0"
                placeholder="Filter by"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: window.innerWidth <= 768 ? 150 : 250 }}
              />

              <div className="flex justify-center items-center space-x-2">
                <FaTrash
                  className={`${
                    selectedRowKeys.length > 0
                      ? "hover:bg-red-700 cursor-pointer"
                      : "cursor-not-allowed opacity-50"
                  } bg-red-600 fill-white hover:text-custom-blue rounded-lg p-2 transition duration-300
                   ease-in-out self-start md:self-auto`}
                  size={window.innerWidth <= 768 ? 30 : 36}
                  disabled={selectedRowKeys.length === 0}
                  onClick={handleDeleteData}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white shadow p-2 md:p-4 rounded w-full overflow-x-auto">
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              className="mb-4 text-xs md:text-sm"
            />
          )}
          <Table
            columns={columns.map((col) => ({
              ...col,
              className: "text-xs md:text-base",
            }))}
            dataSource={filteredRecords}
            rowSelection={rowSelection}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: [
                "10",
                "20",
                "50",
                "100",
                filteredRecords.length.toString(),
              ],
              showTotal: (total) => `Total ${total} items`,
              className: "text-xs md:text-base",
            }}
            bordered
            loading={loading}
            onChange={handleTableChange}
            scroll={{ x: "max-content", y: 600 }}
            sticky
          />
          <style>
            {`
              .ant-table-thead > tr > th {
                white-space: nowrap;
                width: 9.5rem;
              }

              @media (min-width: 768px) {
                .ant-table-thead > tr > th {
                  font-size: 0.925rem;
                  width: 9rem;
                }
                
                .ant-table-tbody > tr > td {
                  font-size: 0.875rem;
                }
              }
            `}
          </style>
        </div>
      </div>

      {/* Export Confirmation Modal */}
      <Modal
        title="Export Data"
        open={showExportPopup}
        onOk={confirmExport}
        onCancel={() => setShowExportPopup(false)}
        okText="Yes"
        cancelText="Cancel"
        className="fixed inset-0 flex items-center justify-center"
      >
        <p className="text-sm md:text-base">
          Are you sure you want to export this data to Excel?
        </p>
      </Modal>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-xs md:max-w-lg">
            <h2 className="text-md md:text-xl font-bold mb-4 md:mb-6">
              Confirm Delete User
            </h2>
            <p className="mb-4 md:mb-6 text-xs md:text-base">
              Are you sure you want to delete {selectedRowKeys.length} of
              selected user data?
            </p>
            <div className="flex justify-center gap-4 md:gap-6">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-3 md:px-4 rounded-md text-xs md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmModal}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 md:px-4 rounded-md text-xs md:text-base"
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
              Successfully Delete
            </h2>
            <p className="mb-4 md:mb-6 text-xs md:text-base">
              Data successfully deleted!
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

export default UserData;
