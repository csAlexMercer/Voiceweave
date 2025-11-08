import {collection,doc,setDoc,getDoc,getDocs,updateDoc,arrayUnion,query,where} from 'firebase/firestore';
import { db } from './firebase';
import { generateWeaveID, generateJoinCode } from '../utils/generateCode';

export const createWeave = async (weaveTitle, weaveDescription, creatorUID, creatorEmail) => {
    try {
        const weaveID = generateWeaveID();
        const joinCode = generateJoinCode();

        const weaveData = {
        weaveID,
        title: weaveTitle,
        description: weaveDescription,
        joinCode,
        createdBy: creatorUID,
        members: [creatorUID],
        emails: creatorEmail ? [creatorEmail] : [],
        admins: [creatorUID],
        createdAt: new Date().toISOString(),
        pollCount: 0
        };

        await setDoc(doc(db, 'weaves', weaveID), weaveData);

        const userRef = doc(db, 'users', creatorUID);
        await updateDoc(userRef, {
        joinedWeaves: arrayUnion(weaveID)
        });

        return { success: true, weaveID, joinCode, weaveData };
    } catch (error) {
        console.error('Create weave error:', error);
        throw error;
    }
    };

    export const joinWeaveByCode = async (joinCode, userID, userEmail) => {
    try {
        const weavesRef = collection(db, 'weaves');
        const q = query(weavesRef, where('joinCode', '==', joinCode.toUpperCase().replace('-', '')));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
        throw new Error('Invalid join code');
        }

        const weaveDoc = querySnapshot.docs[0];
        const weaveID = weaveDoc.id;
        const weaveData = weaveDoc.data();

        if (weaveData.members.includes(userID)) {
        throw new Error('You are already a member of this weave');
        }

        await updateDoc(doc(db, 'weaves', weaveID), {
        members: arrayUnion(userID),
        emails: userEmail ? arrayUnion(userEmail) : weaveData.emails
        });

        await updateDoc(doc(db, 'users', userID), {
        joinedWeaves: arrayUnion(weaveID)
        });

        return { success: true, weaveID, weaveData };
    } catch (error) {
        console.error('Join weave error:', error);
        throw error;
    }
    };

    export const getUserWeaves = async (userID) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userID));
        
        if (!userDoc.exists()) {
        return [];
        }

        const joinedWeaves = userDoc.data().joinedWeaves || [];
        
        if (joinedWeaves.length === 0) {
        return [];
        }

        const weavePromises = joinedWeaves.map(weaveID => 
        getDoc(doc(db, 'weaves', weaveID))
        );

        const weaveDocs = await Promise.all(weavePromises);
        
        return weaveDocs
        .filter(doc => doc.exists())
        .map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Get user weaves error:', error);
        throw error;
    }
};


export const getWeaveDetails = async (weaveID) => {
    try {
        const weaveDoc = await getDoc(doc(db, 'weaves', weaveID));
        
        if (!weaveDoc.exists()) {
        throw new Error('Weave not found');
        }

        return { id: weaveDoc.id, ...weaveDoc.data() };
    } catch (error) {
        console.error('Get weave details error:', error);
        throw error;
    }
};