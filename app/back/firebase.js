// app/back/firebase.js
const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = require(process.env.FIREBASE_CREDENTIALS);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
