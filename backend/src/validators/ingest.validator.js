const ALLOWED_SOURCES = ["email", "webhook", "manual"];

/**
 * Validate manual ingest input
 */
export function validateIngestInput(body) {
  if (!body) {
    return "Request body is required";
  }

  const { source, rawText, description } = body;

  // Validate source
  if (!source) {
    return "source is required";
  }

  if (!ALLOWED_SOURCES.includes(source)) {
    return `source must be one of: ${ALLOWED_SOURCES.join(', ')}`;
  }

  // Validate rawText or description
  const content = rawText || description;
  if (!content) {
    return "rawText or description is required";
  }

  if (typeof content !== "string") {
    return "rawText/description must be a string";
  }

  if (content.trim().length < 10) {
    return "content is too short (min 10 chars)";
  }

  if (content.length > 10000) {
    return "content is too long (max 10000 chars)";
  }

  return null; // PASS
}

/**
 * Validate email payload
 */
export function validateEmailPayload(body) {
  if (!body) {
    return "Request body is required";
  }

  const { source, from, subject, body: emailBody } = body;

  // Validate source
  if (source && source !== 'email') {
    return "source must be 'email'";
  }

  if (!from) {
    return "from email address is required";
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(from)) {
    return "from must be a valid email address";
  }

  if (!subject || subject.trim().length === 0) {
    return "email subject is required";
  }

  if (!emailBody || emailBody.trim().length === 0) {
    return "email body is required";
  }

  // Validate body length
  if (emailBody.length > 10000) {
    return "email body is too long (max 10000 chars)";
  }

  return null;
}

/**
 * Validate webhook payload
 */
export function validateWebhookPayload(body) {
  if (!body) {
    return "Request body is required";
  }

  const { source, rawData, rawText } = body;

  if (source && source !== 'webhook') {
    return "source must be 'webhook'";
  }

  if (!rawData && !rawText) {
    return "rawData or rawText is required";
  }

  // If rawText provided, validate length
  if (rawText) {
    if (typeof rawText !== "string") {
      return "rawText must be a string";
    }

    if (rawText.trim().length < 5) {
      return "rawText is too short (min 5 chars)";
    }
  }

  return null;
}

/**
 * Sanitize input to prevent XSS and injection attacks
 */
export function sanitizeInput(text) {
  if (typeof text !== 'string') return text;
  
  // Remove potential XSS patterns
  return text
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}
