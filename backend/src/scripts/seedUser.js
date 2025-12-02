import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String,
    skills: Array,
    capacityHoursPerWeek: Number,
    currentEstimatedHours: Number,
    password: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    refreshToken: String,
    isActive: Boolean,
    isDeleted: Boolean,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const sampleUsers = [
    {
        name: 'Admin User',
        email: 'admin@awo.com',
        password: 'Admin123!@#',
        role: 'admin',
        skills: [
            { name: 'Project Management', level: 5 },
            { name: 'Leadership', level: 5 }
        ],
        capacityHoursPerWeek: 40,
        currentEstimatedHours: 0,
        isActive: true,
        isDeleted: false
    },
    {
        name: 'John Manager',
        email: 'manager@awo.com',
        password: 'Manager123!@#',
        role: 'manager',
        skills: [
            { name: 'Team Management', level: 4 },
            { name: 'Planning', level: 4 }
        ],
        capacityHoursPerWeek: 40,
        currentEstimatedHours: 20,
        isActive: true,
        isDeleted: false
    },
    {
        name: 'Jane Member',
        email: 'member@awo.com',
        password: 'Member123!@#',
        role: 'member',
        skills: [
            { name: 'JavaScript', level: 4 },
            { name: 'React', level: 4 },
            { name: 'Node.js', level: 3 }
        ],
        capacityHoursPerWeek: 40,
        currentEstimatedHours: 35,
        isActive: true,
        isDeleted: false
    }
];

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('✅ Connected to MongoDB');

        // Xóa users cũ
        await User.deleteMany({});
        console.log('🗑️  Cleared existing users');

        // Lưu password gốc trước khi hash
        const loginCredentials = sampleUsers.map(u => ({
            email: u.email,
            password: u.password,
            role: u.role,
            name: u.name
        }));

        // Hash passwords
        for (let user of sampleUsers) {
            user.password = await bcrypt.hash(user.password, 12);
        }

        // Insert users
        const createdUsers = await User.insertMany(sampleUsers);
        console.log(`✅ Created ${createdUsers.length} users successfully!\n`);

        console.log('📝 Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        loginCredentials.forEach(cred => {
            console.log(`\n${cred.role.toUpperCase()} - ${cred.name}`);
            console.log(`  📧 Email: ${cred.email}`);
            console.log(`  🔒 Password: ${cred.password}`);
        });

        await mongoose.connection.close();
        console.log('\n✅ Seed completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedUsers();