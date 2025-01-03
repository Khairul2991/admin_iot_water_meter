const admin = require("firebase-admin");

// Inisialisasi Firebase Admin SDK menggunakan file service account
const serviceAccount = require("./watermeterapp-b80c2-firebase-adminsdk-14vjt-78377fe244.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
