import { SYSTEM_PROMPT } from "./prompts/system.prompt.js";
import { buildUserPrompt } from "./prompts/user.prompt.js";

/**
 * Build prompt cho Gemini AI
 */
export function buildPrompt(rawText, context = {}) {
    const systemInstruction = `
Bạn là AI assistant chuyên phân tích và phân loại công việc.
Nhiệm vụ: Phân tích text và trả về JSON với cấu trúc sau:

{
  "title": "Tên ngắn gọn của task (max 100 chars)",
  "description": "Mô tả chi tiết",
  "summary": "Tóm tắt ngắn (1-2 câu)",
  "category": "bug|feature|support|documentation|other",
  "priority": "low|medium|high|urgent",
  "labels": ["tag1", "tag2"], // Kỹ năng cần thiết
  "estimatedEffort": 4, // Giờ ước tính
  "complexity": "simple|moderate|complex",
  "suggestedAssigneeRole": "developer|designer|tester|manager|support",
  "assignmentReason": "Lý do suggest role này"
}

Quy tắc phân loại priority:
- urgent: Ảnh hưởng nghiêm trọng, cần fix ngay (production down, security issue)
- high: Quan trọng, cần xử lý trong 1-2 ngày
- medium: Bình thường, xử lý trong tuần
- low: Không gấp, có thể làm sau

Quy tắc category:
- bug: Lỗi cần fix
- feature: Tính năng mới
- support: Hỗ trợ user, câu hỏi
- documentation: Viết/sửa docs
- other: Không thuộc loại trên

Labels: Kỹ năng cần có (frontend, backend, database, ui/ux, testing, etc.)
`;

    const userPrompt = `
Phân tích yêu cầu sau:

${context.source ? `Nguồn: ${context.source}` : ''}
${context.from ? `Từ: ${context.from}` : ''}
${context.subject ? `Tiêu đề: ${context.subject}` : ''}

Nội dung:
${rawText}

Trả về JSON theo format đã chỉ định.
`;

    return systemInstruction + '\n\n' + userPrompt;
}
