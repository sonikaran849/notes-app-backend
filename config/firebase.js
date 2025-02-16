// config/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json'); // Firebase Service Account JSON

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://twilio-6ab59.appspot.com', // Replace with your Firebase Storage bucket URL
});

const bucket = admin.storage().bucket();

module.exports = bucket;

