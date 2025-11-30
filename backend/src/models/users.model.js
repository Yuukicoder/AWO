import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "member", "manager"],
      default: "member",
    },
    skills: [
      {
        name: { type: String },
        level: { type: Number },
      },
    ],
    capacityHoursPerWeek: { type: Number, default: 40 },
    currentEstimatedHours: { type: Number },

    // authentication fields
    password: { type: String, required: true, minlength: 8 },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // refresh token
    refreshToken: String,
    // status fields
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "users" }
);
// hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ✅ Sửa: method → methods
userSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
