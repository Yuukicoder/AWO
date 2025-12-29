const ALLOWED_SOURCES = ["slack", "form", "email"];

export function validateIngestInput(body) {
  if (!body) {
    return "Request body is required";
  }

  const { source, text } = body;

  // Validate source
  if (!source) {
    return "source is required";
  }

  if (!ALLOWED_SOURCES.includes(source)) {
    return "source is invalid";
  }

  // Validate text
  if (!text) {
    return "text is required";
  }

  if (typeof text !== "string") {
    return "text must be a string";
  }

  if (text.length < 10) {
    return "text is too short (min 10 chars)";
  }

  if (text.length > 2000) {
    return "text is too long (max 2000 chars)";
  }

  return null; // PASS
}
