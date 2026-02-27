'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!token || !emailParam) {
        return (
            <div className="text-center py-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4">
                    <Lock size={28} />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">유효하지 않은 접근</h2>
                <p className="text-sm text-gray-500 mb-6">올바른 비밀번호 재설정 링크가 아닙니다.</p>
                <Link href="/m/forgot-password" className="text-blue-600 font-bold hover:underline">
                    다시 비밀번호 찾기 요청하기
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            setError('비밀번호는 8자 이상이어야 합니다.');
            return;
        }
        if (password !== passwordConfirm) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/m/auth/password-reset/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailParam,
                    token,
                    newPassword: password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || '비밀번호 재설정에 실패했습니다.');
            } else {
                setSuccess('비밀번호가 성공적으로 변경되었습니다!');
                setTimeout(() => {
                    router.push('/m');
                    router.refresh();
                }, 2000);
            }
        } catch {
            setError('서버와 통신 중 문제가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
            >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mb-5">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2">변경 완료</h2>
                <p className="text-sm font-medium text-gray-500 mb-6">
                    {success} 잠시 후 로그인 페이지로 이동합니다.
                </p>
                <button
                    onClick={() => router.push('/m')}
                    className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-200"
                >
                    즉시 이동하기
                </button>
            </motion.div>
        );
    }

    return (
        <>
            <button
                onClick={() => router.back()}
                className="group mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 border border-gray-100 transition-colors group-hover:bg-white group-hover:border-gray-200 group-hover:shadow-sm">
                    <ArrowLeft size={16} />
                </div>
                <span>돌아가기</span>
            </button>

            <div className="mb-8">
                <h1 className="mb-3 text-[1.8rem] font-black tracking-tight text-gray-900">
                    새로운 비밀번호 <span className="text-[var(--color-dre-blue)]">설정</span>
                </h1>
                <p className="text-gray-500 font-medium leading-relaxed">
                    계정에 로그인하기 위한 <br className="sm:hidden" />새로운 비밀번호를 입력해 주세요.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4.5">
                <div className="space-y-2">
                    <label className="ml-1 text-sm font-bold text-gray-700">새 비밀번호</label>
                    <div className="group relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 transition-colors group-focus-within:text-[var(--color-dre-blue)]">
                            <Lock size={18} strokeWidth={2.5} />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full rounded-2xl border border-transparent bg-[#f3f7ff] py-3.5 pl-11 pr-4 text-[15px] font-semibold text-gray-900 shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-blue-100 focus:bg-white focus:ring-[3px] focus:ring-blue-100"
                            placeholder="8자 이상 숫자, 영문 조합 권장"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="ml-1 text-sm font-bold text-gray-700">비밀번호 확인</label>
                    <div className="group relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 transition-colors group-focus-within:text-[var(--color-dre-blue)]">
                            <Lock size={18} strokeWidth={2.5} />
                        </div>
                        <input
                            type="password"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            required
                            minLength={8}
                            className="w-full rounded-2xl border border-transparent bg-[#f3f7ff] py-3.5 pl-11 pr-4 text-[15px] font-semibold text-gray-900 shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-blue-100 focus:bg-white focus:ring-[3px] focus:ring-blue-100"
                            placeholder="비밀번호를 한 번 더 입력하세요"
                        />
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-[14px] font-bold text-red-600">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-dre-blue)] py-3.5 text-[15px] font-bold tracking-wide text-white shadow-[0_12px_24px_-12px_rgba(37,99,235,0.52)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-dre-blue-dark)] hover:shadow-[0_16px_28px_-12px_rgba(37,99,235,0.58)] disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none"
                >
                    <span>{loading ? '변경 처리 중...' : '비밀번호 변경하기'}</span>
                    {!loading && <ChevronRight size={18} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />}
                </button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-white font-sans selection:bg-blue-100 selection:text-blue-900 px-5 sm:px-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_8%_0%,rgba(59,130,246,0.05),transparent_44%),radial-gradient(ellipse_at_92%_86%,rgba(125,211,252,0.05),transparent_48%)]" />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10"
            >
                <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
                    <ResetPasswordForm />
                </Suspense>
            </motion.div>
        </div>
    );
}
