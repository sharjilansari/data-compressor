import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  updateProfile,
  User
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export const login = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error('Failed to sign in. Please check your credentials.');
  }
};

export const signup = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, {
      displayName: name,
    });
  } catch (error) {
    throw new Error('Failed to create account. Please try again.');
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error('Failed to sign out. Please try again.');
  }
};

export const googleSignIn = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    throw new Error('Failed to sign in with Google. Please try again.');
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
}; 