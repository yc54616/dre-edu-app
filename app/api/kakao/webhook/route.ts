import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/lib/mongoose';
import Consultation, { ConsultationType, CONSULTATION_TYPE_LABEL } from '@/lib/models/Consultation';
import { notifyConsultation } from '@/lib/solapi';
import {
  KakaoSkillRequest,
  simpleTextResponse,
  simpleTextWithQuickReplies,
  errorResponse,
} from '@/lib/kakao-skill';

export const dynamic = 'force-dynamic';
const CHANNEL_MARKETING_CONSENT_VERSION = '2026-02-26-kakao-channel';

const ACTION_TYPE_MAP: Record<string, ConsultationType> = {
  submit_admission: 'admission',
  submit_consulting: 'consulting',
  submit_coaching: 'coaching',
  submit_teacher: 'teacher',
};

const CONSULT_TYPE_QUICK_REPLIES: Array<{ label: string; messageText: string }> = [
  { label: '입학 안내', messageText: '입학안내' },
  { label: '입시컨설팅', messageText: '입시컨설팅' },
  { label: '온라인수학코칭', messageText: '온라인수학코칭' },
  { label: '수업설계컨설팅', messageText: '수업설계컨설팅' },
];

function detectConsultationTypeFromUtterance(rawUtterance: string): ConsultationType | null {
  const normalized = rawUtterance.trim().replace(/\s+/g, '').toLowerCase();
  if (!normalized) return null;

  if (normalized.includes('수업설계')) return 'teacher';
  if (normalized.includes('온라인') || normalized.includes('코칭')) return 'coaching';
  if (normalized.includes('입학')) return 'admission';
  if (normalized.includes('입시')) return 'consulting';

  return null;
}

function consultationSwitchGuideText(currentType: ConsultationType, requestedType?: ConsultationType): string {
  const currentLabel = CONSULTATION_TYPE_LABEL[currentType];
  if (requestedType && requestedType !== currentType) {
    return [
      `현재는 "${currentLabel}" 상담 흐름입니다.`,
      `중간에 "${CONSULTATION_TYPE_LABEL[requestedType]}"로 바꾸시려면 아래 버튼에서 다시 시작해주세요.`,
      '같은 흐름을 계속 진행하려면 이름과 연락처를 입력해주세요.',
    ].join('\n');
  }

  return [
    `현재는 "${currentLabel}" 상담 흐름입니다.`,
    '이 단계에서는 이름과 연락처를 입력해야 합니다.',
    '다른 상담으로 바꾸려면 아래 버튼에서 다시 시작해주세요.',
  ].join('\n');
}

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
  const utterance = body.userRequest?.utterance || '';

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
    return NextResponse.json(
      simpleTextWithQuickReplies(
        '요청을 이해하지 못했습니다. 아래 상담 유형에서 다시 시작해주세요.',
        CONSULT_TYPE_QUICK_REPLIES,
      ),
    );
  }

  const name = (params.name || '').trim();
  const phone = (params.phone || '').trim().replace(/\D/g, '');

  if (!name || !phone) {
    const requestedType = detectConsultationTypeFromUtterance(utterance);
    return NextResponse.json(
      simpleTextWithQuickReplies(
        consultationSwitchGuideText(type, requestedType || undefined),
        CONSULT_TYPE_QUICK_REPLIES,
      ),
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
