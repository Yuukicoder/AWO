# AI Workflow Orchestrator - Development Plan

## 📋 Executive Summary

**Product Vision**: Xây dựng nền tảng điều phối workflow tự động sử dụng AI để tối ưu hóa việc phân công và quản lý công việc cho team nội bộ (5-15 người).

**Core Value Proposition**:
- Giảm 70% thời gian thủ công trong việc phân tích và phân công task
- Tối ưu hóa workload balancing theo real-time
- Tăng transparency và accountability thông qua audit trail
- Tự động hóa workflow từ nguồn đa kênh (Email, Slack, Gmail)

---

## 🎯 Business Requirements

### 1. Primary User Personas

**Team Lead / Manager**
- Cần: Tổng quan workload của team, phân công tự động, báo cáo hiệu suất
- Pain points: Mất thời gian phân tích yêu cầu và assign task thủ công

**Team Member**
- Cần: Dashboard rõ ràng về task của mình, priority, deadline
- Pain points: Không biết priority nào quan trọng nhất, bị overload

**Stakeholder / Client**
- Cần: Track tiến độ request, nhận notification về progress
- Pain points: Thiếu transparency, không biết request đang ở đâu

### 2. Business Goals

**Phase 1 (MVP - 8 weeks)**
- ✅ Tự động nhận và phân tích yêu cầu từ email/webhook
- ✅ AI triage: phân loại, xác định priority và suggest assignee
- ✅ Dashboard cơ bản cho task management
- ✅ Real-time notification

**Phase 2 (Growth - 6 weeks)**
- ✅ Workload balancing tự động
- ✅ Workflow editor (drag-and-drop)
- ✅ Advanced analytics & reporting
- ✅ Integration với Slack, Gmail API

**Phase 3 (Scale - 4 weeks)**
- ✅ Real-time collaboration (multiple users)
- ✅ Audit trail timeline chi tiết
- ✅ Custom workflow templates
- ✅ API public cho third-party integration

---

## 🏗️ Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     External Sources                         │
│         (Email, Slack, Gmail, Webhook, Manual Entry)         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Ingestion Layer                            │
│  - Email Parser    - Slack Webhook   - Gmail API            │
│  - Validation      - Normalization   - Rate Limiting         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Triage Engine                          │
│  - Intent Classification  - Priority Detection               │
│  - Skill Matching         - Deadline Extraction              │
│  - Suggested Assignee     - Task Breakdown                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 Workflow Orchestrator                        │
│  - Task Creation       - Assignment Logic                    │
│  - Workload Balancing  - Deadline Management                 │
│  - Status Tracking     - Event Streaming                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
            ┌─────────┴─────────┐
            ▼                   ▼
┌─────────────────────┐ ┌─────────────────────┐
│   PostgreSQL DB     │ │   Redis Cache       │
│   - Tasks           │ │   - Sessions        │
│   - Users           │ │   - Real-time Data  │
│   - Workflows       │ │   - Pub/Sub         │
│   - Audit Logs      │ │   - Queue           │
└─────────────────────┘ └─────────────────────┘
            │                   │
            └─────────┬─────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway                              │
│              (REST + WebSocket + GraphQL)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 Frontend Application                         │
│  React + Zustand + TailwindCSS + Socket.io-client           │
│  - Dashboard  - Task Manager  - Workflow Editor  - Reports  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Decisions & Rationale

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Frontend** | React + Zustand | Simple state management, better performance than Redux cho real-time updates |
| **Backend** | Node.js + Express | Nhanh trong prototyping, ecosystem rộng, TypeScript support |
| **Database** | PostgreSQL | ACID compliance cho audit trail, JSON support, proven at scale |
| **Cache/Queue** | Redis | Sub-millisecond latency, pub/sub cho real-time, persistent queue |
| **AI** | OpenAI API (primary) + Ollama (fallback) | Production-ready, có thể switch sang local model khi cần |
| **Real-time** | Socket.io + Redis Adapter | Auto-reconnection, room support, horizontal scaling |
| **ORM** | Raw queries / Sequelize | Performance control, explicit migration management |

---

## 📝 Development Phases

### **PHASE 1: MVP Foundation (8 weeks)**

#### Week 1-2: Core Infrastructure
**Backend Setup**
- [ ] Initialize Node.js + Express + TypeScript project structure
- [ ] Setup PostgreSQL database với Docker
- [ ] Setup Redis với Docker
- [ ] Implement authentication (JWT + refresh token)
- [ ] Setup environment configuration (.env management)
- [ ] Basic error handling middleware
- [ ] Setup logging (Winston/Pino)

**Frontend Setup**
- [ ] Initialize React + Vite project
- [ ] Setup TailwindCSS + shadcn/ui components
- [ ] Setup Zustand stores (auth, task, ticket)
- [ ] Implement authentication flow (login, logout, protected routes)
- [ ] Basic layout components (Header, Sidebar, Main)

**DevOps**
- [ ] Docker Compose cho local development
- [ ] Git workflow và branching strategy
- [ ] Setup linting (ESLint, Prettier)

---

#### Week 3-4: Ingestion & AI Triage

**Backend - Ingestion Module**
```
POST /api/v1/ingest
- Accept: Email forward, Webhook payload, Manual entry
- Validation: Required fields, format checking
- Store raw payload trong `ingest_payloads` table
- Trigger AI triage job
```

**Backend - AI Triage Service**
```javascript
// Triage Flow
1. Parse raw content
2. Call OpenAI API with structured prompt:
   - Extract title, description, requirements
   - Classify category (bug, feature, support, etc.)
   - Determine priority (low, medium, high, urgent)
   - Estimate complexity/effort
   - Suggest assignee based on:
     * Skill matching (từ user profile)
     * Current workload
     * Past performance
3. Return structured result
4. Store in `ai_metadata` table linked to ticket
```

**Database Schema**
```sql
-- ingest_payloads
id, source (email/slack/manual), raw_data (jsonb), 
created_at, processed_at, status

-- tickets
id, title, description, priority, status, 
category, estimated_hours, due_date, 
created_by, created_at, updated_at

-- ai_metadata
id, ticket_id, raw_ai_response (jsonb), 
confidence_score, suggested_assignee_id, 
reasoning (text), created_at

-- users
id, email, name, role, skills (jsonb), 
avatar_url, is_active, created_at

-- assignments
id, ticket_id, user_id, assigned_by (user_id/system), 
assigned_at, status, notes
```

**Frontend - Ingestion Form**
- [ ] Manual ticket creation form
- [ ] File attachment support
- [ ] Preview of AI suggestions before creating ticket

**Testing**
- [ ] Unit tests cho AI prompt builder
- [ ] Integration test cho ingestion endpoint
- [ ] Test với various input formats

---

#### Week 5-6: Task Management Core

**Backend - Ticket/Task CRUD**
```
GET    /api/v1/tickets              - List tickets với pagination & filters
GET    /api/v1/tickets/:id          - Ticket detail
POST   /api/v1/tickets              - Create ticket (manual hoặc từ AI)
PATCH  /api/v1/tickets/:id          - Update ticket
DELETE /api/v1/tickets/:id          - Soft delete
POST   /api/v1/tickets/:id/assign   - Assign to user
PATCH  /api/v1/tickets/:id/status   - Update status
GET    /api/v1/tickets/:id/history  - Get audit trail
```
**Backend - Assignment Logic**
```javascript
// Auto-assignment algorithm
function calculateBestAssignee(ticket, users) {
  const scores = users.map(user => {
    let score = 0;
    
    // 1. Skill match (40%)
    score += calculateSkillMatch(ticket.skills_required, user.skills) * 0.4;
    
    // 2. Current workload (30%) - penalize if overloaded
    const workload = getUserCurrentWorkload(user.id);
    score += (1 - workload / MAX_WORKLOAD) * 0.3;
    
    // 3. Past performance on similar tasks (20%)
    score += getUserPerformanceScore(user.id, ticket.category) * 0.2;
    
    // 4. Availability (10%)
    score += user.is_available ? 0.1 : 0;
    
    return { user, score };
  });
  
  return scores.sort((a, b) => b.score - a.score)[0].user;
}
```

**Frontend - Task Dashboard**
- [ ] Kanban board view (Todo, In Progress, Review, Done)
- [ ] List view với filters (assignee, priority, status, date range)
- [ ] Task detail modal với tabs (Details, Comments, History, Files)
- [ ] Drag & drop để change status
- [ ] Bulk actions (assign, update priority, delete)

**Frontend - Task Detail Page**
- [ ] Rich text editor cho description
- [ ] Comment system với real-time updates
- [ ] File attachments
- [ ] Activity timeline
- [ ] AI suggestions panel (show confidence score, reasoning)

---

#### Week 7-8: Real-time & Notifications

**Backend - WebSocket Integration**
```javascript
// Socket.io events
io.on('connection', (socket) => {
  // Join user's personal room
  socket.join(`user:${socket.userId}`);
  
  // Subscribe to tickets user is watching
  socket.on('watch:ticket', (ticketId) => {
    socket.join(`ticket:${ticketId}`);
  });
});

// Emit events
- ticket:created
- ticket:updated
- ticket:assigned
- ticket:status_changed
- ticket:comment_added
- workload:updated
```

**Backend - Notification Service**
```javascript
// Notification types
- Email: Digest hàng ngày, urgent tickets
- In-app: Real-time updates
- Slack: Optional integration

// Notification preferences (user settings)
- Email notifications: On/Off, Frequency
- Slack notifications: On/Off
- Desktop push: On/Off
```

**Frontend - Real-time Updates**
- [ ] Socket.io client setup
- [ ] Auto-refresh dashboard khi có ticket mới
- [ ] Toast notifications cho events
- [ ] Unread notification badge
- [ ] Notification center dropdown

**Testing & Polish**
- [ ] E2E testing cho core flows
- [ ] Performance testing (handle 100+ concurrent users)
- [ ] Security audit (SQL injection, XSS, CSRF)
- [ ] Bug fixes và UI polish

---

### **PHASE 2: Advanced Features (6 weeks)**

#### Week 9-10: Workload Management

**Backend - Workload Service**
```javascript
// Real-time workload calculation
GET /api/v1/users/:id/workload
Response: {
  user_id,
  current_points: 45,
  capacity: 60,
  utilization: 0.75,
  tasks: [
    { id, title, priority, estimated_hours, status, due_date }
  ],
  forecast_next_week: 38
}

// Workload balancing suggestions
GET /api/v1/workload/suggestions
- Detect overloaded users
- Suggest task reassignment
- Consider skill match và deadline
```

**Frontend - Workload Dashboard**
- [ ] Team workload overview (bar chart, heatmap)
- [ ] Individual capacity view với breakdown by project/priority
- [ ] Workload forecast cho next week/month
- [ ] Bottleneck detection alerts
- [ ] Reassignment suggestions UI

---

#### Week 11-12: Workflow Builder

**Backend - Workflow Engine**
```javascript
// Workflow schema
{
  id, name, description, is_active,
  triggers: [
    { type: 'ticket_created', conditions: {...} },
    { type: 'status_changed', conditions: {...} }
  ],
  actions: [
    { type: 'assign_to', params: { strategy: 'auto', filter: {...} } },
    { type: 'set_priority', params: { priority: 'high' } },
    { type: 'send_notification', params: { to: [...] } },
    { type: 'create_subtask', params: {...} }
  ]
}

POST /api/v1/workflows - Create workflow
GET  /api/v1/workflows - List workflows
PUT  /api/v1/workflows/:id - Update workflow
POST /api/v1/workflows/:id/execute - Manual trigger
```

**Frontend - Workflow Editor**
- [ ] Drag-and-drop canvas (ReactFlow library)
- [ ] Node types: Trigger, Condition, Action, End
- [ ] Connection validation (type-safe)
- [ ] Workflow templates library
- [ ] Test workflow với sample data

---

#### Week 13-14: Analytics & Reporting

**Backend - Analytics Service**
```javascript
GET /api/v1/analytics/overview
- Total tickets created/completed this period
- Average resolution time
- Team performance metrics
- Bottleneck analysis

GET /api/v1/analytics/users/:id
- Completed tasks count
- Average completion time
- Quality score (based on reopened tickets)
- Skill utilization

GET /api/v1/analytics/trends
- Ticket volume over time
- Response time trends
- SLA compliance
```

**Frontend - Reports & Dashboards**
- [ ] Executive dashboard với key metrics
- [ ] Charts: Line, Bar, Pie, Heatmap (Recharts)
- [ ] Exportable reports (PDF, Excel)
- [ ] Custom date range filters
- [ ] Scheduled reports (email digest)

---

### **PHASE 3: Enterprise Features (4 weeks)**

#### Week 15-16: Collaboration & Audit

**Backend - Real-time Collaboration**
```javascript
// Operational Transform / CRDT-lite
- Track who is viewing/editing each ticket
- Prevent concurrent edit conflicts
- Show cursors và highlights của other users
- Auto-merge non-conflicting changes

// Audit Trail Enhancement
- Record every action với who, what, when, why
- Immutable log (write-only table)
- Searchable và filterable
- Export compliance reports
```

**Frontend - Collaboration Features**
- [ ] "User X is viewing this ticket" indicator
- [ ] Live cursors trong editor
- [ ] Conflict resolution UI
- [ ] Timeline visualization cho audit log
- [ ] "Blame view" - ai đã thay đổi gì

---

#### Week 17-18: Integrations & API

**Backend - Public API**
```javascript
// REST API v1 với rate limiting
- API key generation và management
- Webhook endpoints cho third-party
- OAuth2 integration với Slack, Gmail
- Zapier integration template

POST /api/v1/integrations/slack/webhook
POST /api/v1/integrations/gmail/sync
GET  /api/v1/integrations/status
```

**Frontend - Integration Settings**
- [ ] API key management page
- [ ] Slack workspace connection
- [ ] Gmail OAuth flow
- [ ] Webhook configuration UI
- [ ] Integration logs và debugging

**Documentation**
- [ ] OpenAPI/Swagger spec
- [ ] API documentation site (Docusaurus)
- [ ] Code examples (curl, JavaScript, Python)
- [ ] Postman collection

---

## 📊 User Stories (Prioritized)

### Epic 1: Core Task Management (Must Have)

**US-1.1**: Tự động nhận yêu cầu từ email
```
As a team lead
I want the system to automatically parse emails forwarded to a specific address
So that I don't have to manually create tickets for every request

Acceptance Criteria:
- Email forwarding address được cấu hình trong settings
- System parse subject, body, attachments
- Tạo ticket với status = "New"
- Gửi confirmation email về người gửi
```

**US-1.2**: AI phân tích và suggest assignment
```
As a team lead
I want AI to analyze the ticket content and suggest the best assignee
So that I can quickly make informed assignment decisions

Acceptance Criteria:
- AI trả về suggested assignee với confidence score > 70%
- Hiển thị reasoning (skill match, workload, etc.)
- Cho phép override manual
- Log AI decision vào audit trail
```

**US-1.3**: Dashboard theo dõi task
```
As a team member
I want to see all my assigned tasks in one dashboard
So that I can prioritize my work effectively

Acceptance Criteria:
- Hiển thị tasks grouped by status
- Sort by priority và due date
- Filter by assignee, status, priority, date range
- Số lượng task trong mỗi status
```

### Epic 2: Workload Management (Should Have)

**US-2.1**: Workload balancing tự động
```
As a team lead
I want the system to automatically balance workload across team members
So that no one is overloaded while others are idle

Acceptance Criteria:
- Calculate workload dựa trên estimated hours và priority
- Alert nếu user có utilization > 90%
- Suggest reassignment cho overloaded users
- Consider skills và deadline khi suggest
```

**US-2.2**: Workload visualization
```
As a team lead
I want to see team workload distribution in visual charts
So that I can quickly identify bottlenecks

Acceptance Criteria:
- Bar chart showing each user's capacity utilization
- Heatmap view by day/week
- Forecast cho next period
- Drill down vào individual user details
```

### Epic 3: Workflow Automation (Could Have)

**US-3.1**: Workflow editor
```
As a team lead
I want to create custom workflows with drag-and-drop
So that I can automate repetitive processes

Acceptance Criteria:
- Visual workflow builder với ReactFlow
- Support triggers: ticket_created, status_changed, etc.
- Support actions: assign, notify, create_subtask, etc.
- Validate workflow before activation
- Test workflow với sample data
```

---

## 🔌 API Specification (Key Endpoints)

### Authentication
```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### Tickets
```http
GET    /api/v1/tickets?page=1&limit=20&status=open&assignee=user123
POST   /api/v1/tickets
GET    /api/v1/tickets/:id
PATCH  /api/v1/tickets/:id
DELETE /api/v1/tickets/:id
GET    /api/v1/tickets/:id/history
POST   /api/v1/tickets/:id/comments
POST   /api/v1/tickets/:id/assign
```

### Tasks
```http
GET    /api/v1/tasks?status=in_progress
POST   /api/v1/tasks
PATCH  /api/v1/tasks/:id/status
GET    /api/v1/tasks/:id/subtasks
```

### Users
```http
GET    /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
GET    /api/v1/users/:id/workload
GET    /api/v1/users/:id/performance
```

### Workload
```http
GET /api/v1/workload/overview
GET /api/v1/workload/users/:id
GET /api/v1/workload/suggestions
```

### Workflows
```http
GET    /api/v1/workflows
POST   /api/v1/workflows
GET    /api/v1/workflows/:id
PUT    /api/v1/workflows/:id
DELETE /api/v1/workflows/:id
POST   /api/v1/workflows/:id/execute
```

### Ingestion
```http
POST /api/v1/ingest/email
POST /api/v1/ingest/webhook
POST /api/v1/ingest/manual
```

---

## 🗄️ Database Schema (Detailed)

```sql
-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'member', -- admin, team_lead, member
  skills JSONB DEFAULT '[]', -- ["javascript", "react", "backend"]
  capacity_hours_per_week INT DEFAULT 40,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TICKETS & TASKS
-- ============================================

CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  status VARCHAR(50) DEFAULT 'todo', -- todo, in_progress, review, done, blocked
  category VARCHAR(100), -- bug, feature, support, enhancement
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  due_date TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP -- Soft delete
);

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id), -- NULL if assigned by AI
  assigned_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active', -- active, completed, reassigned
  notes TEXT,
  UNIQUE(ticket_id, user_id, status)
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES tasks(id), -- For subtasks
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo',
  estimated_hours DECIMAL(5,2),
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INGESTION & AI
-- ============================================

CREATE TABLE ingest_payloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(50) NOT NULL, -- email, slack, webhook, manual
  raw_data JSONB NOT NULL,
  processed_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processed, failed
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  raw_response JSONB NOT NULL,
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  suggested_assignee_id UUID REFERENCES users(id),
  reasoning TEXT,
  model_version VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- WORKFLOWS
-- ============================================

CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  config JSONB NOT NULL, -- Stores triggers, conditions, actions
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id),
  status VARCHAR(50) DEFAULT 'running', -- running, completed, failed
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- ============================================
-- AUDIT & HISTORY
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- ticket, task, user, workflow
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- created, updated, deleted, assigned
  changed_by UUID REFERENCES users(id),
  changed_by_type VARCHAR(20) DEFAULT 'user', -- user, system, ai
  old_values JSONB,
  new_values JSONB,
  metadata JSONB, -- Extra context
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- COMMENTS & ATTACHMENTS
-- ============================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id), -- For threaded comments
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id),
  filename VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- ticket_assigned, status_changed, comment_added
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link TEXT, -- Deep link to relevant page
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- ============================================
-- INTEGRATIONS
-- ============================================

CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL, -- slack, gmail, github
  config JSONB NOT NULL, -- API keys, tokens, etc (encrypted)
  is_active BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🧪 Testing Strategy

### Unit Tests (Coverage target: 80%+)
- Services: AI triage logic, workload calculation, assignment algorithm
- Utils: JWT helpers, validation functions, formatters
- Models: Schema validation

### Integration Tests
- API endpoints: All CRUD operations
- Database: Transactions, constraints, indexes
- External services: OpenAI API mocking

### E2E Tests (Playwright/Cypress)
- User flows: Login → Create ticket → Assign → Complete
- Workflow execution
- Real-time collaboration

### Performance Tests (K6/Artillery)
- Load testing: 100+ concurrent users
- Stress testing: Database query optimization
- WebSocket connection stability

---

## 📈 Success Metrics (KPIs)

### Product Metrics
- **Time to Assignment**: < 5 phút (từ khi request đến vào system đến khi được assign)
- **AI Accuracy**: > 80% suggestions được chấp nhận mà không cần manual override
- **Workload Balance**: Std deviation của utilization < 15%
- **User Adoption**: > 80% team members active daily

### Technical Metrics
- **API Response Time**: P95 < 200ms
- **WebSocket Latency**: < 100ms
- **Database Query Time**: P99 < 50ms
- **Uptime**: > 99.5%

### Business Metrics
- **Productivity Gain**: 30% reduction trong time-to-completion
- **Transparency Score**: User satisfaction > 4.5/5 trên "I know what's happening with my requests"
- **Adoption Rate**: 90% của requests đi qua system thay vì email/manual

---

## 🚀 Deployment & DevOps

### Infrastructure
```yaml
Development:
  - Docker Compose
  - Local PostgreSQL + Redis
  - ngrok for webhook testing

Staging:
  - Docker Swarm / Kubernetes
  - AWS RDS PostgreSQL
  - AWS ElastiCache Redis
  - SSL certificates (Let's Encrypt)

Production:
  - Kubernetes (EKS/GKE/AKS)
  - Multi-AZ database setup
  - CDN for static assets (CloudFront)
  - Monitoring: Prometheus + Grafana
  - Logging: ELK Stack
  - Error tracking: Sentry
```

### CI/CD Pipeline
```yaml
# .github/workflows/ci-cd.yml
Triggers:
  - Push to main/develop branches
  - Pull requests

Jobs:
  1. Lint & Format Check
  2. Unit Tests (Jest)
  3. Integration Tests
  4. Build Docker Images
  5. Security Scan (Trivy)
  6. Deploy to Staging (auto)
  7. E2E Tests on Staging
  8. Deploy to Production (manual approval)
  9. Smoke Tests
  10. Notify team (Slack)
```

---

## 🔐 Security Considerations

### Authentication & Authorization
- JWT với short-lived access tokens (15 min) + refresh tokens (7 days)
- Role-based access control (RBAC)
- Rate limiting: 100 req/min per user
- IP allowlisting cho sensitive endpoints

### Data Protection
- Encrypt sensitive data at rest (PostgreSQL encryption)
- TLS 1.3 for all communications
- API keys stored với bcrypt/argon2
- PII data anonymization trong logs

### Security Best Practices
- Input validation và sanitization
- SQL injection prevention (parameterized queries)
- XSS protection (CSP headers)
- CSRF tokens for state-changing operations
- Regular dependency updates (Dependabot)
- Security headers (Helmet.js)

---

## 📚 Documentation Requirements

### For Developers
- [ ] Architecture Decision Records (ADR)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Database schema documentation
- [ ] Setup guide (local development)
- [ ] Contributing guidelines

### For Users
- [ ] User manual (GitBook/Docusaurus)
- [ ] Video tutorials cho key features
- [ ] FAQ
- [ ] Troubleshooting guide

### For Operations
- [ ] Deployment guide
- [ ] Monitoring setup
- [ ] Backup và recovery procedures
- [ ] Incident response runbook

---

## 🎯 Definition of Done

### Feature Development
- ✅ Code reviewed và approved
- ✅ Unit tests pass với coverage > 80%
- ✅ Integration tests pass
- ✅ Documentation updated
- ✅ No critical/high security vulnerabilities
- ✅ UI/UX reviewed và approved
- ✅ Performance benchmarks met
- ✅ Deployed to staging và tested

### Sprint Completion
- ✅ All user stories completed
- ✅ Demo prepared cho stakeholders
- ✅ Release notes drafted
- ✅ Retrospective conducted
- ✅ Next sprint planned

---

## 📅 Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1: MVP** | 8 weeks | Core task management, AI triage, real-time updates |
| **Phase 2: Growth** | 6 weeks | Workload balancing, workflow builder, analytics |
| **Phase 3: Scale** | 4 weeks | Collaboration, audit trail, integrations, API |
| **Total** | **18 weeks** | Production-ready platform |

### Milestones
- **Week 8**: MVP launch (internal beta)
- **Week 14**: Public beta với limited users
- **Week 18**: Production release v1.0
- **Week 20**: First customer onboarding
- **Week 24**: Feature parity với Jira (basic features)

---

## 💡 Future Enhancements (Post-Launch)

### Advanced AI Features
- Sentiment analysis trong comments
- Predictive analytics (predict delays, bottlenecks)
- Auto-summarization của long tickets
- Smart suggestions dựa trên historical patterns

### Collaboration Features
- Video call integration (Zoom/Meet)
- Screen sharing và co-browsing
- Voice notes trong comments
- Live document editing

### Advanced Analytics
- Custom dashboards với drag-and-drop widgets
- Predictive forecasting
- Anomaly detection
- A/B testing platform built-in

### Enterprise Features
- SSO integration (SAML, OAuth)
- Advanced permissions (field-level)
- Custom SLA policies
- Multi-tenancy support
- White-label option

---

## 🤝 Stakeholder Communication Plan

### Weekly Updates (Email)
- Progress vs. timeline
- Key achievements
- Blockers và risks
- Next week priorities

### Bi-weekly Demos (Live)
- Show working features
- Gather feedback
- Adjust roadmap if needed

### Monthly Reviews
- Review metrics và KPIs
- Budget check
- Strategic alignment

---

## ⚠️ Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI API rate limits/costs | High | Medium | Implement caching, fallback to Ollama local |
| Real-time scaling issues | High | Medium | Load testing early, Redis cluster setup |
| User adoption resistance | Medium | High | Strong onboarding, training sessions |
| Security breach | High | Low | Regular audits, penetration testing |
| Scope creep | Medium | High | Strict definition of done, backlog prioritization |
| Key developer leaves | High | Low | Documentation, pair programming, knowledge sharing |

---

## 📞 Team Structure

```
Product Owner (1)
  ↓
├─ Business Analyst (1)
├─ Backend Developers (2)
├─ Frontend Developers (2)
├─ Full-stack Developer (1)
├─ DevOps Engineer (1)
└─ QA Engineer (1)

Total: 9 people
```

### Ceremonies
- Daily standup: 15 min
- Sprint planning: 2 hours (bi-weekly)
- Sprint review: 1 hour
- Sprint retro: 1 hour
- Backlog refinement: 1 hour (weekly)

---

**Last Updated**: January 3, 2026  
**Version**: 1.0  
**Status**: Draft for Review
