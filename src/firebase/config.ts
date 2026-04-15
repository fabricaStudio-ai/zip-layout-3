import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCXzi4xD5jCD7-4dBh0WLB61dc9POETqf8",
  authDomain: "appassed.firebaseapp.com",
  projectId: "appassed",
  storageBucket: "appassed.firebasestorage.app",
  messagingSenderId: "436282015551",
  appId: "1:436282015551:web:54ba144c7e6fed53451d8a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
