import {createUserWithEmailAndPassword,signInWithEmailAndPassword,signInAnonymously,signOut,updateProfile,RecaptchaVerifier,signInWithPhoneNumber} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const signUpWithEmail = async (email, password, displayName) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName });

        await setDoc(doc(db, 'users', user.uid), {
        userID: user.uid,
        displayName: displayName,
        email: email,
        phoneNumber: null,
        joinedWeaves: [],
        createdAt: new Date().toISOString()
        });

        return user;
    } catch (error) {
        console.error('Sign up error:', error);
        throw error;
    }
};

export const signInWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Sign in error:', error);
        throw error;
    }
};

export const signInAnonymousUser = async () => {
    try {
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
        userID: user.uid,
        displayName: 'Anonymous User',
        email: null,
        phoneNumber: null,
        joinedWeaves: [],
        createdAt: new Date().toISOString(),
        isAnonymous: true
        });

        return user;
    } catch (error) {
        console.error('Anonymous sign in error:', error);
        throw error;
    }
    };

export const setupRecaptcha = (containerId) => {
    try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {

        }
        });
    } catch (error) {
        console.error('Recaptcha setup error:', error);
        throw error;
    }
};

export const sendOTP = async (phoneNumber) => {
    try {
        const appVerifier = window.recaptchaVerifier;
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        return confirmationResult;
    } catch (error) {
        console.error('OTP send error:', error);
        throw error;
    }
};

export const verifyOTP = async (confirmationResult, otp, displayName) => {
    try {
        const userCredential = await confirmationResult.confirm(otp);
        const user = userCredential.user;
    
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
            userID: user.uid,
            displayName: displayName || 'User',
            email: null,
            phoneNumber: user.phoneNumber,
            joinedWeaves: [],
            createdAt: new Date().toISOString()
        });
        }

        return user;
    } catch (error) {
        console.error('OTP verification error:', error);
        throw error;
    }
};


export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Sign out error:', error);
        throw error;
    }
};

export const getUserData = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
        return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Get user data error:', error);
        throw error;
    }
};