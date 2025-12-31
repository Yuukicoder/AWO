const ALLOWED_SOURCES = ["slack", "form", "email"];

export function validateIngestInput(body) {
  if (!body) {
    return "Request body is required";
  }

  const { source, rawText } = body;

  // Validate source
  if (!source) {
    return "source is required";
  }

  if (!ALLOWED_SOURCES.includes(source)) {
    return "source is invalid";
  }

  // Validate rawText
  if (!rawText) {
    return "rawText is required";
  }

  if (typeof rawText !== "string") {
    return "rawText must be a string";
  }

  if (rawText.length < 10) {
    return "rawText is too short (min 10 chars)";
  }

  if (rawText.length > 2000) {
    return "rawText is too long (max 2000 chars)";
  }

  return null; // PASS
}
