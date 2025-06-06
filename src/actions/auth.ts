"use server";

import { auth } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from "firebase/auth";
import { z } from "zod";

const emailPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export async function registerUser(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const parsed = emailPasswordSchema.safeParse(rawFormData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: { form: [error.message] } };
  }
}

export async function loginUser(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const parsed = emailPasswordSchema.safeParse(rawFormData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error: any)
   {
    return { success: false, error: { form: [error.message] } };
  }
}

export async function signOutUser() {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
