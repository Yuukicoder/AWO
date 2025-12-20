# 👨‍💻 Dev Tasks Breakdown - AI Workflow Orchestrator

## 📋 Overview
Detailed task breakdown cho **Dev A** và **Dev B** (cả 2 đều là **Fullstack Developers**). Mỗi dev sẽ làm cả backend và frontend để đảm bảo feature hoàn chỉnh end-to-end.

---

## 🎯 Current Status (December 12, 2025)
✅ **Completed:**
- Express server setup
- MongoDB connection
- Redis + Socket.io integration  
- Basic Task CRUD API
- **Ticket CRUD API with parent-child relationship**
- **Repository pattern implementation**
- **Auto-incrementing ticket numbers (TKT-000001)**
- React app structure
- Authentication system

🔄 **In Progress:**
- Day 2 tasks (Real-time Events)
- **Ticket-Task relationship integration**

---

## 📅 Day-by-Day Task Breakdown

### **📍 Day 1.5 (Dec 12) - Ticket System Foundation**

#### 🔧 **COMPLETED - Dev A Tasks:**
**Backend: Ticket Management API**

1. ✅ **Ticket Model & Repository**
   ```javascript
   // File: src/models/tickets.model.js - COMPLETED
   // Auto-incrementing ticket numbers (TKT-000001)
   // SLA tracking, AI analysis fields
   // Parent entity for tasks
   ```

2. ✅ **Ticket Service & Controller**
   ```javascript
   // File: src/service/ticket.service.js - COMPLETED
   // File: src/controllers/ticket.controller.js - COMPLETED
   // Business logic for ticket lifecycle
   // SLA management, assignment logic
   ```

3. ✅ **Ticket Routes**
   ```javascript
   // File: src/routes/ticket.routes.js - COMPLETED
   // Full CRUD + assignment + resolution endpoints
   ```

4. ✅ **Task-Ticket Relationship**
   ```javascript
   // File: src/models/tasks.model.js - UPDATED
   // Added ticketId field for parent-child relationship
   ```

---

### **📍 Day 2 (Dec 12) - Real-time Events**

#### 🔧 **Dev A Tasks:**
<!-- **Backend: Redis Pub/Sub Implementation**

1. **Update Task & Ticket Services với Event Emission** done
   ```javascript
   // File: src/service/task.service.js & src/service/ticket.service.js
   // Cần add sau mỗi CRUD operation:
   
   import { publishEvent } from '../config/redis.js';
   
   // Sau khi tạo task thành công
   await publishEvent('task:created', {
     taskId: task._id,
     ticketId: task.ticketId,
     title: task.title,
     assignedTo: task.assignedTo,
     priority: task.priority,
     timestamp: new Date()
   });
   
   // Sau khi tạo ticket thành công
   await publishEvent('ticket:created', {
     ticketId: ticket._id,
     number: ticket.number,
     subject: ticket.subject,
     priority: ticket.priority,
     reporterEmail: ticket.reporter.email,
     timestamp: new Date()
   });
   ```

2. **Tạo Event Broadcasting Service** done
   ```javascript
   // File: src/service/event.service.js (TẠO MỚI)
   // Centralized event management cho tickets và tasks
   // Support cho ticket:created, ticket:assigned, ticket:resolved
   // Support cho task:created, task:updated, task:assigned
   // Ticket-Task relationship events
   ```

3. **Test Redis Events** done
   - Tạo sample tickets và tasks và verify events được emit
   - Test parent-child relationship events
   - Test với Thunder Client -->

#### 🎨 **Dev A Frontend Tasks:**
<!-- **WebSocket Client Setup**

1. **Install Socket.io Client**
   ```bash
   cd frontend/AWO
   npm install socket.io-client
   ```

2. **Tạo WebSocket Service**
   ```javascript
   // File: src/services/socket.service.js (TẠO MỚI)
   // Connect to backend socket
   ```

3. **Tạo WebSocket Hook**
   ```javascript
   // File: src/hooks/useSocket.js (TẠO MỚI)
   // Custom hook cho socket events
   ``` -->

---

#### 🔧 **Dev B Tasks:**
**Backend: Workload Calculator API**

1. **Tạo Workload Service**
   ```javascript
   // File: src/service/workload.service.js (TẠO MỚI)
   // Calculate user workload metrics
   // Include both tickets và tasks trong calculation
   // SLA deadline weighting
   ```

2. **Add Workload Endpoint**
   ```javascript
   // File: src/controllers/user.controller.js
   // Add GET /api/users/:id/workload
   ```

3. **Update User Routes**
   ```javascript
   // File: src/routes/User.routes.js
   // Add workload route
   ```

#### 🎨 **Dev B Frontend Tasks:**  
**Assignment UI Components**

1. **Tạo Assignment Modal**
   ```jsx
   // File: src/components/assignment/AssignmentModal.jsx (TẠO MỚI)
   // Modal để assign ticket hoặc task cho user
   // Support cho both ticket assignment và task assignment
   ```

2. **Tạo User Selection Dropdown**
   ```jsx
   // File: src/components/ui/UserSelect.jsx (TẠO MỚI)  
   // Dropdown với search functionality
   ```

3. **Update User Management với Ticket/Task Assignment**
   ```jsx
   // File: src/pages/Home/UserManagementPage.jsx
   // Add assignment button cho cả tickets và tasks
   // Show workload including ticket SLA status
   ```

---

### **📍 Day 3 (Dec 13) - Ticket & Task List & Filtering**

#### 🔧 **Dev A Tasks:**
**Backend: Advanced Filtering cho Tickets & Tasks**

1. **Enhance Ticket & Task Services**
   ```javascript
   // File: src/service/ticket.service.js & src/service/task.service.js
   // Add search, date filtering, SLA filtering
   // Ticket-Task relationship queries
   // Statistics cho both entities
   ```

2. **Add Statistics Endpoints**
   ```javascript
   // File: src/controllers/ticket.controller.js
   // GET /api/tickets/stats - SLA dashboard data
   // File: src/controllers/task.controller.js  
   // GET /api/tasks/stats - Task completion metrics
   ```

#### 🎨 **Dev A Frontend Tasks:**
**Ticket & Task Store Enhancement**

1. **Create Ticket Store**
   ```javascript
   // File: src/stores/ticketStore.js (TẠO MỚI)
   // Zustand store cho tickets
   // Parent-child relationship management
   ```

2. **Update Task Store**
   ```javascript
   // File: src/stores/taskStore.js (TẠO MỚI)
   // Zustand store cho tasks
   // Integration với ticket store
   ```

3. **Add Socket Events Integration**
   ```javascript
   // Integrate socket events với both stores
   // Handle ticket và task real-time updates
   ```

---

#### 🔧 **Dev B Tasks:**
**Backend: Advanced Ticket & Task APIs**

1. **Add Search Validation**
   ```javascript
   // File: src/middleware/validation.middleware.js
   // Validate search params cho both tickets và tasks
   // Parent-child relationship validation
   ```

2. **Optimize Database Queries**
   ```javascript
   // Add proper indexes, aggregation
   // Optimize ticket-task relationship queries
   ```

#### 🎨 **Dev B Frontend Tasks:**
**Ticket & Task List UI**

1. **Tạo Ticket List Page**
   ```jsx
   // File: src/pages/ticket/TicketListPage.jsx (TẠO MỚI)
   // Main ticket management page
   // Show SLA status, assigned tasks count
   ```

2. **Tạo Filter Components**
   ```jsx
   // File: src/components/ticket/TicketFilter.jsx (TẠO MỚI)
   // Status, priority, SLA status filters
   // File: src/components/task/TaskFilter.jsx (TẠO MỚI)
   // Status, priority, assignee, ticket filters
   ```

3. **Tạo Search Components**  
   ```jsx
   // File: src/components/ticket/TicketSearch.jsx (TẠO MỚI)
   // Search by subject/description/number
   // File: src/components/task/TaskSearch.jsx (TẠO MỚI)
   // Search by title/description, filter by ticket
   ```

4. **Update Task List Page**
   ```jsx
   // File: src/pages/task/TaskListPage.jsx (TẠO MỚI)
   // Show parent ticket information
   // Filter by ticket functionality
   ```

---

## 🗂️ Files To Create/Modify

### **Backend Files (Both Devs)**

#### 📁 **Services**
- `src/service/event.service.js` - Event broadcasting cho tickets & tasks
- `src/service/workload.service.js` - User workload calculation including tickets
- ✅ `src/service/ticket.service.js` - **COMPLETED** Ticket business logic
- `src/stores/ticketStore.js` - Ticket state management
- `src/stores/taskStore.js` - Task state management

#### 📁 **Controllers** 
- Update `src/controllers/task.controller.js` - Add stats, events, ticket relationship
- ✅ `src/controllers/ticket.controller.js` - **COMPLETED** Full ticket CRUD with SLA
- Update `src/controllers/user.controller.js` - Add workload endpoint

#### 📁 **Routes**
- Update `src/routes/task.routes.js` - Add new endpoints, ticket relationship
- ✅ `src/routes/ticket.routes.js` - **COMPLETED** Full ticket CRUD + assignment + resolution
- Update `src/routes/User.routes.js` - Add workload route

#### 📁 **Middleware**
- `src/middleware/validation.middleware.js` - Request validation
- Update `src/middleware/auth.middleware.js` - Enhanced role checks

#### 📁 **Utils**
- `src/utils/constants.js` - App constants
- `src/utils/helpers.js` - Helper functions

---

### **Frontend Files (Both Devs)**

#### 📁 **Services**
- `src/services/socket.service.js` - WebSocket connection
- `src/services/task.service.js` - Task API calls
- `src/services/ticket.service.js` - Ticket API calls (TẠO MỚI)
- Update `src/services/api.service.js` - API helpers

#### 📁 **Stores**
- `src/stores/taskStore.js` - Task state (Zustand)
- `src/stores/ticketStore.js` - Ticket state (Zustand) (TẠO MỚI)
- Update `src/stores/authStore.js` - Add user workload

#### 📁 **Hooks**
- `src/hooks/useSocket.js` - Socket management
- `src/hooks/useTasks.js` - Task operations
- `src/hooks/useToast.js` - Notification system

#### 📁 **Components**

**Ticket Components:**
- `src/components/ticket/TicketList.jsx` - Ticket list view
- `src/components/ticket/TicketCard.jsx` - Individual ticket card
- `src/components/ticket/TicketFilter.jsx` - Filter controls
- `src/components/ticket/TicketSearch.jsx` - Search functionality
- `src/components/ticket/TicketForm.jsx` - Create/Edit forms
- `src/components/ticket/TicketDetails.jsx` - Ticket detail view
- `src/components/ticket/SLAIndicator.jsx` - SLA status display

**Task Components:**
- `src/components/task/TaskList.jsx` - Task list view
- `src/components/task/TaskCard.jsx` - Individual task card
- `src/components/task/TaskFilter.jsx` - Filter controls
- `src/components/task/TaskSearch.jsx` - Search functionality
- `src/components/assignment/AssignmentModal.jsx` - Assignment interface (both tickets & tasks)
- `src/components/task/TaskForm.jsx` - Create/Edit forms
- `src/components/task/TaskDetails.jsx` - Task detail view

**UI Components:**
- `src/components/ui/UserSelect.jsx` - User selection dropdown
- `src/components/ui/StatusBadge.jsx` - Status indicators
- `src/components/ui/PriorityBadge.jsx` - Priority indicators
- `src/components/ui/Toast.jsx` - Notification component

#### 📁 **Pages**
- `src/pages/ticket/TicketListPage.jsx` - Main ticket page
- `src/pages/ticket/TicketDetailPage.jsx` - Ticket details with task hierarchy
- `src/pages/task/TaskListPage.jsx` - Main task page
- `src/pages/task/TaskDetailPage.jsx` - Task details
- `src/pages/dashboard/DashboardPage.jsx` - Analytics dashboard with SLA metrics
- Update `src/pages/Home/UserManagementPage.jsx` - Add workload display with tickets

---

## 🔄 Daily Workflow

### **Morning (9:00 AM)**
1. **Dev Sync** (15 mins)
   - Review yesterday's progress
   - Clarify today's tasks
   - Identify dependencies

### **Development (9:15 AM - 6:00 PM)**
1. **Backend First** (Morning)
   - Each dev implements their backend tasks
   - Write API endpoints, services, models
   
2. **Frontend Integration** (Afternoon)  
   - Implement UI components
   - Connect to backend APIs
   - Test integration

### **Evening (6:00 PM)**
1. **Code Review** (30 mins)
   - Cross-review each other's code
   - Test integrated features
   - Document any issues

2. **Demo & Planning** (15 mins)
   - Demo completed features
   - Plan next day's tasks

---

## 🧪 Testing Strategy

### **Dev A - Testing Responsibilities**
1. **Backend API Tests**
   - Unit tests cho services
   - Integration tests cho endpoints
   - Socket event testing

2. **Frontend Integration Tests**
   - WebSocket connection tests
   - Real-time update tests

### **Dev B - Testing Responsibilities**  
1. **UI Component Tests**
   - Component unit tests
   - User interaction tests
   - Form validation tests

2. **End-to-End Tests**
   - User flow testing
   - Cross-browser testing

---

## 📝 Code Standards

### **Backend Standards**
```javascript
// File naming: camelCase.js
// Function naming: camelCase
// API routes: /api/resource
// Error handling: try/catch với proper status codes
```

### **Frontend Standards**
```jsx
// Component naming: PascalCase.jsx
// Hook naming: useCamelCase.js
// Prop validation: PropTypes hoặc TypeScript
// State management: Zustand stores
```

---

## 🚨 Daily Deliverables

### **Dev A (Dec 12)**
✅ **Backend:**
- Task & Ticket events được emit properly
- Redis pub/sub working cho both entities
- Event service implemented với parent-child support

✅ **Frontend:**
- Socket.io client connected
- WebSocket hook created
- Real-time connection established

### **Day 12 (Dec 12)**
✅ **Backend:**
- Workload calculator API
- User workload endpoint including tickets
- Workload calculation logic

✅ **Frontend:**
- Assignment modal component for both tickets & tasks
- User selection dropdown  
- Assignment integration working for both entities

---

## 🎯 Success Criteria

### **End of Day 2**
- [ ] Redis events được emit khi CRUD tickets & tasks
- [ ] Frontend có thể connect tới WebSocket
- [ ] Assignment modal hoạt động cho both tickets & tasks
- [ ] Workload API trả về đúng data including tickets

### **End of Day 3** 
- [ ] Ticket & Task filtering hoạt động hoàn chỉnh
- [ ] Search functionality working cho both entities
- [ ] Real-time updates hiển thị trong UI
- [ ] Statistics endpoint hoạt động
- [ ] SLA tracking hiển thị correctly

---

## 💡 Tips & Best Practices

1. **Git Workflow**
   ```bash
   # Mỗi task = 1 branch
   git checkout -b feat/day2-realtime-events
   git commit -m "Add Redis pub/sub for task events"
   ```

2. **API Testing**
   - Dùng Thunder Client để test endpoints
   - Tạo collection cho mỗi feature
   - Document API responses

3. **Error Handling**
   - Backend: Proper HTTP status codes
   - Frontend: User-friendly error messages
   - Log errors for debugging

4. **Performance**
   - Use debouncing cho search
   - Pagination cho large lists
   - Optimize database queries

---

**  Let's build an amazing MVP together! Good luck! 💪**