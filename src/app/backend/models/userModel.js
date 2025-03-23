import { db } from "../firebase.js";
import { ref, set, get } from "firebase/database";

// Add a new user
export const addUser = async (userId, name, email, licensePlate) => {
  await set(ref(db, `users/${userId}`), {
    username: name,    
    licensePlate: licensePlate,
  });
};

// Get user by ID
export const getUser = async (userId) => {
  const snapshot = await get(ref(db, `users/${userId}`));
  return snapshot.val();
};