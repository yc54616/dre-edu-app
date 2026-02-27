'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ChevronRight, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import PolicyLinks from '@/components/m/PolicyLinks';

interface LoginFormProps {
  session: unknown;
}

export default function LoginForm({ session }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (session) {
      fetch('/api/m/set-mode')
        .then((res) => res.json())
        .then((data: { redirect?: string }) => {
          router.push(data.redirect || '/m/materials');
          router.refresh();
        })
        .catch(() => {
          router.push('/m/materials');
          router.refresh();
        });
    }
  }, [session, router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorKind, setErrorKind] = useState<'generic' | 'email_unverified' | 'teacher_pending'>('generic');
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendInfo, setResendInfo] = useState('');
  const [resendDebugUrl, setResendDebugUrl] = useState('');

  const verifyState = searchParams.get('verify');
  const approvalState = searchParams.get('approval');
  const verifyMessage =
    verifyState === 'success'
      ? approvalState === 'pending'
        ? { tone: 'warning', text: '이메일 인증이 완료되었습니다. 현재 교사 계정은 관리자 승인 대기 상태입니다.' }
        : { tone: 'success', text: '이메일 인증이 완료되었습니다. 로그인해 주세요.' }
      : verifyState === 'expired'
        ? { tone: 'warning', text: '인증 링크가 만료되었습니다. 아래에서 인증 메일을 재발송해 주세요.' }
        : verifyState === 'invalid'
          ? { tone: 'error', text: '유효하지 않은 인증 링크입니다. 이메일을 확인한 뒤 다시 시도해 주세요.' }
          : null;

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
    setErrorKind('generic');
    setResendError('');
    setResendInfo('');
    setResendDebugUrl('');
    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      let message = '아이디 또는 비밀번호가 올바르지 않습니다';
      let kind: 'generic' | 'email_unverified' | 'teacher_pending' = 'generic';

      try {
        const helpRes = await fetch('/api/m/auth/login-help', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const help = await helpRes.json() as { reason?: string };
        if (help.reason === 'EMAIL_UNVERIFIED') {
          message = '이메일 인증이 필요합니다. 아래에서 인증 메일을 재발송해 주세요.';
          kind = 'email_unverified';
        } else if (help.reason === 'TEACHER_PENDING') {
          message = '교사 계정은 현재 관리자 승인 대기 상태입니다.';
          kind = 'teacher_pending';
        }
      } catch {
        // 보조 힌트 API 실패 시 기본 메시지 유지
      }

      setErrorKind(kind);
      setError(message);
    } else {
      fetch('/api/m/set-mode')
        .then((res) => res.json())
        .then((data: { redirect?: string }) => {
          router.push(data.redirect || '/m/materials');
          router.refresh();
        })
        .catch(() => {
          router.push('/m/materials');
          router.refresh();
        });
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) {
      setResendError('인증 메일을 재발송하려면 이메일을 먼저 입력해 주세요.');
      setResendInfo('');
      return;
    }

    setResending(true);
    setResendError('');
    setResendInfo('');
    setResendDebugUrl('');

    const res = await fetch('/api/m/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail }),
    });

    const data = await res.json();
    setResending(false);

    if (!res.ok) {
      setResendError(data.error || '인증 메일 재발송에 실패했습니다.');
      return;
    }

    setResendInfo(data.message || '인증 메일이 발송되었습니다. 메일함을 확인해 주세요.');
    if (typeof data.verifyUrl === 'string') {
      setResendDebugUrl(data.verifyUrl);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_8%_0%,rgba(59,130,246,0.05),transparent_44%),radial-gradient(ellipse_at_92%_86%,rgba(125,211,252,0.05),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#fbfdff_0%,#ffffff_42%,#ffffff_100%)]" />

      <div className="relative w-full">
        <div className="grid min-h-screen items-stretch xl:grid-cols-[minmax(540px,620px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(560px,640px)_minmax(0,1fr)]">
          {/* ── 좌측: 로그인 패널 ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex min-h-screen w-full flex-col justify-center bg-white px-5 py-8 sm:px-8 md:px-10 xl:px-14 2xl:px-16"
          >
            <div className="mx-auto w-full max-w-[560px] xl:mx-0 xl:max-w-none">
              <Link href="/" className="group mb-10 inline-flex w-max items-center gap-3">
                <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="DRE"
                    width={34}
                    height={34}
                    className="relative z-10 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 rounded-xl bg-[var(--color-dre-blue)]/20 blur-sm transition-opacity group-hover:opacity-80" />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-gray-900 transition-colors duration-300 group-hover:text-[var(--color-dre-blue)]">
                  DRE 수학
                </span>
              </Link>

              <div className="mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.45 }}
                  className="mb-5 flex items-center gap-2"
                >
                  <span className="rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-[var(--color-dre-blue)]">
                    Platform
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.45 }}
                  className="mb-4 text-[2rem] font-black leading-[1.1] tracking-[-0.02em] text-gray-900 sm:text-[2.4rem]"
                >
                  환영합니다.
                  <br />
                  <span className="bg-gradient-to-r from-[var(--color-dre-blue)] to-[var(--color-dre-blue-light)] bg-clip-text text-transparent">
                    DRE M
                  </span>{' '}
                  시작하기
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.45 }}
                  className="text-base font-medium leading-relaxed text-gray-500"
                >
                  ELO 레이팅 기반 맞춤형 학습 자료를 제공합니다.
                  <br className="hidden sm:block" />
                  이메일 인증 후 로그인해 주세요.
                </motion.p>
              </div>

              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4.5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.45 }}
              >
                {verifyMessage && (
                  <div className={`rounded-2xl px-4 py-3 text-sm font-semibold ${verifyMessage.tone === 'success'
                      ? 'border border-emerald-100 bg-emerald-50 text-emerald-700'
                      : verifyMessage.tone === 'warning'
                        ? 'border border-amber-100 bg-amber-50 text-amber-700'
                        : 'border border-red-100 bg-red-50 text-red-600'
                    }`}>
                    {verifyMessage.text}
                  </div>
                )}

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
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="ml-1 text-sm font-bold text-gray-700">비밀번호</label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 transition-colors group-focus-within:text-[var(--color-dre-blue)]">
                      <Lock size={18} strokeWidth={2.5} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-transparent bg-[#f3f7ff] py-3.5 pl-11 pr-4 text-[15px] font-semibold text-gray-900 shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-blue-100 focus:bg-white focus:ring-[3px] focus:ring-blue-100"
                      placeholder="비밀번호를 입력하세요"
                    />
                  </div>
                </div>

                {error && (
                  <div className="space-y-2">
                    <motion.div
                      initial={{ opacity: 0, y: -5, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      className="flex items-center gap-2.5 rounded-2xl border border-red-100 bg-red-50/85 p-4 text-[14px] font-bold text-red-600"
                    >
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500 animate-pulse" />
                      {error}
                    </motion.div>
                    {errorKind === 'email_unverified' && (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resending}
                        className="w-full rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {resending ? '인증 메일 재발송 중...' : '이메일 인증 재발송'}
                      </button>
                    )}
                  </div>
                )}

                {resendError && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                    {resendError}
                  </div>
                )}

                {resendInfo && (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    {resendInfo}
                  </div>
                )}

                {resendDebugUrl && (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    <p className="font-semibold mb-1">개발 모드 인증 링크</p>
                    <a href={resendDebugUrl} className="underline break-all">
                      {resendDebugUrl}
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-dre-blue)] py-3.5 text-[15px] font-bold tracking-wide text-white shadow-[0_12px_24px_-12px_rgba(37,99,235,0.52)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-dre-blue-dark)] hover:shadow-[0_16px_28px_-12px_rgba(37,99,235,0.58)] disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none"
                >
                  <span>{loading ? '확인 중...' : '로그인'}</span>
                  {!loading && <ChevronRight size={18} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />}
                </button>

                <div className="pt-1 text-center">
                  <span className="text-sm text-gray-500">처음이신가요? </span>
                  <Link href="/m/signup" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                    회원가입
                  </Link>
                  <span className="mx-2 text-gray-300">|</span>
                  <Link href="/m/forgot-password" className="text-sm font-bold text-gray-500 hover:text-gray-700">
                    비밀번호 찾기
                  </Link>
                </div>
              </motion.form>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:hidden">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                  <p className="text-sm font-bold text-blue-700">정확한 실력 진단</p>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-blue-900/75">
                    누적 풀이 데이터를 바탕으로 취약 단원을 빠르게 파악합니다.
                  </p>
                </div>
                <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                  <p className="text-sm font-bold text-sky-700">맞춤 자료 추천</p>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-sky-900/75">
                    현재 수준에 맞는 자료를 우선순위로 제안해 학습 효율을 높입니다.
                  </p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65, duration: 0.45 }}
                className="mt-8 flex flex-col gap-4 text-center"
              >
                <div className="flex items-center justify-center gap-4 text-sm font-medium text-gray-400">
                  <span className="h-px w-8 bg-gray-200" />
                  <span>도움이 필요하신가요?</span>
                  <span className="h-px w-8 bg-gray-200" />
                </div>
                <p className="text-xs font-medium text-gray-400">
                  계정 발급 및 문의는 다니고 있는 학원의 원장님께 문의해주세요.
                </p>
                <PolicyLinks className="justify-center" />
              </motion.div>
            </div>
          </motion.div>

          {/* ── 우측: DRE 브랜드 소개 ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f9fcff_0%,#f4f8ff_52%,#fbfdff_100%)] xl:flex"
          >
            <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-14 h-64 w-64 rounded-full bg-sky-100/60 blur-3xl" />

            <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col justify-center px-10 py-14 xl:px-16">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.45 }}
                className="mb-6 inline-flex w-max items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5"
              >
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs font-bold tracking-wider text-blue-700">PREMIUM EDTECH</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.33, duration: 0.45 }}
              >
                <h2 className="mb-5 text-[2.35rem] font-black leading-[1.17] tracking-tight text-gray-900 xl:text-[3.05rem]">
                  나에게 꼭 필요한 문제만,
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    꾸준하고 확실하게.
                  </span>
                </h2>
                <p className="mb-8 max-w-2xl text-lg font-medium leading-relaxed text-gray-600">
                  막연하게 많은 양을 푸는 것보다 나의 현재 취약점을 정확히 아는 것이 중요합니다. DRE M은 학생의 객관적인 수준을 파악하여 가장 효율적인 학습 방향을 제시합니다.
                </p>
              </motion.div>

              <div className="grid gap-4 xl:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.45 }}
                  className="rounded-2xl bg-white/88 p-5 shadow-[0_16px_34px_-28px_rgba(37,99,235,0.35)] backdrop-blur-sm"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_10px_22px_-12px_rgba(37,99,235,0.6)]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900">정확한 실력 진단</h3>
                  <p className="text-sm font-medium leading-relaxed text-gray-600">
                    막연한 감이 아닌 누적된 풀이 데이터를 바탕으로, 내가 어느 부분에 강하고 약한지 객관적으로 판단합니다.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.48, duration: 0.45 }}
                  className="rounded-2xl bg-white/88 p-5 shadow-[0_16px_34px_-28px_rgba(37,99,235,0.35)] backdrop-blur-sm"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 text-white shadow-[0_10px_22px_-12px_rgba(59,130,246,0.6)]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900">내 수준에 맞는 자료</h3>
                  <p className="text-sm font-medium leading-relaxed text-gray-600">
                    시간 낭비 없이, 지금 나에게 가장 시급하고 도움이 되는 난이도의 문제들만 골라서 훈련합니다.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
