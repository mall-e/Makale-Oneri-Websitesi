import { db } from '../firebase-config';

const getUserInterests = async (userId) => {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      return userDoc.data().interest;
    } else {
      throw new Error('No such user');
    }
  } catch (error) {
    console.error("Error getting user interests:", error);
    throw error;
  }
};

export default getUserInterests;
