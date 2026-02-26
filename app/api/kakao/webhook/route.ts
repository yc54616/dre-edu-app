import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/mongoose';
import Consultation, { ConsultationType } from '@/lib/models/Consultation';
import { notifyConsultation } from '@/lib/solapi';
import { KakaoSkillRequest, simpleTextResponse, errorResponse } from '@/lib/kakao-skill';

export const dynamic = 'force-dynamic';
const CHANNEL_MARKETING_CONSENT_VERSION = '2026-02-26-kakao-channel';

const ACTION_TYPE_MAP: Record<string, ConsultationType> = {
  submit_admission: 'admission',
  submit_consulting: 'consulting',
  submit_coaching: 'coaching',
  submit_teacher: 'teacher',
};

async function findScheduledConsultation(name: string, phone: string) {
  const cleaned = phone.replace(/-/g, '');
  const consultation =
    await Consultation.findOne({ name, phone: cleaned, status: 'scheduled' }).sort({ updatedAt: -1 }) ||
    await Consultation.findOne({ name, phone, status: 'scheduled' }).sort({ updatedAt: -1 });
  return consultation;
}

function markChannelMarketingConsent(consultation: {
  marketingConsent?: boolean;
  marketingConsentAt?: Date | null;
  marketingConsentVersion?: string | null;
}) {
  consultation.marketingConsent = true;
  if (!consultation.marketingConsentAt) {
    consultation.marketingConsentAt = new Date();
  }
  if (!consultation.marketingConsentVersion) {
    consultation.marketingConsentVersion = CHANNEL_MARKETING_CONSENT_VERSION;
  }
}

async function handleScheduleChange(params: Record<string, string>) {
  const name = (params.name || '').trim();
  const phone = (params.phone || '').trim();
  const message = (params.message || '').trim();

  if (!name || !phone) {
    return simpleTextResponse('이름과 연락처는 필수입니다. 다시 시도해주세요.');
  }

  await connectMongo();
  const consultation = await findScheduledConsultation(name, phone);

  if (!consultation) {
    return simpleTextResponse(
      `${name}님, 예정된 상담 일정을 찾을 수 없습니다.\n학원으로 직접 연락 부탁드립니다.`,
    );
  }

  consultation.scheduleChangeRequest = message || '일정 변경 요청';
  markChannelMarketingConsent(consultation);
  consultation.updatedAt = new Date();
  await consultation.save();

  return simpleTextResponse(
    `${name}님, 일정 변경 요청이 접수되었습니다.\n확인 후 연락드리겠습니다. 감사합니다.`,
  );
}

async function handleCancel(params: Record<string, string>) {
  const name = (params.name || '').trim();
  const phone = (params.phone || '').trim();
  const reason = (params.message || '').trim();

  if (!name || !phone) {
    return simpleTextResponse('이름과 연락처는 필수입니다. 다시 시도해주세요.');
  }

  await connectMongo();
  const consultation = await findScheduledConsultation(name, phone);

  if (!consultation) {
    return simpleTextResponse(
      `${name}님, 예정된 상담 일정을 찾을 수 없습니다.\n학원으로 직접 연락 부탁드립니다.`,
    );
  }

  consultation.scheduleChangeRequest = reason ? `취소 요청: ${reason}` : '취소 요청';
  markChannelMarketingConsent(consultation);
  consultation.updatedAt = new Date();
  await consultation.save();

  return simpleTextResponse(
    `${name}님, 상담 취소 요청이 접수되었습니다.\n확인 후 연락드리겠습니다. 감사합니다.`,
  );
}

export async function POST(req: NextRequest) {
  let body: KakaoSkillRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(errorResponse('잘못된 요청입니다.'));
  }

  const params = body.action?.params || {};
  // action_type 파라미터 우선, 없으면 action.name 폴백
  const actionType = params.action_type || body.action?.name || '';

  console.log(`[카카오 웹훅] action_type=${actionType}`, JSON.stringify(params));

  // 일정 변경 요청
  if (actionType === 'submit_schedule_change') {
    try {
      const response = await handleScheduleChange(params);
      return NextResponse.json(response);
    } catch (err) {
      console.error('[카카오 웹훅] 일정 변경 요청 실패:', err);
      return NextResponse.json(errorResponse());
    }
  }

  // 일정 확정 (학생이 확정)
  if (actionType === 'submit_schedule_confirm') {
    try {
      const name = (params.name || '').trim();
      const phone = (params.phone || '').trim();

      if (!name || !phone) {
        return NextResponse.json(
          simpleTextResponse('이름과 연락처는 필수입니다. 다시 시도해주세요.'),
        );
      }

      await connectMongo();
      const consultation = await findScheduledConsultation(name, phone);

      if (!consultation) {
        return NextResponse.json(
          simpleTextResponse(
            `${name}님, 예정된 상담 일정을 찾을 수 없습니다.\n학원으로 직접 연락 부탁드립니다.`,
          ),
        );
      }

      consultation.scheduleConfirmedAt = new Date();
      markChannelMarketingConsent(consultation);
      consultation.updatedAt = new Date();
      await consultation.save();

      return NextResponse.json(
        simpleTextResponse(
          `${name}님, 상담 일정이 확정되었습니다!\n\n■ 날짜: ${consultation.scheduledDate}\n■ 시간: ${consultation.scheduledTime}\n\n감사합니다.`,
        ),
      );
    } catch (err) {
      console.error('[카카오 웹훅] 일정 확정 실패:', err);
      return NextResponse.json(errorResponse());
    }
  }

  // 상담 취소 요청
  if (actionType === 'submit_cancel') {
    try {
      const response = await handleCancel(params);
      return NextResponse.json(response);
    } catch (err) {
      console.error('[카카오 웹훅] 취소 요청 실패:', err);
      return NextResponse.json(errorResponse());
    }
  }

  // 상담 신청
  const type = ACTION_TYPE_MAP[actionType];
  if (!type) {
    return NextResponse.json(errorResponse('알 수 없는 요청입니다.'));
  }

  const name = (params.name || '').trim();
  const phone = (params.phone || '').trim().replace(/\D/g, '');

  if (!name || !phone) {
    return NextResponse.json(
      simpleTextResponse('이름과 연락처는 필수입니다. 다시 시도해주세요.'),
    );
  }

  try {
    await connectMongo();

    const consultation = await Consultation.create({
      type,
      name,
      phone,
      marketingConsent: true,
      marketingConsentAt: new Date(),
      marketingConsentVersion: CHANNEL_MARKETING_CONSENT_VERSION,
      schoolGrade: (params.schoolGrade || '').trim(),
      currentScore: (params.currentScore || '').trim(),
      targetUniv: (params.targetUniv || '').trim(),
      direction: (params.direction || '').trim(),
      gradeLevel: (params.gradeLevel || '').trim(),
      subject: (params.subject || '').trim(),
      message: (params.message || '').trim(),
    });

    // 알림톡 fire-and-forget
    notifyConsultation(consultation).catch((err) =>
      console.error('[카카오 웹훅] 알림톡 발송 실패:', err),
    );

    return NextResponse.json(
      simpleTextResponse(
        `${name}님, 상담 신청이 접수되었습니다!\n빠른 시간 내에 연락드리겠습니다. 감사합니다.`,
      ),
    );
  } catch (err) {
    console.error('[카카오 웹훅] DB 저장 실패:', err);
    return NextResponse.json(errorResponse());
  }
}
