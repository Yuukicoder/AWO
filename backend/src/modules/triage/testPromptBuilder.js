import { buildPrompt } from "./promptBuilder.js";

const prompt = buildPrompt("User không login được bằng Google từ sáng nay");

console.log("=== SYSTEM PROMPT ===");
console.log(prompt.system);

console.log("=== USER PROMPT ===");
console.log(prompt.user);
// node src/modules/triage/testPromptBuilder.js
