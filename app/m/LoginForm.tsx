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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-white flex w-full font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* ── 좌측: 로그인 패널 ── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full lg:w-[480px] xl:w-[540px] flex flex-col justify-center px-8 sm:px-12 xl:px-20 py-12 relative z-10 bg-white"
      >
        {/* 상단 로고 */}
        <Link href="/" className="inline-flex items-center gap-3 mb-16 group w-max">
          <div className="relative">
            <Image src="/logo.png" alt="DRE" width={32} height={32} className="rounded-xl shadow-sm relative z-10 group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-[var(--color-dre-blue)] blur-sm opacity-20 rounded-xl group-hover:opacity-40 transition-opacity" />
          </div>
          <span className="font-extrabold text-xl text-gray-900 tracking-tight group-hover:text-[var(--color-dre-blue)] transition-colors duration-300">
            DRE 수학
          </span>
        </Link>

        {/* 헤더 섹션 */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-2 mb-5"
          >
            <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 text-[var(--color-dre-blue)] text-xs font-bold tracking-widest uppercase">
              Platform
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-[2.25rem] sm:text-[2.5rem] font-black text-gray-900 leading-[1.1] mb-4 tracking-[-0.02em]"
          >
            환영합니다.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-dre-blue)] to-[var(--color-dre-blue-light)]">
              DRE M
            </span> 시작하기
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-base text-gray-500 font-medium leading-relaxed"
          >
            ELO 레이팅 기반 맞춤형 학습 자료.
            <br className="hidden sm:block" />
            이메일로 간편하게 로그인하세요.
          </motion.p>
        </div>

        {/* 폼 섹션 */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">이메일</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--color-dre-blue)] transition-colors">
                <Mail size={18} strokeWidth={2.5} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[var(--color-dre-blue)] focus:ring-[3px] focus:ring-blue-100 outline-none transition-all duration-300 text-[15px] text-gray-900 placeholder:text-gray-400 font-semibold shadow-sm"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">비밀번호</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--color-dre-blue)] transition-colors">
                <Lock size={18} strokeWidth={2.5} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[var(--color-dre-blue)] focus:ring-[3px] focus:ring-blue-100 outline-none transition-all duration-300 text-[15px] text-gray-900 placeholder:text-gray-400 font-semibold shadow-sm"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              className="p-4 bg-red-50/80 border border-red-100 rounded-2xl text-[14px] text-red-600 font-bold flex items-center gap-2.5 backdrop-blur-sm"
            >
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 animate-pulse" />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full py-4 bg-[var(--color-dre-blue)] text-white font-bold rounded-2xl hover:bg-[var(--color-dre-blue-dark)] transition-all duration-300 shadow-[0_8px_16px_-6px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_20px_-6px_rgba(37,99,235,0.5)] hover:-translate-y-0.5 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-[15px] mt-4"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:animate-[shine_1s_ease-out]" />
            <div className="flex items-center justify-center gap-2 relative z-10">
              <span className="tracking-wide">{loading ? '확인 중...' : '로그인'}</span>
              {!loading && (
                <ChevronRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
              )}
            </div>
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-10 flex flex-col gap-4 text-center"
        >
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400 font-medium">
            <span className="w-8 h-[1px] bg-gray-200"></span>
            <span>도움이 필요하신가요?</span>
            <span className="w-8 h-[1px] bg-gray-200"></span>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            계정 발급 및 문의는 다니고 있는 학원의 원장님께 문의해주세요.
          </p>
        </motion.div>
      </motion.div>

      {/* ── 우측: DRE 브랜드 공간 (아닐라이프/보드게임즈 스타일의 화려함) ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[var(--color-dre-navy)] items-center justify-center p-12 xl:p-20">
        {/* 모던한 백그라운드 효과 */}
        <div className="absolute inset-0 bg-[url('/pattern-grid.svg')] opacity-[0.03] mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[var(--color-dre-blue)]/20 via-blue-800/5 to-transparent rounded-full blur-[120px] pointer-events-none translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/15 via-purple-900/5 to-transparent rounded-full blur-[100px] pointer-events-none -translate-x-1/4 translate-y-1/4" />

        {/* 인터랙티브 글로우 포인터용 (생략가능하나 화려함 추가) */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-dre-navy)]/80 to-[var(--color-dre-navy)] pointer-events-none z-0" />

        <div className="relative z-10 w-full max-w-2xl">
          {/* 배지 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-2xl"
          >
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs font-bold text-blue-200 tracking-wider">PREMIUM EDTECH</span>
          </motion.div>

          {/* 메인 텍스트 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
          >
            <h2 className="text-[2.75rem] xl:text-[3.5rem] font-black text-white leading-[1.15] tracking-tight mb-6 drop-shadow-lg">
              나에게 꼭 필요한 문제만,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                꾸준하고 확실하게.
              </span>
            </h2>
            <p className="text-lg xl:text-xl text-blue-100/70 font-medium leading-relaxed mb-12 max-w-lg">
              막연하게 많은 양을 푸는 것보다 나의 현재 취약점을 정확히 아는 것이 중요합니다. DRE M은 학생의 객관적인 수준을 파악하여 가장 효율적인 학습 방향을 제시합니다.
            </p>
          </motion.div>

          {/* 특장점 (Glassmorphism 카드 UI) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">정확한 실력 진단</h3>
              <p className="text-sm text-blue-100/60 font-medium leading-relaxed">
                막연한 감이 아닌 누적된 풀이 데이터를 바탕으로, 내가 어느 부분에 강하고 약한지 객관적으로 판단합니다.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">내 수준에 맞는 자료</h3>
              <p className="text-sm text-blue-100/60 font-medium leading-relaxed">
                시간 낭비 없이, 지금 나에게 가장 시급하고 도움이 되는 난이도의 문제들만 골라서 훈련합니다.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
