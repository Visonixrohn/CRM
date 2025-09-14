// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBRkOtit8t4q4PGgli0CgHQrcMS039i_8c",
  authDomain: "crm-miguel.firebaseapp.com",
  projectId: "crm-miguel",
  storageBucket: "crm-miguel.firebasestorage.app",
  messagingSenderId: "818098683659",
  appId: "1:818098683659:web:689db1bd0ffb45bbb72c0e",
  measurementId: "G-KC2CK3JL40"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export { app, analytics, messaging, getToken, onMessage };
