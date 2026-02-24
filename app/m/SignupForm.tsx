'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, Mail, Lock, ChevronRight, CheckCircle2, CalendarDays } from 'lucide-react';
import PolicyLinks from '@/components/m/PolicyLinks';

const MINOR_AGE = 14;

export default function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    email: '',
    birthDate: '',
    password: '',
    confirmPassword: '',
    userRole: 'student',
    agreeTerms: false,
    agreePrivacy: false,
    guardianName: '',
    guardianContact: '',
    agreeLegalGuardian: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugVerifyUrl, setDebugVerifyUrl] = useState('');
  const todayDate = getTodayDateInputValue();
  const age = getAgeFromBirthDate(form.birthDate);
  const isUnder14 = age !== null && age < MINOR_AGE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setDebugVerifyUrl('');

    const normalizedUsername = form.username.trim();
    const normalizedEmail = form.email.trim().toLowerCase();

    if (!normalizedUsername) {
      setError('이름을 입력해 주세요.');
      return;
    }

    if (!form.birthDate) {
      setError('생년월일을 입력해 주세요.');
      return;
    }

    if (age === null) {
      setError('올바른 생년월일을 입력해 주세요.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (isUnder14) {
      if (!form.guardianName.trim() || !form.guardianContact.trim()) {
        setError('만 14세 미만 가입은 법정대리인 정보를 입력해 주세요.');
        return;
      }

      if (!form.agreeLegalGuardian) {
        setError('만 14세 미만 가입은 법정대리인 동의가 필요합니다.');
        return;
      }
    }

    if (!form.agreeTerms || !form.agreePrivacy) {
      setError('이용약관 및 개인정보처리방침에 동의해 주세요.');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/m/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: normalizedUsername,
        email: normalizedEmail,
        birthDate: form.birthDate,
        password: form.password,
        userRole: form.userRole,
        agreeTerms: form.agreeTerms,
        agreePrivacy: form.agreePrivacy,
        guardianName: isUnder14 ? form.guardianName.trim() : '',
        guardianContact: isUnder14 ? form.guardianContact.trim() : '',
        agreeLegalGuardian: isUnder14 ? form.agreeLegalGuardian : false,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      setError(data.error || '회원가입에 실패했습니다.');
      return;
    }

    const needsTeacherApproval = data.requiresTeacherApproval === true;
    setLoading(false);
    if (data.emailSent) {
      setSuccess(
        needsTeacherApproval
          ? '회원가입이 완료되었습니다. 이메일 인증 후 관리자 승인 완료 시 로그인할 수 있습니다.'
          : '회원가입이 완료되었습니다. 인증 메일을 확인해 계정을 활성화해 주세요.',
      );
    } else {
      setSuccess(
        needsTeacherApproval
          ? '회원가입이 완료되었습니다. 개발 모드 인증 후 관리자 승인 완료 시 로그인할 수 있습니다.'
          : '회원가입이 완료되었습니다. 개발 모드 인증 링크를 사용해 계정을 활성화해 주세요.',
      );
      if (typeof data.verifyUrl === 'string') setDebugVerifyUrl(data.verifyUrl);
    }

    setForm({
      username: '',
      email: '',
      birthDate: '',
      password: '',
      confirmPassword: '',
      userRole: 'student',
      agreeTerms: false,
      agreePrivacy: false,
      guardianName: '',
      guardianContact: '',
      agreeLegalGuardian: false,
    });
    router.refresh();
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_8%_0%,rgba(59,130,246,0.05),transparent_44%),radial-gradient(ellipse_at_92%_86%,rgba(125,211,252,0.05),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#fbfdff_0%,#ffffff_42%,#ffffff_100%)]" />

      <div className="relative w-full">
        <div className="grid min-h-screen items-stretch xl:grid-cols-[minmax(560px,640px)_minmax(0,1fr)]">
          <div className="flex min-h-screen w-full flex-col justify-center px-5 py-8 sm:px-8 md:px-10 xl:px-14 2xl:px-16">
            <div className="mx-auto w-full max-w-[560px] xl:mx-0 xl:max-w-none">
              <Link href="/" className="group mb-8 inline-flex w-max items-center gap-3">
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

              <div className="w-full rounded-3xl bg-white/95 p-6 shadow-[0_20px_48px_-36px_rgba(37,99,235,0.35)] sm:p-8">
                <div className="mb-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-500">Join DRE M</p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900">회원가입</h1>
                  <p className="mt-2 text-sm font-medium text-gray-500">
                    사용자 계정을 직접 만들고 바로 DRE M을 시작하세요.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="역할">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, userRole: 'student' }))}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors ${
                    form.userRole === 'student'
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-blue-100 hover:text-blue-600'
                  }`}
                >
                  학생
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, userRole: 'teacher' }))}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors ${
                    form.userRole === 'teacher'
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-blue-100 hover:text-blue-600'
                  }`}
                >
                  교사
                </button>
              </div>
            </Field>

            <Field label="이름">
              <Input
                icon={<User size={17} />}
                type="text"
                value={form.username}
                onChange={(value) => setForm((prev) => ({ ...prev, username: value }))}
                placeholder="이름을 입력하세요"
                required
                minLength={2}
                maxLength={20}
              />
            </Field>

            <Field label="이메일">
              <Input
                icon={<Mail size={17} />}
                type="email"
                value={form.email}
                onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
                placeholder="name@example.com"
                required
              />
            </Field>

            <Field label="생년월일">
              <Input
                icon={<CalendarDays size={17} />}
                type="date"
                value={form.birthDate}
                onChange={(value) => setForm((prev) => ({ ...prev, birthDate: value }))}
                required
                max={todayDate}
              />
              <p className="ml-1 text-xs font-medium text-gray-500">
                만 14세 미만은 법정대리인 동의가 필요합니다.
              </p>
            </Field>

            <Field label="비밀번호">
              <Input
                icon={<Lock size={17} />}
                type="password"
                value={form.password}
                onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
                placeholder="6자 이상 입력하세요"
                required
                minLength={6}
              />
            </Field>

            <Field label="비밀번호 확인">
              <Input
                icon={<Lock size={17} />}
                type="password"
                value={form.confirmPassword}
                onChange={(value) => setForm((prev) => ({ ...prev, confirmPassword: value }))}
                placeholder="비밀번호를 다시 입력하세요"
                required
                minLength={6}
              />
            </Field>

            {isUnder14 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3">
                <p className="mb-3 text-xs font-bold tracking-wide text-amber-700">
                  만 14세 미만 법정대리인 동의
                </p>
                <div className="space-y-3">
                  <Field label="법정대리인 성명">
                    <Input
                      icon={<User size={17} />}
                      type="text"
                      value={form.guardianName}
                      onChange={(value) => setForm((prev) => ({ ...prev, guardianName: value }))}
                      placeholder="법정대리인 성명을 입력하세요"
                      required={isUnder14}
                    />
                  </Field>
                  <Field label="법정대리인 연락처">
                    <Input
                      icon={<Mail size={17} />}
                      type="text"
                      value={form.guardianContact}
                      onChange={(value) => setForm((prev) => ({ ...prev, guardianContact: value }))}
                      placeholder="휴대전화 또는 이메일"
                      required={isUnder14}
                    />
                  </Field>
                  <label className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                    <input
                      type="checkbox"
                      checked={form.agreeLegalGuardian}
                      onChange={(e) => setForm((prev) => ({ ...prev, agreeLegalGuardian: e.target.checked }))}
                      className="h-4 w-4 rounded border-amber-300 text-[var(--color-dre-blue)] focus:ring-blue-200"
                    />
                    [필수] 법정대리인 동의를 받았습니다.
                  </label>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="mb-2 text-xs font-bold tracking-wide text-gray-500">필수 동의</p>
              <div className="space-y-2">
                <AgreementCheck
                  checked={form.agreeTerms}
                  onChange={(checked) => setForm((prev) => ({ ...prev, agreeTerms: checked }))}
                  label="이용약관 동의"
                  href="/policy/terms"
                />
                <AgreementCheck
                  checked={form.agreePrivacy}
                  onChange={(checked) => setForm((prev) => ({ ...prev, agreePrivacy: checked }))}
                  label="개인정보처리방침 동의"
                  href="/policy/privacy"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={16} className="shrink-0" />
                {success}
              </div>
            )}

            {debugVerifyUrl && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                <p className="font-semibold mb-1">개발 모드 인증 링크</p>
                <a href={debugVerifyUrl} className="underline break-all">
                  {debugVerifyUrl}
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-dre-blue)] py-3.5 text-[15px] font-bold tracking-wide text-white shadow-[0_12px_24px_-12px_rgba(37,99,235,0.52)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-dre-blue-dark)] hover:shadow-[0_16px_28px_-12px_rgba(37,99,235,0.58)] disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none"
            >
              <span>{loading ? '가입 중...' : '회원가입'}</span>
              {!loading && <ChevronRight size={18} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />}
            </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                  이미 계정이 있나요?{' '}
                  <Link href="/m" className="font-bold text-blue-600 hover:text-blue-700">
                    로그인
                  </Link>
                </div>
                <div className="mt-4 flex justify-center">
                  <PolicyLinks />
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f9fcff_0%,#f4f8ff_52%,#fbfdff_100%)] xl:flex">
            <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-14 h-64 w-64 rounded-full bg-sky-100/60 blur-3xl" />

            <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col justify-center px-10 py-14 xl:px-16">
              <div className="mb-6 inline-flex w-max items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs font-bold tracking-wider text-blue-700">WELCOME TO DRE M</span>
              </div>

              <h2 className="mb-5 text-[2.35rem] font-black leading-[1.17] tracking-tight text-gray-900 xl:text-[3.05rem]">
                시작을 제대로 잡으면,
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  성장 속도가 달라집니다.
                </span>
              </h2>
              <p className="mb-8 max-w-2xl text-lg font-medium leading-relaxed text-gray-600">
                가입 후 이메일 인증을 완료하면, 현재 실력에 맞는 학습 자료와 추천 기능을 바로 이용할 수 있습니다.
              </p>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl bg-white/88 p-5 shadow-[0_16px_34px_-28px_rgba(37,99,235,0.35)] backdrop-blur-sm">
                  <p className="text-base font-bold text-gray-900">빠른 시작</p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-gray-600">
                    계정 생성과 인증을 마치면 즉시 자료 탐색과 추천을 사용할 수 있습니다.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/88 p-5 shadow-[0_16px_34px_-28px_rgba(37,99,235,0.35)] backdrop-blur-sm">
                  <p className="text-base font-bold text-gray-900">안전한 가입</p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-gray-600">
                    필수 약관 동의와 이메일 인증, 미성년자 법정대리인 동의 흐름을 제공합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="ml-1 block text-sm font-bold text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function Input({
  icon,
  value,
  onChange,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="group relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 transition-colors group-focus-within:text-[var(--color-dre-blue)]">
        {icon}
      </div>
      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-transparent bg-[#f3f7ff] py-3.5 pl-11 pr-4 text-[15px] font-semibold text-gray-900 shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-blue-100 focus:bg-white focus:ring-[3px] focus:ring-blue-100"
      />
    </div>
  );
}

function AgreementCheck({
  checked,
  onChange,
  label,
  href,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  href: string;
}) {
  return (
    <div className="flex flex-col items-start gap-1.5 text-sm sm:flex-row sm:items-center sm:justify-between">
      <label className="flex items-center gap-2 text-gray-700">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-[var(--color-dre-blue)] focus:ring-blue-200"
        />
        <span className="font-semibold">[필수] {label}</span>
      </label>
      <Link href={href} target="_blank" className="font-bold text-blue-600 hover:text-blue-700">
        보기
      </Link>
    </div>
  );
}

function getTodayDateInputValue() {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, '0');
  const d = `${now.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getAgeFromBirthDate(raw: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const [yearStr, monthStr, dayStr] = raw.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const birth = new Date(year, month - 1, day);

  if (
    Number.isNaN(birth.getTime()) ||
    birth.getFullYear() !== year ||
    birth.getMonth() !== month - 1 ||
    birth.getDate() !== day
  ) {
    return null;
  }

  const now = new Date();
  let age = now.getFullYear() - year;
  if (now.getMonth() + 1 < month || (now.getMonth() + 1 === month && now.getDate() < day)) {
    age -= 1;
  }

  if (age < 0 || age > 120) return null;
  return age;
}
