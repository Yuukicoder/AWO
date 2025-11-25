backend/
├── server.js           # Entry point của ứng dụng
├── package.json        # Dependencies và scripts
└── src/
    ├── config/         # Cấu hình ứng dụng (database, environment variables)
    ├── models/         # Mongoose/Sequelize models (định nghĩa schema database)
    ├── routes/         # API routes/endpoints
    ├── controllers/    # Business logic xử lý requests
    ├── middlewares/    # Custom middlewares (auth, validation, error handling)
    ├── services/       # Business logic phức tạp, tương tác với external services
    └── utils/          # Helper functions và utilities
```



### 2. Luồng xử lý request

```
Client Request
    ↓
[Routes] (src/routes/)
    ↓
[Middlewares] (src/middlewares/)
    ├── Authentication
    ├── Validation
    └── Error handling
    ↓
[Controllers] (src/controllers/)
    ├── Nhận request
    ├── Gọi services/models
    └── Trả về response
    ↓
[Services] (src/services/)
    ├── Business logic
    ├── Tương tác với database (models/)
    └── Gọi external APIs
    ↓
[Models] (src/models/)
    ├── Query database
    └── Data validation
    ↓
Response to Client
```

## Chi tiết các thư mục

### `/src/config`
- Cấu hình database connection
- Environment variables
- App configuration

### `/src/models`
- Định nghĩa schema cho database
- Validation rules
- Relationships giữa các collections/tables

### `/src/routes`
- Định nghĩa API endpoints
- Map routes với controllers
- Apply middlewares cho từng route

### `/src/controllers`
- Xử lý logic cho từng endpoint
- Parse request data
- Call services/models
- Format và trả về response

### `/src/middlewares`
- `auth.js`: Xác thực JWT token
- `validation.js`: Validate request data
- `errorHandler.js`: Xử lý lỗi tập trung

### `/src/services`
- Business logic phức tạp
- Tương tác với third-party APIs
- Xử lý background tasks

### `/src/utils`
- Helper functions
- Common utilities
- Constants

## Ví dụ luồng request cụ thể

```javascript
// POST /api/users/register

1. routes/userRoutes.js
   router.post('/register', validateUser, userController.register)

2. middlewares/validation.js
   validateUser() → Kiểm tra email, password

3. controllers/userController.js
   register() → Nhận data, gọi userService

4. services/userService.js
   createUser() → Hash password, lưu database

5. models/User.js
   User.create() → Tạo user mới trong database

6. Response → Trả về user info và JWT token
```

## Scripts

```bash
# Development
npm run dev

# Production
npm start

# Testing
npm test
```

## Environment Variables

Xem file `.env.example` để biết các biến môi trường cần thiết.
```