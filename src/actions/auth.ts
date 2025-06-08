
"use server";

import { auth } from "@/lib/firebase"; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type AuthError
} from "firebase/auth"; 
import { z } from "zod";

const emailPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

function formatFirebaseError(error: AuthError) {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return { email: ['This email address is already in use.'] };
    case 'auth/invalid-email':
      return { email: ['Please enter a valid email address.'] };
    case 'auth/weak-password':
      return { password: ['Password is too weak. It must be at least 6 characters.'] };
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': // Covers both user-not-found and wrong-password in newer SDK versions
      return { form: ['Invalid email or password. Please try again.'] };
    default:
      console.error("Firebase Auth Error:", error);
      return { form: ['An unexpected error occurred. Please try again.'] };
  }
}

export async function registerUser(prevState: any, formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const parsed = emailPasswordSchema.safeParse(rawFormData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }
  
  const { email, password } = parsed.data;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, email: userCredential.user.email };
  } catch (error) {
    return { success: false, error: formatFirebaseError(error as AuthError) };
  }
}

export async function loginUser(prevState: any, formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const parsed = emailPasswordSchema.safeParse(rawFormData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }
  const { email, password } = parsed.data;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, email: userCredential.user.email };
  } catch (error) {
    return { success: false, error: formatFirebaseError(error as AuthError) };
  }
}

export async function signOutUser() {
  try {
    await firebaseSignOut(auth);
    return { success: true, message: "User signed out successfully." };
  } catch (error) {
    console.error("Error signing out:", error);
    return { success: false, message: "Failed to sign out.", error: (error as AuthError).message };
  }
}
