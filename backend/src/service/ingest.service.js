import IngestPayload from '../models/IngetPayload.js';
import { publishEvent } from '../config/redis.js'; // Sử dụng publishEvent để gửi event

export async function processIngest(input) {
  // Map input thành IngestPayload object (không save DB)
  const ingestPayload = {
    source: input.source,
    sourceMeta: input.sourceMeta || {},
    rawText: input.rawText,
    attachments: input.attachments || [],
    receivedAt: new Date()
  };

  // Gửi tiếp cho AI Triage Service qua Redis event
  await publishEvent('ingestPayloadReceived', ingestPayload);

  return ingestPayload;
}

// Hàm riêng cho Slack
export async function processSlackWebhook(slackEvent) {
  const ingestPayload = {
    source: "slack",
    sourceMeta: {
      channelId: slackEvent.channel,
      userId: slackEvent.user
    },
    rawText: slackEvent.text,
    attachments: [], // Nếu có file, parse thêm
    receivedAt: new Date()
  };

  return await processIngest(ingestPayload);
}