import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    await connectMongo();
    const user = await User.findByEmail(session.user.email);
    if (!user) {
        return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({
        email: user.email,
        username: user.username,
        phone: user.phone || '',
        birthDate: user.birthDate ? user.birthDate.toISOString().split('T')[0] : '',
        role: user.role,
        agreeMarketing: !!user.consents?.marketing,
        isUnder14AtSignup: user.isUnder14AtSignup || false,
        guardianName: user.legalGuardianConsent?.guardianName || '',
        guardianContact: user.legalGuardianConsent?.guardianContact || '',
    });
}

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

    const payload = body as {
        phone?: string;
        agreeMarketing?: boolean;
        guardianName?: string;
        guardianContact?: string;
    };

    const phoneDigits = (payload.phone || '').replace(/\D/g, '');
    const agreeMarketing = payload.agreeMarketing === true;
    const guardianName = (payload.guardianName || '').trim();
    const guardianContact = (payload.guardianContact || '').trim();

    const hasPhoneInput = phoneDigits.length > 0;
    const isValidPhone = /^01[016789]\d{7,8}$/.test(phoneDigits);

    if (hasPhoneInput && !isValidPhone) {
        return NextResponse.json({ error: '올바른 연락처 형식이 아닙니다.' }, { status: 400 });
    }

    if (agreeMarketing && !isValidPhone) {
        return NextResponse.json(
            { error: '혜택/이벤트 정보 수신 동의 시 연락처(휴대전화) 입력이 필요합니다.' },
            { status: 400 }
        );
    }

    if (user.isUnder14AtSignup) {
        if (!guardianName || !guardianContact) {
            return NextResponse.json(
                { error: '만 14세 미만 가입자는 법정대리인 정보를 입력해야 합니다.' },
                { status: 400 }
            );
        }
    }

    user.phone = hasPhoneInput ? phoneDigits : null;

    if (!user.consents) {
        user.consents = {};
    }

    if (agreeMarketing) {
        if (!user.consents.marketing) {
            user.consents.marketing = {
                agreedAt: new Date(),
                version: '2026-02-26',
            };
        }
    } else {
        // @ts-ignore
        user.consents.marketing = undefined;
    }

    if (user.isUnder14AtSignup) {
        if (!user.legalGuardianConsent) {
            user.legalGuardianConsent = {
                agreedAt: new Date(),
                guardianName,
                guardianContact,
            };
        } else {
            user.legalGuardianConsent.guardianName = guardianName;
            user.legalGuardianConsent.guardianContact = guardianContact;
        }
    }

    await user.save();

    return NextResponse.json({ success: true });
}
