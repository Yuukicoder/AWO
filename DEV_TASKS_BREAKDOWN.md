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
- React app structure
- Authentication system

🔄 **In Progress:**
- Day 2 tasks (Real-time Events)

---

## 📅 Day-by-Day Task Breakdown

### **📍 Day 2 (Dec 12) - Real-time Events**

#### 🔧 **Dev A Tasks:**
**Backend: Redis Pub/Sub Implementation**

1. **Update Task Service với Event Emission**
   ```javascript
   // File: src/service/task.service.js
   // Cần add sau mỗi CRUD operation:
   
   import { publishEvent } from '../config/redis.js';
   
   // Sau khi tạo task thành công
   await publishEvent('task:created', {
     taskId: task._id,
     title: task.title,
     assignedTo: task.assignedTo,
     priority: task.priority,
     timestamp: new Date()
   });
   ```

2. **Tạo Event Broadcasting Service**
   ```javascript
   // File: src/service/event.service.js (TẠO MỚI)
   // Centralized event management
   ```

3. **Test Redis Events**
   - Tạo sample tasks và verify events được emit
   - Test với Thunder Client

#### 🎨 **Dev A Frontend Tasks:**
**WebSocket Client Setup**

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
   ```

---

#### 🔧 **Dev B Tasks:**
**Backend: Workload Calculator API**

1. **Tạo Workload Service**
   ```javascript
   // File: src/service/workload.service.js (TẠO MỚI)
   // Calculate user workload metrics
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
   // File: src/components/task/AssignmentModal.jsx (TẠO MỚI)
   // Modal để assign task cho user
   ```

2. **Tạo User Selection Dropdown**
   ```jsx
   // File: src/components/ui/UserSelect.jsx (TẠO MỚI)  
   // Dropdown với search functionality
   ```

3. **Update Task List với Assignment**
   ```jsx
   // File: src/pages/Home/UserManagementPage.jsx
   // Add assignment button và modal
   ```

---

### **📍 Day 3 (Dec 13) - Task List & Filtering**

#### 🔧 **Dev A Tasks:**
**Backend: Advanced Filtering**

1. **Enhance Task Service**
   ```javascript
   // File: src/service/task.service.js
   // Add search, date filtering, statistics
   ```

2. **Add Statistics Endpoint**
   ```javascript
   // File: src/controllers/task.controller.js  
   // GET /api/tasks/stats
   ```

#### 🎨 **Dev A Frontend Tasks:**
**Task Store Enhancement**

1. **Update Task Store**
   ```javascript
   // File: src/stores/taskStore.js (TẠO MỚI)
   // Zustand store cho tasks
   ```

2. **Add Socket Events Integration**
   ```javascript
   // Integrate socket events với task store
   ```

---

#### 🔧 **Dev B Tasks:**
**Backend: Advanced Task APIs**

1. **Add Search Validation**
   ```javascript
   // File: src/middleware/validation.middleware.js
   // Validate search params
   ```

2. **Optimize Database Queries**
   ```javascript
   // Add proper indexes, aggregation
   ```

#### 🎨 **Dev B Frontend Tasks:**
**Task List UI**

1. **Tạo Filter Components**
   ```jsx
   // File: src/components/task/TaskFilter.jsx (TẠO MỚI)
   // Status, priority, assignee filters
   ```

2. **Tạo Search Component**  
   ```jsx
   // File: src/components/task/TaskSearch.jsx (TẠO MỚI)
   // Search by title/description
   ```

3. **Update Task List Page**
   ```jsx
   // File: src/pages/task/TaskListPage.jsx (TẠO MỚI)
   // Main task management page
   ```

---

## 🗂️ Files To Create/Modify

### **Backend Files (Both Devs)**

#### 📁 **Services**
- `src/service/event.service.js` - Event broadcasting
- `src/service/workload.service.js` - User workload calculation
- `src/stores/taskStore.js` - Task state management

#### 📁 **Controllers** 
- Update `src/controllers/task.controller.js` - Add stats, events
- Update `src/controllers/user.controller.js` - Add workload endpoint

#### 📁 **Routes**
- Update `src/routes/task.routes.js` - Add new endpoints
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
- Update `src/services/api.service.js` - API helpers

#### 📁 **Stores**
- `src/stores/taskStore.js` - Task state (Zustand)
- Update `src/stores/authStore.js` - Add user workload

#### 📁 **Hooks**
- `src/hooks/useSocket.js` - Socket management
- `src/hooks/useTasks.js` - Task operations
- `src/hooks/useToast.js` - Notification system

#### 📁 **Components**

**Task Components:**
- `src/components/task/TaskList.jsx` - Task list view
- `src/components/task/TaskCard.jsx` - Individual task card
- `src/components/task/TaskFilter.jsx` - Filter controls
- `src/components/task/TaskSearch.jsx` - Search functionality
- `src/components/task/AssignmentModal.jsx` - Assignment interface
- `src/components/task/TaskForm.jsx` - Create/Edit forms
- `src/components/task/TaskDetails.jsx` - Task detail view

**UI Components:**
- `src/components/ui/UserSelect.jsx` - User selection dropdown
- `src/components/ui/StatusBadge.jsx` - Status indicators
- `src/components/ui/PriorityBadge.jsx` - Priority indicators
- `src/components/ui/Toast.jsx` - Notification component

#### 📁 **Pages**
- `src/pages/task/TaskListPage.jsx` - Main task page
- `src/pages/task/TaskDetailPage.jsx` - Task details
- `src/pages/dashboard/DashboardPage.jsx` - Analytics dashboard
- Update `src/pages/Home/UserManagementPage.jsx` - Add workload display

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
- Task events được emit properly
- Redis pub/sub working
- Event service implemented

✅ **Frontend:**
- Socket.io client connected
- WebSocket hook created
- Real-time connection established

### **Dev B (Dec 12)**
✅ **Backend:**
- Workload calculator API
- User workload endpoint
- Workload calculation logic

✅ **Frontend:**
- Assignment modal component
- User selection dropdown  
- Assignment integration working

---

## 🎯 Success Criteria

### **End of Day 2**
- [ ] Redis events được emit khi CRUD tasks
- [ ] Frontend có thể connect tới WebSocket
- [ ] Assignment modal hoạt động
- [ ] Workload API trả về đúng data

### **End of Day 3** 
- [ ] Task filtering hoạt động hoàn chỉnh
- [ ] Search functionality working
- [ ] Real-time updates hiển thị trong UI
- [ ] Statistics endpoint hoạt động

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

**🚀 Let's build an amazing MVP together! Good luck! 💪**