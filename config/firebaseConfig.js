const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
// const firestore = require("firebase/firestore");
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");
const firebaseStorage = require("firebase/storage");
var admin = require("firebase-admin");
var serviceAccount = require("../serviceAccountKey.json");
const firebaseConfig = {
  apiKey: "AIzaSyDWeMEdGjMMYbZRSIwkV7el7DsQyqm7M0M",
  authDomain: "blog-3c055.firebaseapp.com",
  projectId: "blog-3c055",
  storageBucket: "blog-3c055.appspot.com",
  messagingSenderId: "12790173831",
  appId: "1:12790173831:web:3f491ee4fae29e48fca822",
  measurementId: "G-YJZ0490MZL",
};
//initialise firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, firebaseApp, firebaseStorage, auth, db };
