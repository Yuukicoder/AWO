PROJECT 1 – Hệ thống Điều Phối Task Tự Động cho Team Nội Bộ (AI Workflow Orchestrator) 

1. Mô tả một câu Nền tảng điều phối workflow tự động cho đội nhóm, dùng AI để phân tích yêu cầu và tự động phân công công việc tối ưu. 
2. Use case thực tế Doanh nghiệp có team 5–15 người: nhận yêu cầu từ email/Slack/Gmail > hệ thống phân tích nội dung > tự tạo ticket > tự gán người phù hợp dựa trên workload + skill + deadline > theo dõi tiến độ theo thời gian thực.

3. Full Tech Stack Frontend: React + Zustand/Redux Toolkit, TailwindCSS Backend: NestJS (hoặc Node.js Express), TypeScript AI: OpenAI API / Ollama local model Real-time: WebSocket + Redis pub/sub Database: PostgreSQL + Prisma Infra: Docker, CI/CD GitHub Actions 

4. Advanced Features AI triage ticket: phân tích email/yêu cầu và convert thành task + priority + assignee. Dynamic workload balancing: theo dõi workload từng người theo thời gian thực. Workflow editor dạng drag-and-drop (giống Zapier). “Audit Trail Timeline” chuẩn enterprise. Real-time collaboration: nhiều người cùng chỉnh task không bị conflict (CRDT-lite). 

5. Pitch trong CV “Built an AI-driven workflow orchestration platform with real-time collaboration, automated task routing, and scalable event-driven architecture—similar to an internal ‘mini-Jira + Zapier’ used to streamline team productivity.” phân tích rõ về ý tưởng này
