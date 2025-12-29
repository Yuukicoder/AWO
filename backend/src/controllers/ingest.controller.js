import { validateIngestInput } from "../validators/ingest.validator.js";

export async function ingestController(req, res) {
  const error = validateIngestInput(req.body);

  if (error) {
    return res.status(400).json({
      error: "Invalid payload",
      message: error
    });
  }

  // TASK 2.1 yêu cầu: chỉ cần nhận được request
  return res.status(202).json({
    message: "Accepted"
  });
}
