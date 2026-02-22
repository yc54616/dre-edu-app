'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email:    '',
    username: '',
    password: '',
    userRole: 'student',
  });
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [showPw,     setShowPw]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    const res = await fetch('/api/m/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || '등록 실패');
    } else {
      setSuccess(`${data.user.username} (${data.user.email}) 계정이 생성되었습니다.`);
      setForm({ email: '', username: '', password: '', userRole: 'student' });
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="m-detail-card p-6 space-y-4">
      <h2 className="text-base font-bold text-gray-900 mb-1">새 계정 생성</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">이름 *</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            placeholder="홍길동"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">역할 *</label>
          <select
            value={form.userRole}
            onChange={(e) => setForm({ ...form, userRole: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
          >
            <option value="student">학생</option>
            <option value="teacher">교사</option>
            <option value="admin">관리자</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">이메일 *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            placeholder="name@example.com"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">비밀번호 *</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              placeholder="6자 이상"
              className="w-full pr-10 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">{error}</div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-600 font-medium">{success}</div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="m-detail-btn-primary flex items-center gap-2 px-5 py-2.5 text-sm rounded-xl disabled:opacity-50"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
        {saving ? '생성 중...' : '계정 생성'}
      </button>
    </form>
  );
}
