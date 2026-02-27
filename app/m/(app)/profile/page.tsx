'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, ChevronRight, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';

interface ProfileData {
    username: string;
    email: string;
    phone: string;
    role: string;
    agreeMarketing: boolean;
    isUnder14AtSignup: boolean;
    guardianName: string;
    guardianContact: string;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Password State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [pwdSaving, setPwdSaving] = useState(false);
    const [pwdError, setPwdError] = useState('');
    const [pwdSuccess, setPwdSuccess] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/m/user/profile');
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            } else {
                setError('프로필 정보를 불러오는데 실패했습니다.');
            }
        } catch (err) {
            setError('서버 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    function formatPhone(val: string) {
        const digits = val.replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 3) return digits;
        if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setError('');
        setSuccess('');

        const phoneDigits = profile.phone.replace(/\D/g, '');
        if (profile.agreeMarketing && phoneDigits.length < 10) {
            setError('혜택/이벤트 정보 수신 동의 시 연락처(휴대전화)를 입력해 주세요.');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/m/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: profile.phone,
                    agreeMarketing: profile.agreeMarketing,
                    guardianName: profile.guardianName,
                    guardianContact: profile.guardianContact,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess('프로필 정보가 성공적으로 업데이트되었습니다.');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.error || '정보 업데이트에 실패했습니다.');
            }
        } catch (err) {
            setError('네트워크 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwdError('');
        setPwdSuccess('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPwdError('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPwdError('새 비밀번호는 6자 이상이어야 합니다.');
            return;
        }

        setPwdSaving(true);
        try {
            const res = await fetch('/api/m/user/password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setPwdSuccess('비밀번호가 성공적으로 변경되었습니다.');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setPwdSuccess(''), 3000);
            } else {
                setPwdError(data.error || '비밀번호 변경에 실패했습니다.');
            }
        } catch (err) {
            setPwdError('네트워크 오류가 발생했습니다.');
        } finally {
            setPwdSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-gray-500">프로필 정보를 불러올 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 bg-gray-50/50 min-h-screen">
            <div className="mb-8 pl-1">
                <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">내 정보</h1>
                <p className="mt-2 text-sm text-gray-500 font-medium">계정 정보 및 설정을 관리하세요.</p>
            </div>

            <div className="space-y-8">
                {/* 프로필 정보 수정 시작 */}
                <section className="rounded-3xl bg-white p-6 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 sm:p-8">
                    <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                        <User size={20} className="text-[var(--color-dre-blue)]" /> 기본 정보 설정
                    </h2>

                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 ml-1">이름</label>
                                <div className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5 text-[15px] font-semibold text-gray-500">
                                    {profile.username}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 ml-1">이메일 (계정)</label>
                                <div className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5 text-[15px] font-semibold text-gray-500">
                                    {profile.email}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 ml-1">연락처 (휴대전화)</label>
                            <div className="relative group">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 transition-colors group-focus-within:text-[var(--color-dre-blue)]">
                                    <Phone size={17} />
                                </div>
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: formatPhone(e.target.value) })}
                                    className="w-full rounded-2xl border border-gray-200 bg-[#fbfdff] py-3.5 pl-11 pr-4 text-[15px] font-semibold text-gray-900 shadow-sm outline-none transition-all focus:border-blue-200 focus:bg-white focus:ring-[3px] focus:ring-blue-100 placeholder:text-gray-400"
                                    placeholder="010-0000-0000"
                                    maxLength={13}
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 px-5 py-4 transition-colors hover:bg-blue-50">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <div className="mt-0.5 flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={profile.agreeMarketing}
                                        onChange={(e) => setProfile({ ...profile, agreeMarketing: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300 text-[var(--color-dre-blue)] focus:ring-blue-200 cursor-pointer"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[14px] font-bold text-gray-900">혜택/이벤트 정보 수신 동의</span>
                                    <span className="text-xs font-medium text-gray-500 mt-1 leading-relaxed">
                                        동의 시 맞춤형 교육 자료 및 이벤트 소식을 전해드립니다.<br />(마케팅 수신 동의 시 연락처 입력 필수)
                                    </span>
                                </div>
                            </label>
                        </div>

                        {profile.isUnder14AtSignup && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 space-y-4">
                                <p className="text-[13px] font-bold text-amber-800 flex items-center gap-2">
                                    <ShieldCheck size={18} /> 만 14세 미만 가입 시 입력된 법정대리인 정보
                                </p>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-amber-700 ml-1">성명</label>
                                        <input
                                            type="text"
                                            value={profile.guardianName}
                                            onChange={(e) => setProfile({ ...profile, guardianName: e.target.value })}
                                            className="w-full rounded-xl border border-amber-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-amber-700 ml-1">연락처/이메일</label>
                                        <input
                                            type="text"
                                            value={profile.guardianContact}
                                            onChange={(e) => setProfile({ ...profile, guardianContact: e.target.value })}
                                            className="w-full rounded-xl border border-amber-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                                <CheckCircle2 size={16} className="shrink-0" />
                                {success}
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 rounded-2xl bg-gray-900 px-7 py-3.5 text-[15px] font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-lg disabled:cursor-not-allowed disabled:transform-none disabled:bg-gray-400"
                            >
                                {saving ? '저장 중...' : '변경 내용 저장'}
                            </button>
                        </div>
                    </form>
                </section>
                {/* 프로필 정보 수정 끝 */}

                {/* 비밀번호 변경 시작 */}
                <section className="rounded-3xl bg-white p-6 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 sm:p-8">
                    <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
                        <Lock size={20} className="text-[var(--color-dre-blue)]" /> 비밀번호 변경
                    </h2>

                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 ml-1">현재 비밀번호</label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                className="w-full rounded-2xl border border-gray-200 bg-[#fbfdff] px-4 py-3.5 text-[15px] font-semibold text-gray-900 shadow-sm outline-none transition-all focus:border-blue-200 focus:bg-white focus:ring-[3px] focus:ring-blue-100 placeholder:text-gray-400"
                                placeholder="현재 비밀번호를 입력하세요"
                                required
                            />
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 ml-1">새 비밀번호</label>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    className="w-full rounded-2xl border border-gray-200 bg-[#fbfdff] px-4 py-3.5 text-[15px] font-semibold text-gray-900 shadow-sm outline-none transition-all focus:border-blue-200 focus:bg-white focus:ring-[3px] focus:ring-blue-100 placeholder:text-gray-400"
                                    placeholder="6자 이상 입력"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 ml-1">새 비밀번호 확인</label>
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    className="w-full rounded-2xl border border-gray-200 bg-[#fbfdff] px-4 py-3.5 text-[15px] font-semibold text-gray-900 shadow-sm outline-none transition-all focus:border-blue-200 focus:bg-white focus:ring-[3px] focus:ring-blue-100 placeholder:text-gray-400"
                                    placeholder="새 비밀번호를 다시 입력하세요"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {pwdError && (
                            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                                {pwdError}
                            </div>
                        )}

                        {pwdSuccess && (
                            <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                                <CheckCircle2 size={16} className="shrink-0" />
                                {pwdSuccess}
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={pwdSaving}
                                className="flex items-center gap-2 rounded-2xl bg-[var(--color-dre-blue)] px-7 py-3.5 text-[15px] font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg disabled:cursor-not-allowed disabled:transform-none disabled:bg-blue-400"
                            >
                                {pwdSaving ? '변경 중...' : '비밀번호 변경'}
                            </button>
                        </div>
                    </form>
                </section>
                {/* 비밀번호 변경 끝 */}

            </div>
        </div>
    );
}
