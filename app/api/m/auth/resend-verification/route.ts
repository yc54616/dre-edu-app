import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/mongoose';
import User from '@/lib/models/User';
import { createVerificationToken, sendVerificationEmail } from '@/lib/emailVerification';
import { getAppBaseUrl } from '@/lib/appUrl';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  await connectMongo();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  const payload = body as { email?: string };
  const email = (payload.email || '').toLowerCase().trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: '올바른 이메일 형식이 아닙니다.' }, { status: 400 });
  }

  const user = await User.findByEmail(email);
  if (!user) {
    // 계정 존재 여부 노출 방지
    return NextResponse.json({ ok: true, message: '인증이 필요한 계정이라면 메일이 발송되었습니다. 메일함을 확인해 주세요.' });
  }

  if (user.emailVerified !== false) {
    return NextResponse.json({ ok: true, message: '인증이 필요한 계정이라면 메일이 발송되었습니다. 메일함을 확인해 주세요.' });
  }

  const { token, tokenHash, expires } = createVerificationToken();
  user.verifyTokenHash = tokenHash;
  user.verifyTokenExpires = expires;
  await user.save();

  const baseUrl = getAppBaseUrl(req);
  const verifyUrl = `${baseUrl}/api/m/auth/verify-email?token=${encodeURIComponent(token)}&uid=${encodeURIComponent(String(user._id))}`;

  const mailResult = await sendVerificationEmail({
    to: user.email,
    username: user.username,
    verifyUrl,
  });

  if (!mailResult.ok) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: '인증 메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      emailSent: false,
      verifyUrl,
      warning: '메일 설정이 없어 개발 모드 수동 인증 링크를 반환했습니다.',
    });
  }

  return NextResponse.json({ ok: true, emailSent: true, message: '인증 메일을 다시 보냈습니다.' });
}
