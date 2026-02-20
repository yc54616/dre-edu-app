/**
 * 사용자 생성 스크립트
 * 실행: npx tsx scripts/createUser.ts
 *
 * .env.local 필요:
 *   MONGODB_URI=mongodb://...
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dre-edu';

const userSchema = new mongoose.Schema({
  email:     { type: String, required: true, unique: true, lowercase: true },
  username:  { type: String, required: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
  createdAt: { type: Date, default: Date.now },
});

import bcrypt from 'bcryptjs';

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected');

  const User = mongoose.models.User || mongoose.model('User', userSchema);

  // ▼ 생성할 사용자 정보 수정
  const users = [
    { email: 'admin@dre.kr',   username: '관리자', password: 'dre2024!', role: 'admin' },
    { email: 'teacher@dre.kr', username: '선생님', password: 'dre2024!', role: 'teacher' },
    { email: 'student@dre.kr', username: '학생1',  password: 'dre2024!', role: 'student' },
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`⚠️  이미 존재: ${u.email}`);
      continue;
    }
    const hash = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, password: hash });
    console.log(`✅ 생성됨: ${u.email} (${u.role})`);
  }

  await mongoose.disconnect();
  console.log('Done');
}

main().catch(console.error);
