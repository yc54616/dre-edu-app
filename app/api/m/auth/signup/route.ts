import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/mongoose';
import User from '@/lib/models/User';
import { createVerificationToken, sendVerificationEmail } from '@/lib/emailVerification';
import { getAppBaseUrl } from '@/lib/appUrl';

export const dynamic = 'force-dynamic';
const TERMS_VERSION = '2026-02-26';
const PRIVACY_VERSION = '2026-02-26';
const MINOR_AGE = 14;

function parseBirthDate(raw: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const [yearStr, monthStr, dayStr] = raw.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function getAgeFromBirthDate(birthDate: Date): number {
  const now = new Date();
  let age = now.getUTCFullYear() - birthDate.getUTCFullYear();
  if (
    now.getUTCMonth() < birthDate.getUTCMonth() ||
    (now.getUTCMonth() === birthDate.getUTCMonth() && now.getUTCDate() < birthDate.getUTCDate())
  ) {
    age -= 1;
  }
  return age;
}

// POST /api/m/auth/signup — 일반 사용자 회원가입 (student/teacher)
export async function POST(req: NextRequest) {
  await connectMongo();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const payload = body as {
    email?: string;
    username?: string;
    password?: string;
    birthDate?: string;
    userRole?: string;
    agreeTerms?: boolean;
    agreePrivacy?: boolean;
    guardianName?: string;
    guardianContact?: string;
    agreeLegalGuardian?: boolean;
  };

  const email = (payload.email || '').toLowerCase().trim();
  const username = (payload.username || '').trim();
  const password = payload.password || '';
  const birthDateRaw = (payload.birthDate || '').trim();
  const userRole = payload.userRole || 'student';
  const agreeTerms = payload.agreeTerms === true;
  const agreePrivacy = payload.agreePrivacy === true;
  const guardianName = (payload.guardianName || '').trim();
  const guardianContact = (payload.guardianContact || '').trim();
  const agreeLegalGuardian = payload.agreeLegalGuardian === true;

  if (!email || !username || !password || !birthDateRaw) {
    return NextResponse.json({ error: '이메일, 이름, 생년월일, 비밀번호는 필수입니다.' }, { status: 400 });
  }

  if (!agreeTerms || !agreePrivacy) {
    return NextResponse.json(
      { error: '이용약관 및 개인정보처리방침 동의가 필요합니다.' },
      { status: 400 },
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: '올바른 이메일 형식이 아닙니다.' }, { status: 400 });
  }

  if (username.length < 2 || username.length > 20) {
    return NextResponse.json({ error: '이름은 2자 이상 20자 이하여야 합니다.' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400 });
  }

  const birthDate = parseBirthDate(birthDateRaw);
  if (!birthDate) {
    return NextResponse.json({ error: '올바른 생년월일 형식이 아닙니다.' }, { status: 400 });
  }

  const age = getAgeFromBirthDate(birthDate);
  if (age < 0 || age > 120) {
    return NextResponse.json({ error: '올바른 생년월일을 입력해 주세요.' }, { status: 400 });
  }

  const isUnder14 = age < MINOR_AGE;
  if (isUnder14) {
    if (!guardianName || !guardianContact) {
      return NextResponse.json(
        { error: '만 14세 미만 가입은 법정대리인 정보를 입력해야 합니다.' },
        { status: 400 },
      );
    }
    if (!agreeLegalGuardian) {
      return NextResponse.json(
        { error: '만 14세 미만 가입은 법정대리인 동의가 필요합니다.' },
        { status: 400 },
      );
    }
  }

  const allowedRoles = ['student', 'teacher'] as const;
  if (!allowedRoles.includes(userRole as (typeof allowedRoles)[number])) {
    return NextResponse.json({ error: '가입 가능한 역할이 아닙니다.' }, { status: 400 });
  }

  const existing = await User.findByEmail(email);
  if (existing) {
    return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 409 });
  }

  const { token, tokenHash, expires } = createVerificationToken();
  const baseUrl = getAppBaseUrl(req);
  const consentAt = new Date();

  const user = await User.create({
    email,
    username,
    password,
    role: userRole,
    teacherApprovalStatus: userRole === 'teacher' ? 'pending' : 'approved',
    emailVerified: false,
    verifyTokenHash: tokenHash,
    verifyTokenExpires: expires,
    birthDate,
    isUnder14AtSignup: isUnder14,
    legalGuardianConsent: isUnder14
      ? {
          agreedAt: consentAt,
          guardianName,
          guardianContact,
        }
      : null,
    consents: {
      terms: { agreedAt: consentAt, version: TERMS_VERSION },
      privacy: { agreedAt: consentAt, version: PRIVACY_VERSION },
    },
  });
  const verifyUrl = `${baseUrl}/api/m/auth/verify-email?token=${encodeURIComponent(token)}&uid=${encodeURIComponent(String(user._id))}`;

  const mailResult = await sendVerificationEmail({
    to: user.email,
    username: user.username,
    verifyUrl,
  });

  if (!mailResult.ok) {
    // 운영 환경에서는 메일 발송 실패 시 계정을 되돌린다.
    if (process.env.NODE_ENV === 'production') {
      await User.deleteOne({ _id: user._id });
      return NextResponse.json(
        { error: '인증 메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.' },
        { status: 500 },
      );
    }

    // 개발 환경에서는 수동 검증을 위해 링크를 응답에 포함한다.
    return NextResponse.json(
      {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        requiresEmailVerification: true,
        emailSent: false,
        requiresTeacherApproval: userRole === 'teacher',
        verifyUrl,
        warning: '메일 설정이 없어 개발 모드 수동 인증 링크를 반환했습니다.',
      },
      { status: 201 },
    );
  }

  return NextResponse.json(
    {
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      requiresEmailVerification: true,
      emailSent: true,
      requiresTeacherApproval: userRole === 'teacher',
    },
    { status: 201 },
  );
}
