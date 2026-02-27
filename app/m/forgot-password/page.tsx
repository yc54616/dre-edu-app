'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            setError('이메일을 입력해 주세요.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/m/auth/password-reset/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || '이메일 발송에 실패했습니다.');
            } else {
                setSuccess(data.message || '비밀번호 재설정 이메일을 발송했습니다.');
                setEmail('');
            }
        } catch {
            setError('서버와 통신 중 문제가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-white font-sans selection:bg-blue-100 selection:text-blue-900 px-5 sm:px-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_8%_0%,rgba(59,130,246,0.05),transparent_44%),radial-gradient(ellipse_at_92%_86%,rgba(125,211,252,0.05),transparent_48%)]" />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10"
            >
                <button
                    onClick={() => router.back()}
                    className="group mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 border border-gray-100 transition-colors group-hover:bg-white group-hover:border-gray-200 group-hover:shadow-sm">
                        <ArrowLeft size={16} />
                    </div>
                    <span>이전으로 반환</span>
                </button>

                <div className="mb-8">
                    <h1 className="mb-3 text-[1.8rem] font-black tracking-tight text-gray-900">
                        비밀번호 <span className="text-[var(--color-dre-blue)]">찾기</span>
                    </h1>
                    <p className="text-gray-500 font-medium leading-relaxed">
                        가입한 이메일을 입력하시면 비밀번호를 재설정할 수 있는 링크를 보내드립니다.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4.5">
                    <div className="space-y-2">
                        <label className="ml-1 text-sm font-bold text-gray-700">이메일</label>
                        <div className="group relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 transition-colors group-focus-within:text-[var(--color-dre-blue)]">
                                <Mail size={18} strokeWidth={2.5} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-2xl border border-transparent bg-[#f3f7ff] py-3.5 pl-11 pr-4 text-[15px] font-semibold text-gray-900 shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-blue-100 focus:bg-white focus:ring-[3px] focus:ring-blue-100"
                                placeholder="가입 시 등록한 이메일 입력"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-[14px] font-bold text-red-600">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-[14px] font-bold text-emerald-700">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-dre-blue)] py-3.5 text-[15px] font-bold tracking-wide text-white shadow-[0_12px_24px_-12px_rgba(37,99,235,0.52)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-dre-blue-dark)] hover:shadow-[0_16px_28px_-12px_rgba(37,99,235,0.58)] disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none"
                    >
                        <span>{loading ? '메일 발송 중...' : '재설정 메일 보내기'}</span>
                        {!loading && <ChevronRight size={18} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <span className="text-sm font-medium text-gray-500">비밀번호가 기억나셨나요? </span>
                    <Link href="/m" className="text-sm font-bold text-[var(--color-dre-blue)] hover:underline ml-1">
                        로그인하기
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
