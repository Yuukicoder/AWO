import User from '../models/users.model.js';



class AuthRepository {
    async login(email, password) {
        const user = await User.findOne({ email: email, isDeleted: false });
        if (!user) {
            throw new Error('User not found');
        }
        // Không cần kiểm tra password ở đây, để service xử lý
        return user;
    }
}

export default AuthRepository;