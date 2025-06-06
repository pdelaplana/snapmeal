
"use server";

// import { auth } from "@/lib/firebase"; // Not needed for mocked auth
// import { 
//   createUserWithEmailAndPassword, 
//   signInWithEmailAndPassword,
//   signOut as firebaseSignOut
// } from "firebase/auth"; // Not needed for mocked auth
import { z } from "zod";

const emailPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export async function registerUser(prevState: any, formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  // Basic validation still useful even if not hitting Firebase
  const parsed = emailPasswordSchema.safeParse(rawFormData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }
  const email = parsed.data.email;
  console.log("Mocking registerUser: email received", email);
  // Simulate a slight delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, email: email };
}

export async function loginUser(prevState: any, formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  // Basic validation still useful
  const parsed = emailPasswordSchema.safeParse(rawFormData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }
  const email = parsed.data.email;
  console.log("Mocking loginUser: email received", email);
  // Simulate a slight delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, email: email };
}

export async function signOutUser() {
  console.log("Mocking signOutUser action");
  // Simulate a slight delay
  await new Promise(resolve => setTimeout(resolve, 300));
  // This server action's return value is less critical now as client state is managed by AuthContext.mockSignOut
  return { success: true, message: "User signed out (mocked action)." };
}
