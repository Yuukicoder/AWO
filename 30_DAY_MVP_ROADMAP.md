# 🚀 30-Day MVP Development Flow - AI Workflow Orchestrator

## 📋 Overview
This document outlines the step-by-step flow for building the MVP of the AI Workflow Orchestrator within 30 days. Follow this guide sequentially for optimal results.

---

## 👥 Team Structure
- **Dev A**: Backend (Node.js + Express + PostgreSQL + Prisma + Redis)
- **Dev B**: Frontend (React + Zustand + Tailwind)

---

## 🗓️ Week 1-2: Foundation Setup (Days 1-14)

### 🔧 Dev A - Backend Infrastructure

#### Day 1-3: Project Setup
1. ✅ Initialize Express project
   ```bash
   mkdir backend
   cd backend
   npm init -y
   ```

2. ✅ Install core dependencies
   ```bash
   npm install express cors dotenv
   npm install jsonwebtoken bcrypt
   npm install @prisma/client prisma
   npm install redis ioredis
   npm install express-validator
   npm install socket.io
   ```

3. ✅ Install dev dependencies
   ```bash
   npm install -D nodemon
   ```

4. ✅ Setup Prisma
   ```bash
   npx prisma init
   ```

5. ✅ Create basic Express server structure
   ```
   backend/
   ├── src/
   │   ├── config/
   │   ├── controllers/
   │   ├── middleware/
   │   ├── models/
   │   ├── routes/
   │   ├── services/
   │   └── utils/
   ├── server.js
   ├── .env
   └── package.json
   ```

#### Day 4-7: Database Schema & Auth
4. ✅ Design and create Prisma schema
   - Tables: `User`, `Skill`, `Task`, `Assignment`, `Team`
   - Define relationships
   - Add indexes for performance

5. ✅ Run migrations
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

6. ✅ Implement Authentication Module
   - Create auth routes and controllers
   - JWT strategy (access + refresh tokens)
   - Login/Register endpoints (`POST /auth/login`, `POST /auth/register`)
   - Password hashing with bcrypt
   - Token verification middleware

#### Day 8-10: Role & Permissions
7. ✅ Create Role-Based Access Control (RBAC)
   - Roles: `admin`, `PM`, `member`
   - Middleware for route protection
   - Role checking middleware
   - Add role field to User model

#### Day 11-14: Real-time Infrastructure
8. ✅ Setup Redis
   - Install and configure Redis connection
   - Create Redis service for pub/sub

9. ✅ Setup WebSocket with Socket.io
   - Integrate Socket.io with Express server
   - Implement authentication for WebSocket connections
   - Setup event listeners and room management
   - Create WebSocket service for broadcasting events

---

### 🎨 Dev B - Frontend Foundation

#### Day 1-3: Project Setup
1. ✅ Initialize React + Vite
   ```bash
   npm create vite@latest frontend -- --template react
   cd frontend
   ```

2. ✅ Install dependencies
   ```bash
   npm install
   npm install zustand axios react-router-dom
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. ✅ Configure Tailwind CSS
   - Update `tailwind.config.js`
   - Add Tailwind directives to CSS

#### Day 4-7: Authentication UI
4. ✅ Create Authentication Pages
   - `Login.jsx` - Login form
   - `Register.jsx` - Registration form
   - Form validation

5. ✅ Setup Zustand Store
   - `authStore.js` - User state, tokens
   - Login/logout actions
   - Persist tokens in localStorage

6. ✅ Setup Axios Instance
   - Base URL configuration
   - Request/response interceptors
   - Auto-attach JWT tokens

#### Day 8-14: Layout & Navigation
7. ✅ Create App Layout
   - `Layout.jsx` - Main container
   - `SideBar.jsx` - Navigation sidebar
   - `NavBar.jsx` - Top navigation bar

8. ✅ Setup Routing
   - React Router configuration
   - Protected routes (requires auth)
   - Public routes (login, register)
   - Route guards

9. ✅ Create Basic UI Components
   - Buttons, inputs, cards
   - Loading states
   - Error messages

---

## 🗓️ Week 3: Task Management Core (Days 15-21)

### 🔧 Dev A - Task Engine Backend

#### Day 15-17: Task CRUD API
1. ✅ Create Task Module
   - Create Task model in Prisma schema
   ```
   Task Entity:
   - id, title, description
   - priority (low, medium, high, urgent)
   - status (todo, in_progress, review, done)
   - createdBy, assignedTo
   - deadline, tags
   ```
   - Create task controller and service
   - Create task routes

2. ✅ Implement Task Endpoints
   - `POST /tasks` - Create task
   - `GET /tasks` - List tasks (with filters)
   - `GET /tasks/:id` - Get task details
   - `PUT /tasks/:id` - Update task
   - `DELETE /tasks/:id` - Delete task

3. ✅ Add Task Filters & Pagination
   - Filter by: status, priority, assignee
   - Sort by: deadline, priority, created date
   - Pagination support

#### Day 18-19: Assignment Logic
4. ✅ Create Assignment Module
   - Create assignment controller and service
   - `POST /tasks/:id/assign` - Manual assignment endpoint
   - `GET /users/:id/workload` - Get user workload endpoint
   - Add validation middleware

5. ✅ Build Basic Workload Calculator
   - Count assigned tasks per user
   - Calculate based on priority weight
   - Check user availability

#### Day 20-21: Real-time Task Updates
6. ✅ Implement Redis Pub/Sub for Tasks
   - Publish task events: `task.created`, `task.updated`, `task.assigned`
   - WebSocket broadcasts to connected clients

7. ✅ Create WebSocket Events
   - `task:update` - Send task updates
   - `task:assigned` - Notify when assigned
   - `task:status_changed` - Status changes

---

### 🎨 Dev B - Task Management UI

#### Day 15-17: Task List Page
1. ✅ Create Task Store (Zustand)
   ```javascript
   taskStore:
   - tasks array
   - filters (status, priority)
   - actions: fetchTasks, createTask, updateTask
   ```

2. ✅ Build Task List Component
   - Display tasks in table/grid
   - Show: title, priority, status, assignee, deadline
   - Status badges with colors

3. ✅ Add Filters & Sorting
   - Filter dropdown (status, priority)
   - Sort options (date, priority)
   - Search by title

#### Day 18-19: Task Details & Forms
4. ✅ Create Task Details Modal/Page
   - Full task information
   - Assignment details
   - Activity timeline (basic)

5. ✅ Build Task Form
   - Create/Edit task form
   - Input validation
   - Rich text editor for description (optional)
   - Priority selector
   - Date picker for deadline

#### Day 20-21: Real-time Updates
6. ✅ Setup WebSocket Client
   ```bash
   npm install socket.io-client
   ```

7. ✅ Implement Real-time Task Updates
   - Connect to WebSocket on app load
   - Listen for `task:update` events
   - Auto-refresh task list
   - Show toast notifications for updates

---

## 🗓️ Week 4: AI Triage (Days 22-30)

### 🔧 Dev A - AI Integration Backend

#### Day 22-24: OpenAI Setup
1. ✅ Install OpenAI SDK
   ```bash
   npm install openai
   ```

2. ✅ Create AI Service Module
   - Configure OpenAI API key in `.env`
   - Create AI service (`src/services/ai.service.js`)
   - Create helper functions for AI prompts

3. ✅ Build Email Parser
   - Create utility for email parsing (`src/utils/emailParser.js`)
   - Extract: subject, body, sender
   - Clean formatting
   - Handle attachments (basic)

#### Day 25-27: AI Triage Logic
4. ✅ Create Triage Endpoint
   - Create triage controller (`src/controllers/triage.controller.js`)
   - Create triage routes (`src/routes/triage.routes.js`)
   ```
   POST /triage/email
   Body: { emailContent: string }
   ```

5. ✅ Implement AI Analysis
   - Send email to OpenAI API
   - Prompt engineering:
     * Extract task title
     * Determine priority (low/medium/high/urgent)
     * Suggest deadline
     * Extract tags/keywords
     * Recommend assignee (based on skills)

6. ✅ Return Task Draft
   ```json
   Response:
   {
     "suggested_task": {
       "title": "...",
       "description": "...",
       "priority": "high",
       "deadline": "2025-01-15",
       "tags": ["bug", "urgent"],
       "confidence": 0.85
     }
   }
   ```

#### Day 28-30: Manual Review Flow
7. ✅ Create Task Draft Endpoints
   - Save AI draft to temporary storage (Redis)
   - `GET /triage/drafts/:id` - Retrieve draft
   - `POST /triage/drafts/:id/confirm` - Convert to real task

8. ✅ Testing & Refinement
   - Test with various email formats
   - Tune AI prompts for accuracy
   - Handle edge cases

---

### 🎨 Dev B - AI Triage UI

#### Day 22-24: Email Input UI
1. ✅ Create Triage Page
   - Route: `/triage` or `/ai-assist`
   - Navigation link in sidebar

2. ✅ Build Email Input Form
   - Textarea for email paste
   - File upload for .eml files (optional)
   - "Analyze with AI" button

3. ✅ Add Loading States
   - Spinner during AI processing
   - Progress indicator

#### Day 25-27: AI Suggestion Display
4. ✅ Create Task Preview Component
   - Display AI-suggested task
   - Show confidence score
   - Highlight extracted fields:
     * Title
     * Priority (with color badge)
     * Deadline
     * Tags
     * Description

5. ✅ Add Edit Capability
   - Allow user to modify AI suggestions
   - Inline editing for each field
   - Validation

#### Day 28-30: Confirm & Create Flow
6. ✅ Implement Confirmation Flow
   - "Confirm & Create Task" button
   - "Reject" or "Re-analyze" option
   - Success message with link to created task

7. ✅ Integrate with Task Store
   - On confirm → POST to backend
   - Add new task to task list
   - Redirect to task details

8. ✅ Polish & Testing
   - Error handling
   - Toast notifications
   - Responsive design
   - Cross-browser testing

---

## 🎯 End of 30 Days - Complete MVP Flow

### ✅ Working End-to-End Flow:
```
1. User pastes email into Triage page
   ↓
2. AI analyzes → Suggests task draft
   ↓
3. User reviews → Edits if needed → Confirms
   ↓
4. Task created in database
   ↓
5. Task appears in Task List (real-time)
   ↓
6. PM/Admin assigns task to team member
   ↓
7. Assigned user receives notification (WebSocket)
   ↓
8. User updates task status
   ↓
9. All connected clients see updates (real-time)
```

---

## 📊 Day 30 Deliverables Checklist

### Backend (Dev A)
- ✅ Authentication system (JWT)
- ✅ Role-based access control
- ✅ Task CRUD API
- ✅ Manual task assignment
- ✅ Workload calculator
- ✅ Redis pub/sub
- ✅ WebSocket gateway
- ✅ OpenAI integration
- ✅ Email triage endpoint
- ✅ Task draft review system

### Frontend (Dev B)
- ✅ Authentication UI (login/register)
- ✅ Protected routes
- ✅ App layout (sidebar + navbar)
- ✅ Task list page (filters, sorting, search)
- ✅ Task details modal
- ✅ Task create/edit form
- ✅ Real-time task updates (WebSocket)
- ✅ AI triage page
- ✅ Email input & AI suggestion display
- ✅ Task confirmation flow

---

## 🚀 Testing Checklist

### Day 30 - Final Testing
1. ✅ User can register and login
2. ✅ User can create task manually
3. ✅ User can view all tasks
4. ✅ User can filter/sort tasks
5. ✅ User can edit task
6. ✅ Admin can assign task
7. ✅ Real-time updates work across tabs/users
8. ✅ User can paste email → AI suggests task
9. ✅ User can edit AI suggestion
10. ✅ User can confirm → Task created
11. ✅ Notifications work properly
12. ✅ No major bugs or crashes

---

## 📝 Next Steps (Days 31-60)

After MVP completion, focus on:
- Advanced AI triage (learning from feedback)
- Automated assignment algorithm
- Team management features
- Detailed analytics dashboard
- Performance optimization
- Mobile responsiveness
- User settings & preferences

---

## 💡 Tips for Success

1. **Daily Standups**: Quick sync between Dev A & B
2. **Shared API Docs**: Use Swagger/Postman for API documentation
3. **Version Control**: Commit frequently, use feature branches
4. **Mock Data**: Dev B can start with mock data before backend is ready
5. **Focus on MVP**: Don't over-engineer, ship working features
6. **Test Early**: Test each feature as it's built
7. **Communication**: Use Slack/Discord for quick questions

---

## 🛠️ Tech Stack Reference

**Backend:**
- Node.js + Express (Server framework)
- PostgreSQL (Database)
- Prisma (ORM)
- Redis (Pub/sub, caching)
- JWT (Authentication)
- Socket.io (WebSocket)
- OpenAI API (AI triage)
- Bcrypt (Password hashing)

**Frontend:**
- React 18
- Vite (Build tool)
- Zustand (State management)
- Tailwind CSS (Styling)
- Axios (HTTP client)
- Socket.io-client (WebSocket)
- React Router (Routing)

---

## 📞 Support & Resources

- **Express Docs**: https://expressjs.com
- **Prisma Docs**: https://www.prisma.io/docs
- **Socket.io Docs**: https://socket.io/docs
- **OpenAI API**: https://platform.openai.com/docs
- **React Docs**: https://react.dev
- **Zustand**: https://github.com/pmndrs/zustand

---

# 📅 15-Day Sprint Plan - Task Assignment for 2 Fullstack Developers

## 🎯 Current Status (December 11, 2025)
- ✅ Backend: Express setup, MongoDB, Redis, Socket.io, Task CRUD API
- ✅ Frontend: React app structure, Auth UI, Layout components
- 🔄 **Target**: Complete MVP in 15 days (December 26, 2025)

---

## 👥 Team Assignment Strategy
**Dev A & Dev B** = Fullstack developers
- Each dev owns 1 major feature per day
- Cross-review code daily
- Pair programming for complex integrations

---

## 📆 Daily Task Assignment

### **Day 1 (Dec 11) - Assignment & Workload**
- **Dev A**: Implement workload calculator backend
  - Add `GET /api/users/:id/workload` endpoint
  - Calculate task counts and estimated hours per user
  - Add priority-based weighting system
- **Dev B**: Build task assignment UI
  - Create assignment modal component
  - Add user selection dropdown
  - Integrate with assignment API

### **Day 2 (Dec 12) - Real-time Events**
- **Dev A**: Implement Redis pub/sub for task events
  - Emit `task:created`, `task:updated`, `task:assigned` events
  - Create event broadcasting service
  - Test event flow with Redis
- **Dev B**: Setup WebSocket client integration
  - Install `socket.io-client`
  - Create WebSocket hook/service
  - Connect to backend Socket.io server

### **Day 3 (Dec 13) - Task List & Filtering**
- **Dev A**: Enhance task API with advanced filtering
  - Add search by title/description
  - Implement date range filtering
  - Add task statistics endpoint
- **Dev B**: Build comprehensive task list UI
  - Create filter controls (status, priority, assignee)
  - Implement search functionality
  - Add sorting options

### **Day 4 (Dec 14) - Task Details & Forms**
- **Dev A**: Add task update tracking and validation
  - Create task history/audit trail
  - Add field validation middleware
  - Implement optimistic locking
- **Dev B**: Create task details and edit forms
  - Build task detail modal/page
  - Create task creation/edit forms
  - Add form validation and date pickers

### **Day 5 (Dec 15) - Real-time UI Updates**
- **Dev A**: Complete WebSocket event system
  - Finalize all task-related events
  - Add user-specific notifications
  - Test multi-client real-time updates
- **Dev B**: Implement real-time UI updates
  - Listen for WebSocket events in task store
  - Add toast notifications for task updates
  - Auto-refresh task list on events

### **Day 6 (Dec 16) - User Management**
- **Dev A**: Extend user API with skills and workload
  - Add user skills management
  - Implement capacity tracking
  - Create team/user listing endpoints
- **Dev B**: Build user management interface
  - Create user profile pages
  - Add skills management UI
  - Display workload information

### **Day 7 (Dec 17) - AI Triage Foundation**
- **Dev A**: Setup OpenAI integration
  - Install OpenAI SDK
  - Create AI service module
  - Implement basic email parsing utility
- **Dev B**: Create AI triage page structure
  - Build email input form
  - Add file upload capability
  - Create loading states and progress indicators

### **Day 8 (Dec 18) - AI Analysis Implementation**
- **Dev A**: Build AI task analysis engine
  - Create `POST /api/triage/email` endpoint
  - Implement AI prompt engineering
  - Add confidence scoring system
- **Dev B**: Build AI suggestion display
  - Create task preview component
  - Show AI confidence scores
  - Add editable suggestion fields

### **Day 9 (Dec 19) - AI Draft System**
- **Dev A**: Implement draft storage and confirmation
  - Save AI drafts to Redis
  - Create draft retrieval endpoints
  - Build draft-to-task conversion
- **Dev B**: Complete AI confirmation flow
  - Build draft review interface
  - Add edit/confirm/reject actions
  - Integrate with task creation

### **Day 10 (Dec 20) - Dashboard & Analytics**
- **Dev A**: Create analytics and reporting API
  - Task completion statistics
  - User productivity metrics
  - System health endpoints
- **Dev B**: Build dashboard interface
  - Create KPI cards and charts
  - Add task queue visualization
  - Build user workload charts

### **Day 11 (Dec 21) - Performance & Optimization**
- **Dev A**: Optimize backend performance
  - Add database indexing
  - Implement caching strategies
  - Add API rate limiting
- **Dev B**: Optimize frontend performance
  - Implement code splitting
  - Add lazy loading
  - Optimize bundle size

### **Day 12 (Dec 22) - Security & Validation**
- **Dev A**: Enhance security measures
  - Add input sanitization
  - Implement CORS properly
  - Add API security headers
- **Dev B**: Add comprehensive form validation
  - Client-side validation
  - Error handling improvements
  - User feedback enhancements

### **Day 13 (Dec 23) - Integration Testing**
- **Dev A**: Create backend test suite
  - Unit tests for services
  - Integration tests for APIs
  - WebSocket connection tests
- **Dev B**: End-to-end testing
  - User flow testing
  - Cross-browser testing
  - Mobile responsiveness

### **Day 14 (Dec 24) - Polish & Bug Fixes**
- **Dev A**: Backend stability and monitoring
  - Add logging and error tracking
  - Performance monitoring
  - Production configurations
- **Dev B**: UI polish and accessibility
  - Design consistency
  - Accessibility improvements
  - Loading states and error messages

### **Day 15 (Dec 25) - Final MVP Deployment**
- **Dev A**: Deployment preparation
  - Environment configuration
  - Database seeding
  - Production deployment
- **Dev B**: Final testing and documentation
  - User acceptance testing
  - Create user documentation
  - Final demo preparation

---

## 🎯 MVP Completion Criteria

### ✅ Must-Have Features (Day 15)
1. **Complete task lifecycle** (create → assign → update → complete)
2. **Real-time updates** across all connected clients
3. **AI email triage** with manual review flow
4. **User workload management** with visual indicators
5. **Role-based access** (admin, manager, member)
6. **Responsive UI** working on desktop and mobile

### 🔧 Success Metrics
- All 5 core user flows work end-to-end
- Real-time events fire within 2 seconds
- AI triage accuracy > 70% for test emails
- UI loads in < 3 seconds on standard connection
- Zero critical security vulnerabilities

---

## 💡 Daily Sync Protocol

### Morning Standup (15 mins)
- Yesterday's progress review
- Today's task clarification
- Blocker identification

### Evening Check-in (10 mins)
- Demo completed features
- Code review assignments
- Next day preparation

### Tools
- **Communication**: Slack/Discord
- **Code Review**: GitHub PRs
- **Task Tracking**: GitHub Issues
- **Documentation**: Shared Notion/README

---

## 🚨 Risk Mitigation

### High-Risk Items
1. **AI Integration** - Have fallback manual task creation
2. **Real-time Features** - Can work without WebSocket initially
3. **Performance** - Focus on core features first

### Contingency Plans
- **Behind Schedule**: Skip non-essential UI polish
- **Technical Blockers**: Pair programming sessions
- **Integration Issues**: Fallback to mock data temporarily

---

**🎯 Goal: Working MVP by December 25, 2025! Let's ship it! 🚀**
