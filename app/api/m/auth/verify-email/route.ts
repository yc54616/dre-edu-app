import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/mongoose';
import User from '@/lib/models/User';
import { hashVerificationToken } from '@/lib/emailVerification';
import { buildAppUrl } from '@/lib/appUrl';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || '';
  const uid = req.nextUrl.searchParams.get('uid') || '';
  if (!token) {
    return NextResponse.redirect(buildAppUrl(req, '/m?verify=invalid'));
  }

  await connectMongo();
  const tokenHash = hashVerificationToken(token);

  const buildSuccessRedirect = (verifiedUser: {
    role?: string;
    teacherApprovalStatus?: string;
  }) => {
    const redirectUrl = buildAppUrl(req, '/m?verify=success');
    if (verifiedUser.role === 'teacher' && verifiedUser.teacherApprovalStatus === 'pending') {
      redirectUrl.searchParams.set('approval', 'pending');
    }
    return redirectUrl;
  };

  const user = await User.findOne({ verifyTokenHash: tokenHash });
  if (!user && uid) {
    const fallbackUser = await User.findById(uid).select('role teacherApprovalStatus emailVerified');
    if (fallbackUser?.emailVerified) {
      return NextResponse.redirect(buildSuccessRedirect(fallbackUser));
    }
  }

  if (!user) {
    return NextResponse.redirect(buildAppUrl(req, '/m?verify=invalid'));
  }

  if (!user.verifyTokenExpires || user.verifyTokenExpires.getTime() < Date.now()) {
    // 이미 인증된 계정이면 만료 링크를 눌러도 성공 화면으로 안내한다.
    if (user.emailVerified) {
      user.verifyTokenHash = null;
      user.verifyTokenExpires = null;
      await user.save();
      return NextResponse.redirect(buildSuccessRedirect(user));
    }

    user.verifyTokenHash = null;
    user.verifyTokenExpires = null;
    await user.save();
    return NextResponse.redirect(buildAppUrl(req, '/m?verify=expired'));
  }

  // 메일 보안 스캐너/중복 클릭을 고려해, 유효기간 내 재클릭이 가능하도록 토큰은 유지한다.
  if (!user.emailVerified) {
    user.emailVerified = true;
    await user.save();
  }

  return NextResponse.redirect(buildSuccessRedirect(user));
}
