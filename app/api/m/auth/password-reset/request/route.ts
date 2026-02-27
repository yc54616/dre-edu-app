import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongoose';
import User from '@/lib/models/User';
import { createPasswordResetToken, sendPasswordResetEmail } from '@/lib/passwordReset';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: '이메일을 입력해 주세요.' }, { status: 400 });
        }

        await connectMongo();

        const user = await User.findByEmail(email.toLowerCase());

        // 보안: 유저가 존재하지 않더라도 "이메일을 확인하세요" 라는 동일한 성공 메시지를 보내 이메일 열거 공격 방지
        if (!user) {
            return NextResponse.json({ message: '비밀번호 재설정 이메일을 발송했습니다. 메일함을 확인해 주세요.' });
        }

        const { token, tokenHash, expires } = createPasswordResetToken();

        user.resetTokenHash = tokenHash;
        user.resetTokenExpires = expires;
        await user.save();

        const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/m/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

        const { ok, reason } = await sendPasswordResetEmail({
            to: user.email,
            username: user.username,
            resetUrl,
        });

        if (!ok) {
            // 메일 전송 실패 시 토큰 롤백 처리
            user.resetTokenHash = null;
            user.resetTokenExpires = null;
            await user.save();

            console.error('[password-reset-request] Email sending failed:', reason);
            return NextResponse.json({ error: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 500 });
        }

        // 개발 모드에서는 디버깅을 위해 URL을 반환 (실제 프로덕션 환경에서는 URL 제거 추천)
        const isDev = process.env.NODE_ENV === 'development';

        return NextResponse.json({
            message: '비밀번호 재설정 이메일을 발송했습니다. 메일함을 확인해 주세요.',
            resetUrl: isDev ? resetUrl : undefined
        });

    } catch (error) {
        console.error('[password-reset-request] Failed:', error);
        return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
    }
}
