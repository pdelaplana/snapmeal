import { googleAI } from "@genkit-ai/googleai";
import { genkit } from "genkit";

export const ai = genkit({
  plugins: [googleAI()],
  model: "googleai/gemini-1.5-flash-latest", // Changed to a known-working multimodal model
});
