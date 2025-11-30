import User from '../models/users.model.js';



class AuthRepository {
    async findByEmail(email){
        return User.findOne({email: email, isDeleted: false});
    }
    async login(email, password) {
        const user = await User.findOne({ email: email, isDeleted: false });
        if (!user) {
            throw new Error('User not found');
        }
        // Không cần kiểm tra password ở đây, để service xử lý
        return user;
    }

    async register(userData){
        const existed = await this.findByEmail(userData.email);
        if(existed){
            throw new Error('Email is already existed');

        }
        const newUser = new User(userData);
        await newUser.save();
        return newUser;
    }
}

export default AuthRepository;