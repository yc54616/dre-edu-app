import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import User from '@/lib/models/User';
import Consultation from '@/lib/models/Consultation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!session || role !== 'admin') {
        return NextResponse.json({ error: '관리자만 접근할 수 있습니다.' }, { status: 403 });
    }

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
    }

    const rawPhones = Array.isArray(body.phones) ? (body.phones as string[]) : [];
    const phones = rawPhones
        .map((p) => (typeof p === 'string' ? p.replace(/\D/g, '') : ''))
        .filter((p) => p.length > 0);

    if (phones.length === 0) {
        return NextResponse.json({ error: '해제할 대상(연락처)이 없습니다.' }, { status: 400 });
    }

    try {
        await connectMongo();

        // 1. User 모델 업데이트
        const userUpdateRes = await User.updateMany(
            { phone: { $in: phones } },
            { $unset: { 'consents.marketing': 1 } }
        );

        // 2. Consultation 모델 업데이트
        const consultUpdateRes = await Consultation.updateMany(
            { phone: { $in: phones } },
            {
                $set: {
                    marketingConsent: false,
                    marketingConsentAt: null,
                    marketingConsentVersion: null
                }
            }
        );

        return NextResponse.json({
            success: true,
            message: `${userUpdateRes.modifiedCount + consultUpdateRes.modifiedCount}건의 마케팅 동의가 해제되었습니다.`
        });
    } catch (err) {
        console.error('[마케팅 동의 해제 에러]', err);
        return NextResponse.json({ error: 'DB 업데이트 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
