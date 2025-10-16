import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES, UserRole } from '../constants/roles';

export interface IUser extends Document {
  orgId?: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  comparePassword(plain: string): Promise<boolean>;
  toSafeJSON(): Omit<IUserJSON, 'password'>;
}

export interface IUserJSON {
  _id: string;
  orgId?: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  password?: string;
}

const UserSchema = new Schema<IUser>(
  {
    orgId: { type: String },
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 8 },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'rep',
      index: true,
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  const user = this as IUser;
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    return next();
  } catch (err) {
    return next(err as any);
  }
});

UserSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  const user = this as IUser;
  return bcrypt.compare(plain, user.password);
};

UserSchema.methods.toSafeJSON = function (): Omit<IUserJSON, 'password'> {
  const user = this as IUser & { createdAt: Date; updatedAt: Date };
  return {
    _id: this._id.toString(),
    orgId: user.orgId,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const User =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);


