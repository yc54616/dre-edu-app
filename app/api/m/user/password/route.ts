import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    await connectMongo();
    const user = await User.findByEmail(session.user.email);
    if (!user) {
        return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    let body;
    try {
        body = await req.json();
    } catch (err) {
        return NextResponse.json({ error: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
    }

    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: '기존 비밀번호와 새 비밀번호를 모두 입력해주세요.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
        return NextResponse.json({ error: '새 비밀번호는 6자 이상이어야 합니다.' }, { status: 400 });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return NextResponse.json({ error: '기존 비밀번호가 일치하지 않습니다.' }, { status: 400 });
    }

    user.password = newPassword;
    await user.save();

    return NextResponse.json({ success: true });
}
