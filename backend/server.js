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
  const { name, email, id, role } = req.body;

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
      role: role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ message: "Officer registered successfully." });
  } catch (error) {
    console.error("Error registering officer:", error);
    res.status(500).json({ error: error.message });
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
    console.error("Error registering user:", error);
    res.status(500).json({ error: error.message });
  }
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
