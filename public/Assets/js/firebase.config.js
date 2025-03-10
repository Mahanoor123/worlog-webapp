import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZhvD2WwJkWDU8QAS9Yf4uIMahvi9PzEM",
  authDomain: "worlog-webapp-6cb3f.firebaseapp.com",
  projectId: "worlog-webapp-6cb3f",
  storageBucket: "worlog-webapp-6cb3f.firebasestorage.app",
  messagingSenderId: "211638053410",
  appId: "1:211638053410:web:e872826dffb56d5516b87b",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
