import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBtWilEl21300B_8P-xc83IOIk7OR3CIJc",
    authDomain: "voiceweave-hv.firebaseapp.com",
    projectId: "voiceweave-hv",
    storageBucket: "voiceweave-hv.firebasestorage.app",
    messagingSenderId: "320221262339",
    appId: "1:320221262339:web:b807e9c1cdf43f468e1436"
};



const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

export default app;