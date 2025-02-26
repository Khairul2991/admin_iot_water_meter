const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("./firebase");

const app = express();
const port = 5000; // Port untuk server

// Gunakan CORS untuk mengizinkan permintaan dari frontend
app.use(cors());

// Middleware untuk parsing JSON
app.use(bodyParser.json());

// Endpoint untuk mendaftarkan officer
app.post("/api/register-officer", async (req, res) => {
  const { name, email, phoneNumber, id, role } = req.body;

  try {
    // Membuat user di Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      displayName: name,
    });

    // Menyimpan data ke Firestore
    const firestore = admin.firestore();
    await firestore.collection("users").doc(userRecord.uid).set({
      id: id,
      name: name,
      email: email,
      phoneNumber: phoneNumber,
      role: role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ message: "Officer registered successfully." });
  } catch (error) {
    res.status(500).json({ error: "Officer Registration failed." });
  }
});

// Endpoint untuk mendaftarkan user
app.post("/api/register-user", async (req, res) => {
  const {
    name,
    email,
    phoneNumber,
    street,
    city,
    province,
    country,
    waterMeter1,
    role,
  } = req.body;

  try {
    // Membuat user di Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      displayName: name,
    });

    // Menyimpan data ke Firestore
    const firestore = admin.firestore();
    await firestore
      .collection("users")
      .doc(userRecord.uid)
      .set({
        name: name,
        email: email,
        phoneNumber: phoneNumber,
        street: street,
        city: city,
        province: province,
        country: country,
        waterMeter1: {
          address: waterMeter1.address || "",
          id: waterMeter1.id || "",
        },
        role: role,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.status(200).json({ message: "User registered successfully." });
  } catch (error) {
    res.status(500).json({ error: "User Registration failed." });
  }
});

// Endpoint untuk mengedit officer
app.patch("/api/edit-officer/:uid", async (req, res) => {
  const { uid } = req.params;
  const { name, id, phoneNumber } = req.body;

  try {
    const firestore = admin.firestore();
    const userDocRef = firestore.collection("users").doc(uid);

    // Periksa apakah user dengan UID tersebut ada
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "Officer not found." });
    }

    // Perbarui data officer di Firestore
    await userDocRef.update({
      name: name,
      id: id,
      phoneNumber: phoneNumber,
    });

    res.status(200).json({ message: "Officer data updated successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update officer data." });
  }
});

// Endpoint untuk mengedit User
app.patch("/api/edit-user/:uid", async (req, res) => {
  const { uid } = req.params;
  const { name, phoneNumber, street, city, province, country } = req.body;

  try {
    const firestore = admin.firestore();
    const userDocRef = firestore.collection("users").doc(uid);

    // Periksa apakah user dengan UID tersebut ada
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found." });
    }

    // Perbarui data User di Firestore
    await userDocRef.update({
      name: name,
      phoneNumber: phoneNumber,
      street: street,
      city: city,
      province: province,
      country: country,
    });

    res.status(200).json({ message: "User data updated successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user data." });
  }
});

// Endpoint untuk mengedit Water Meter
app.patch("/api/edit-water-meters/:uid", async (req, res) => {
  const { uid } = req.params;
  const { waterMeters } = req.body;

  try {
    const firestore = admin.firestore();
    const userDocRef = firestore.collection("users").doc(uid);

    // Periksa apakah user dengan UID tersebut ada
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found." });
    }

    // Dapatkan data user saat ini
    const existingUserData = userDoc.data();

    // Identifikasi semua field water meter yang ada
    const existingWaterMeterKeys = Object.keys(existingUserData).filter((key) =>
      key.startsWith("waterMeter")
    );

    // Siapkan update untuk menghapus water meter yang tidak ada di input
    const updateData = {};
    existingWaterMeterKeys.forEach((existingKey) => {
      if (!Object.keys(waterMeters).includes(existingKey)) {
        // Gunakan FieldValue.delete() untuk menghapus field
        updateData[existingKey] = admin.firestore.FieldValue.delete();
      }
    });

    // Tambahkan water meter baru atau update yang ada
    Object.entries(waterMeters).forEach(([key, value]) => {
      updateData[key] = value;
    });

    // Lakukan update dokumen
    await userDocRef.update(updateData);

    res.status(200).json({
      message: "Water meters updated successfully.",
      waterMeters: waterMeters,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update water meter." });
  }
});

// Endpoint untuk menghapus officer
app.delete("/api/delete-officers", async (req, res) => {
  const { officerIds } = req.body;

  try {
    const firestore = admin.firestore();
    const auth = admin.auth();

    // Hapus dokumen dari Firestore
    const batch = firestore.batch();
    officerIds.forEach((officerId) => {
      const userDocRef = firestore.collection("users").doc(officerId);
      batch.delete(userDocRef);
    });

    await batch.commit();

    // Hapus user dari Firebase Authentication
    const deletePromises = officerIds.map((officerId) =>
      auth.deleteUser(officerId)
    );
    await Promise.all(deletePromises);

    res.status(200).json({ message: "Officers deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete officer." });
  }
});

// Endpoint untuk menghapus users
app.delete("/api/delete-users", async (req, res) => {
  const { userIds } = req.body;

  try {
    const firestore = admin.firestore();
    const auth = admin.auth();

    // Hapus dokumen dari Firestore
    const batch = firestore.batch();
    userIds.forEach((userId) => {
      const userDocRef = firestore.collection("users").doc(userId);
      batch.delete(userDocRef);
    });

    await batch.commit();

    // Hapus user dari Firebase Authentication
    const deletePromises = userIds.map((userId) => auth.deleteUser(userId));
    await Promise.all(deletePromises);

    res.status(200).json({ message: "Users deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user." });
  }
});

// Jalankan server
app.listen(port, () => {});
