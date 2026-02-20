'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, ChevronRight, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface LoginFormProps {
  session: unknown;
}

export default function LoginForm({ session }: LoginFormProps) {
  const router = useRouter();

  useEffect(() => {
    if (session) router.push('/api/m/set-mode');
  }, [session, router]);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  if (session) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--color-dre-blue)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다');
    } else {
      router.push('/api/m/set-mode');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-white flex">

      {/* ── 좌측: 로그인 패널 ── */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full lg:w-[460px] xl:w-[500px] flex flex-col justify-center px-10 xl:px-16 py-12 relative z-10 border-r border-gray-100"
      >
        {/* 상단 로고 링크 */}
        <Link href="/" className="inline-flex items-center gap-2.5 mb-12 group">
          <Image src="/logo.png" alt="DRE" width={28} height={28} className="rounded-full" />
          <span className="font-bold text-lg text-[var(--color-dre-blue)] group-hover:opacity-80 transition-opacity">DRE 수학</span>
        </Link>

        {/* 헤더 */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[var(--color-dre-blue)] rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-sm">M</span>
            </div>
            <span className="text-sm font-bold text-gray-400">DRE M</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-dre-navy)] leading-tight mb-3">
            학생 · 교사 전용<br />자료 플랫폼
          </h1>
          <p className="text-base text-gray-400 leading-relaxed">
            ELO 레이팅 기반으로 실력에 딱 맞는<br />자료를 자동으로 추천받으세요.
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">이메일</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300">
                <Mail size={17} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-base text-gray-900 placeholder:text-gray-300 font-medium"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">비밀번호</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300">
                <Lock size={17} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-base text-gray-900 placeholder:text-gray-300 font-medium"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[var(--color-dre-blue)] text-white font-bold rounded-2xl hover:bg-[var(--color-dre-blue-dark)] transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 text-base mt-2"
          >
            <span>{loading ? '로그인 중...' : '로그인'}</span>
            {!loading && <ChevronRight size={18} />}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-300 flex items-center gap-1.5">
          <Lock size={12} />
          계정 문의는 원장에게 문의하세요
        </p>
      </motion.div>

      {/* ── 우측: DRE 브랜드 패널 ── */}
      <div className="hidden lg:flex flex-1 bg-[var(--color-dre-navy)] relative overflow-hidden items-center justify-center">
        {/* 배경 패턴 + 글로우 */}
        <div className="absolute inset-0 bg-[url('/pattern-grid.svg')] opacity-[0.04]" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-[var(--color-dre-blue)]/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="relative z-10 px-14 xl:px-20 max-w-2xl w-full"
        >
          {/* 섹션 레이블 */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-px bg-[var(--color-dre-blue)]" />
            <span className="text-xs font-bold text-[var(--color-dre-blue)] uppercase tracking-widest">DRE M Platform</span>
          </div>

          {/* 메인 카피 */}
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-5 tracking-tight">
            나만의 학습 경로,<br />
            <span className="text-[var(--color-dre-blue-light)]">데이터로 설계합니다</span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed mb-12">
            ELO 레이팅이 학생 개인의 실력을 분석해<br />
            최적의 자료를 자동으로 추천합니다.
          </p>

          {/* 기능 목록 */}
          <div className="space-y-4">
            {[
              { dot: 'bg-[var(--color-dre-blue)]',  text: 'ELO 기반 맞춤 자료 추천' },
              { dot: 'bg-violet-400',                text: '취약 단원 자동 감지 및 집중' },
              { dot: 'bg-emerald-400',               text: '학습 피드백으로 레이팅 업데이트' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
                <p className="text-base text-slate-300 font-medium">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
