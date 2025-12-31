import { SYSTEM_PROMPT } from "./prompts/system.prompt.js";
import { buildUserPrompt } from "./prompts/user.prompt.js";

export function buildPrompt(text) {
  return {
    system: SYSTEM_PROMPT,
    user: buildUserPrompt(text)
  };
}
