import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongoose';
import User from '@/lib/models/User';
import { hashPasswordResetToken } from '@/lib/passwordReset';

export async function POST(req: Request) {
    try {
        const { email, token, newPassword } = await req.json();

        if (!email || !token || !newPassword) {
            return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
        }
        if (newPassword.length < 8) {
            return NextResponse.json({ error: '비밀번호는 8자 이상이어야 합니다.' }, { status: 400 });
        }

        await connectMongo();

        const user = await User.findByEmail(email.toLowerCase());

        if (!user) {
            return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
        }

        if (!user.resetTokenHash || !user.resetTokenExpires) {
            return NextResponse.json({ error: '유효하지 않은 재설정 링크입니다.' }, { status: 400 });
        }

        if (Date.now() > user.resetTokenExpires.getTime()) {
            return NextResponse.json({ error: '만료된 재설정 링크입니다. 다시 요청해 주세요.' }, { status: 400 });
        }

        const incomingHash = hashPasswordResetToken(token);
        if (incomingHash !== user.resetTokenHash) {
            return NextResponse.json({ error: '잘못된 재설정 링크입니다.' }, { status: 400 });
        }

        // 새 비밀번호 설정 및 토큰 초기화
        // (user.save() 과정에서 pre-save 훅에 의해 자동 bcrypt 해싱 처리됨, LoginForm/회원가입 로직 참조)
        user.password = newPassword;
        user.resetTokenHash = null;
        user.resetTokenExpires = null;
        await user.save();

        return NextResponse.json({ message: '비밀번호가 성공적으로 재설정되었습니다.' });

    } catch (error) {
        console.error('[password-reset-confirm] Failed:', error);
        return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
    }
}
