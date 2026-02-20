import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import User from '@/lib/models/User';
import { Users, ShieldCheck, GraduationCap, BookOpen } from 'lucide-react';
import RegisterForm from './RegisterForm';
import UserActions from './UserActions';

const roleLabel: Record<string, string> = {
  admin: '관리자',
  teacher: '교사',
  student: '학생',
};

const roleStyle: Record<string, string> = {
  admin: 'bg-red-50 text-red-500 border-red-100',
  teacher: 'bg-amber-50 text-amber-600 border-amber-100',
  student: 'bg-blue-50 text-blue-600 border-blue-100',
};

const RoleIcon = ({ role }: { role: string }) => {
  if (role === 'admin') return <ShieldCheck size={11} />;
  if (role === 'teacher') return <GraduationCap size={11} />;
  return <BookOpen size={11} />;
};

export default async function AdminUsersPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'admin') redirect('/m/materials');

  await connectMongo();
  const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();

  const counts = { admin: 0, teacher: 0, student: 0 };
  for (const u of users) counts[u.role as keyof typeof counts] = (counts[u.role as keyof typeof counts] || 0) + 1;

  return (
    <div className="min-h-screen">
      {/* ── 페이지 헤더 ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8 sm:py-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
            <span className="text-[13px] font-black text-red-500 tracking-wide">관리자 패널</span>
          </div>
          <h1 className="text-3xl sm:text-[2.25rem] font-black text-gray-900 tracking-tight leading-tight">회원 관리</h1>
          <div className="flex items-center gap-4 mt-3 text-[14px] font-bold text-gray-500">
            <span className="flex items-center gap-1.5">
              <Users size={16} className="text-blue-600" />전체 {users.length.toLocaleString()}명
            </span>
            <span className="text-gray-300">|</span>
            <span>관리자 {counts.admin} <span className="text-gray-300 font-normal">/</span> 교사 {counts.teacher} <span className="text-gray-300 font-normal">/</span> 학생 {counts.student}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-8 space-y-6">
        {/* 계정 생성 */}
        <RegisterForm />

        {/* 사용자 목록 */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[540px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-7 py-4 text-[11px] font-black text-gray-500 uppercase tracking-widest">회원</th>
                <th className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">역할</th>
                <th className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">가입일</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={String(u._id)} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900 text-sm">{u.username}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${roleStyle[u.role]}`}>
                      <RoleIcon role={u.role} />
                      {roleLabel[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <UserActions userId={String(u._id)} username={u.username} currentRole={u.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
