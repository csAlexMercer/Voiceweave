import {collection,doc,setDoc,getDoc,getDocs,updateDoc,increment,arrayUnion,query,where,orderBy,limit,onSnapshot} from 'firebase/firestore';
import { db } from './firebase';

const generatePollID = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 7);
    return `poll_${timestamp}_${randomStr}`;
};

export const createPoll = async (weaveID, pollData, creatorUID) => {
    try {
        const pollID = generatePollID();

        let votes = {};
        if (pollData.pollType === 'petition') {
        votes = { yes: 0, no: 0 };
        } else {
        
        pollData.options.forEach(option => {
            votes[option] = 0;
        });
        }

        const newPoll = {
        pollID,
        weaveID,
        pollType: pollData.pollType,
        pollQuestion: pollData.pollQuestion,
        isAnonymous: pollData.isAnonymous,
        options: pollData.options || ['yes', 'no'],
        voteGoal: pollData.voteGoal,
        votes,
        voters: [],
        status: 'active',
        createdBy: creatorUID,
        createdAt: new Date().toISOString(),
        commentCount: 0
        };

        await setDoc(doc(db, 'polls', pollID), newPoll);

        await updateDoc(doc(db, 'weaves', weaveID), {
        pollCount: increment(1)
        });

        return { success: true, pollID, pollData: newPoll };
    } catch (error) {
        console.error('Create poll error:', error);
        throw error;
    }
    };

    export const getWeavePolls = async (weaveID) => {
    try {
        const pollsRef = collection(db, 'polls');
        const q = query(
        pollsRef,
        where('weaveID', '==', weaveID),
        orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
        }));
    } catch (error) {
        console.error('Get weave polls error:', error);
        throw error;
    }
};

export const getPollDetails = async (pollID) => {
  try {
    const pollDoc = await getDoc(doc(db, 'polls', pollID));
    
    if (!pollDoc.exists()) {
      throw new Error('Poll not found');
    }

    return { id: pollDoc.id, ...pollDoc.data() };
  } catch (error) {
    console.error('Get poll details error:', error);
    throw error;
  }
};

export const submitVote = async (pollID, option, userID, isAnonymous) => {
    try {
        const pollRef = doc(db, 'polls', pollID);
        const pollDoc = await getDoc(pollRef);

        if (!pollDoc.exists()) {
        throw new Error('Poll not found');
        }

        const pollData = pollDoc.data();

        if (!isAnonymous && pollData.voters.includes(userID)) {
        throw new Error('You have already voted on this poll');
        }

        const updateData = {
        [`votes.${option}`]: increment(1)
        };

        if (!isAnonymous) {
        updateData.voters = arrayUnion(userID);
        }

        await updateDoc(pollRef, updateData);

        const updatedPollDoc = await getDoc(pollRef);
        const updatedPollData = updatedPollDoc.data();
        const totalVotes = Object.values(updatedPollData.votes).reduce((a, b) => a + b, 0);

        if (totalVotes >= updatedPollData.voteGoal && updatedPollData.status === 'active') {
        await updateDoc(pollRef, { status: 'resolved' });
        }

        return { success: true };
    } catch (error) {
        console.error('Submit vote error:', error);
        throw error;
    }
};

export const hasUserVoted = async (pollID, userID) => {
    try {
        const pollDoc = await getDoc(doc(db, 'polls', pollID));
        
        if (!pollDoc.exists()) {
        return false;
        }

        const pollData = pollDoc.data();
        return pollData.voters.includes(userID);
    } catch (error) {
        console.error('Check vote error:', error);
        return false;
    }
};

export const subscribeToPoll = (pollID, callback) => {
    const pollRef = doc(db, 'polls', pollID);
    return onSnapshot(pollRef, (doc) => {
        if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
        }
    });
};

export const getTrendingPolls = async (weaveIDs) => {
    try {
        if (!weaveIDs || weaveIDs.length === 0) {
        return [];
        }

        const pollsRef = collection(db, 'polls');
        const q = query(
        pollsRef,
        where('weaveID', 'in', weaveIDs.slice(0, 10)),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
        }));
    } catch (error) {
        console.error('Get trending polls error:', error);
        throw error;
    }
};

export const addComment = async (pollID, commentText, userID, isAnonymous) => {
    try {
        const commentID = `comment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        
        const commentData = {
        commentID,
        pollID,
        content: commentText,
        createdBy: isAnonymous ? 'anonymous' : userID,
        isAnonymous,
        timestamp: new Date().toISOString()
        };

        await setDoc(doc(db, 'comments', commentID), commentData);

        await updateDoc(doc(db, 'polls', pollID), {
        commentCount: increment(1)
        });

        return { success: true, commentData };
    } catch (error) {
        console.error('Add comment error:', error);
        throw error;
    }
};

export const getPollComments = async (pollID) => {
    try {
        const commentsRef = collection(db, 'comments');
        const q = query(
        commentsRef,
        where('pollID', '==', pollID),
        orderBy('timestamp', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
        }));
    } catch (error) {
        console.error('Get comments error:', error);
        throw error;
    }
};

export const subscribeToComments = (pollID, callback) => {
    const commentsRef = collection(db, 'comments');
    const q = query(
        commentsRef,
        where('pollID', '==', pollID),
        orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
        const comments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
        }));
        callback(comments);
    });
};