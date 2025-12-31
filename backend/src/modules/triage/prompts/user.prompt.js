export function buildUserPrompt(text) {
  return `
Analyze the following request and extract task information.

Request:
"""
${text}
"""
`;
}
