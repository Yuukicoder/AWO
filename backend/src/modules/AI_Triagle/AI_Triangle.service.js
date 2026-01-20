import { GoogleGenAI } from "@google/genai";
import { buildPrompt } from "../triage/promptBuilder.js";
import { raw } from "express";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  useGoogleAuth: false // Disable Google Cloud auth, use API key instead
});

class AI_TriangleService {
  /**
   * Phân tích text bằng gemini AI
   * @param {*} rawText
   * @param {*} context
   * @returns
   */
  async triageWithGemini(rawText, context = {}) {
    try {
      console.log("Starting triageWithGemini...");

      //Build Prompt
      const prompts = buildPrompt(rawText, context);


      //Gemini API Call
      const result = await ai.models.generateContent({
          model: "gemini-2.5-flash",
        contents: prompts,
        // generationConfig: {
        //   maxOutputTokens: 400,
        // },
      });
      const text = await result.response.text();

      //Parse JSON
      const jsonText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const parsed = JSON.parse(jsonText);

      // validate result
      this._validateTriangleResult(parsed);
      return {
        success: true,
        data: {
          title: parsed.title,
          description: parsed.description,
          summary: parsed.summary || parsed.description.substring(0, 200),

          // Classification
          category: parsed.category,
          priority: parsed.priority,
          labels: parsed.labels || [],

          // Estimation
          estimatedEffort: parsed.estimatedEffort || null,
          complexity: parsed.complexity || null,

          // Assignment Suggestion
          suggestedAssigneeRole: parsed.suggestedAssigneeRole || null,
          assignmentReason: parsed.assignmentReason || null,

          // MetaData
          confidenceScore: this._calculateConfidence(parsed),
          modelVersion: "gemini-2.0-flash",
          rawResponse: parsed,
        },
      };
    } catch (err) {
      console.error("Error in triageWithGemini:", err);
      return {
        success: false,
        error: "Triage failed: " + err.message,
        data: this._getFallbackResult(rawText),
      };
    }
  }

  _validateTriangleResult(result) {
    const required = ["title", "description", "priority", "category"];
    const missing = required.filter((field) => !result[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }

    // Validate priority
    const validPriorities = ["low", "medium", "high", "urgent"];
    const priority = result.priority.toLowerCase();

    if (!validPriorities.includes(priority)) {
      console.warn(
        `Invalid priority "${result.priority}", defaulting to "medium"`,
      );
      result.priority = "medium";
    }
  }

  async suggestAssigneee(triangleResult, users) {
    try {
      // Filter chỉ users active
      const activeUsers = users.filter((u) => u.is_active);

      if (activeUsers.length === 0) {
        return {
          suggestedAssignee: null,
          alternativeAssignees: [],
          confidence: "none",
          error: "No active users available",
        };
      }

      // Tính score cho từng user
      const scores = activeUsers.map((user) => {
        let score = 0;

        // 1. Role match (40 điểm)
        if (user.role === triangleResult.suggestedAssigneeRole) {
          score += 40;
        } else if (user.role === "admin" || user.role === "manager") {
          score += 20; // Admin/Manager có thể handle mọi thứ
        }

        // 2. Skill match (30 điểm)
        const skillMatch = this._calculateSkillMatch(
          triangleResult.labels,
          user.skills || [],
        );
        score += skillMatch * 30;

        // 3. Workload - ít việc hơn = tốt hơn (20 điểm)
        const currentTasks = user.currentWorkload || 0;
        if (currentTasks === 0) {
          score += 20;
        } else if (currentTasks < 3) {
          score += 15;
        } else if (currentTasks < 5) {
          score += 10;
        } else if (currentTasks < 8) {
          score += 5;
        }
        // currentTasks >= 8: 0 điểm

        // 4. Availability (10 điểm)
        if (user.is_available !== false) {
          score += 10;
        }

        return {
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          score: Math.round(score),
          reasoning: this._buildAssignmentReasoning(
            user,
            triangleResult,
            score,
          ),
        };
      });

      // Sort theo score giảm dần
      scores.sort((a, b) => b.score - a.score);

      const topScore = scores[0]?.score || 0;
      let confidence = "low";
      if (topScore >= 80) confidence = "high";
      else if (topScore >= 60) confidence = "medium";

      return {
        suggestedAssignee: scores[0] || null,
        alternativeAssignees: scores.slice(1, 3),
        confidence: confidence,
        allScores: scores, // Debug: xem tất cả scores
      };
    } catch (err) {
      console.error("Error suggesting assignee:", err);
      return {
        suggestedAssignee: null,
        alternativeAssignees: [],
        confidence: "none",
        error: err.message,
      };
    }
  }
  _calculateConfidence(result) {
    let score = 50; // Base 50%

    if (result.title && result.title.length > 10) score += 10;
    if (result.description && result.description.length > 50) score += 10;
    if (result.category) score += 10;
    if (result.labels && result.labels.length > 0) score += 10;
    if (result.estimatedEffort > 0) score += 10;

    return Math.min(score, 100) / 100; // Return 0.0 - 1.0
  }
  _calculateSkillMatch(requiredSkills, userSkills) {
    if (!requiredSkills || requiredSkills.length === 0) return 0;
    if (!userSkills || userSkills.length === 0) return 0;

    // Đếm số skill khớp
    const matches = requiredSkills.filter((reqSkill) =>
      userSkills.some((userSkill) => {
        const req = reqSkill.toLowerCase();
        const usr = userSkill.toLowerCase();
        return usr.includes(req) || req.includes(usr);
      }),
    );

    return matches.length / requiredSkills.length; // Return 0.0 - 1.0
  }
  _buildAssignmentReasoning(user, triangleResult, score) {
    const reasons = [];

    // Role match
    if (user.role === triangleResult.suggestedAssigneeRole) {
      reasons.push(`✅ Role phù hợp: ${user.role}`);
    }

    // Skill match
    const skillMatch = this._calculateSkillMatch(
      triangleResult.labels,
      user.skills || [],
    );
    if (skillMatch > 0.7) {
      reasons.push(`✅ Skill match cao (${Math.round(skillMatch * 100)}%)`);
    } else if (skillMatch > 0.3) {
      reasons.push(
        `⚠️ Skill match trung bình (${Math.round(skillMatch * 100)}%)`,
      );
    }

    // Workload
    const workload = user.currentWorkload || 0;
    if (workload === 0) {
      reasons.push("✅ Chưa có task nào");
    } else if (workload < 3) {
      reasons.push(`✅ Workload thấp (${workload} tasks)`);
    } else if (workload < 5) {
      reasons.push(`⚠️ Workload trung bình (${workload} tasks)`);
    } else {
      reasons.push(`❌ Workload cao (${workload} tasks)`);
    }

    // Overall score
    reasons.push(`📊 Điểm: ${score}/100`);

    return reasons.join("\n");
  }
  _getFallbackResult(rawText) {
    return {
      title: rawText.substring(0, 100) || "Untitled Task",
      description: rawText || "No description",
      summary: rawText.substring(0, 200) || "No summary",
      priority: "medium",
      category: "other",
      labels: [],
      estimatedEffort: 0,
      complexity: "moderate",
      suggestedAssigneeRole: "member",
      assignmentReason: "Auto-generated due to AI failure",
      confidenceScore: 0.1,
      isFallback: true,
    };
  }
}
export default new AI_TriangleService();
