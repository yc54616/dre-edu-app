import * as crypto from 'crypto';
import { IConsultation, CONSULTATION_TYPE_LABEL } from './models/Consultation';

const SOLAPI_API_URL = 'https://api.solapi.com/messages/v4/send-many';

function getConfig() {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const senderPhone = process.env.SOLAPI_SENDER_PHONE;
  const pfId = process.env.SOLAPI_KAKAO_PF_ID;
  const templateApplicant = process.env.SOLAPI_TEMPLATE_ID_APPLICANT;
  const templateAdmin = process.env.SOLAPI_TEMPLATE_ID_ADMIN;
  const adminPhone = process.env.SOLAPI_ADMIN_PHONE;

  if (!apiKey || !apiSecret || !senderPhone || !pfId) {
    return null;
  }
  return { apiKey, apiSecret, senderPhone, pfId, templateApplicant, templateAdmin, adminPhone };
}

function makeAuthHeader(apiKey: string, apiSecret: string): string {
  const date = new Date().toISOString();
  const salt = crypto.randomUUID();
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(date + salt)
    .digest('hex');
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

interface AlimtalkMessage {
  to: string;
  from: string;
  kakaoOptions: {
    pfId: string;
    templateId: string;
    variables: Record<string, string>;
  };
}

async function sendAlimtalk(
  to: string,
  templateId: string,
  variables: Record<string, string>,
) {
  const config = getConfig();
  if (!config) {
    console.log('[알림톡] 환경변수 미설정 — 발송 스킵');
    return;
  }

  const message: AlimtalkMessage = {
    to: to.replace(/-/g, ''),
    from: config.senderPhone,
    kakaoOptions: {
      pfId: config.pfId,
      templateId,
      variables,
    },
  };

  const res = await fetch(SOLAPI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: makeAuthHeader(config.apiKey, config.apiSecret),
    },
    body: JSON.stringify({ messages: [message] }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Solapi ${res.status}: ${text}`);
  }

  const data = await res.json();
  console.log('[알림톡] 발송 성공:', JSON.stringify(data));
  return data;
}

export async function notifyConsultation(consultation: IConsultation) {
  const config = getConfig();
  if (!config) {
    console.log('[알림톡] 환경변수 미설정 — 알림톡 스킵');
    return;
  }

  const typeLabel = CONSULTATION_TYPE_LABEL[consultation.type] || consultation.type;
  const promises: Promise<unknown>[] = [];

  // 신청자 알림톡
  if (config.templateApplicant) {
    promises.push(
      sendAlimtalk(consultation.phone, config.templateApplicant, {
        '#{name}': consultation.name,
        '#{type}': typeLabel,
      }),
    );
  }

  // 관리자 알림톡
  if (config.templateAdmin && config.adminPhone) {
    promises.push(
      sendAlimtalk(config.adminPhone, config.templateAdmin, {
        '#{name}': consultation.name,
        '#{phone}': consultation.phone,
        '#{type}': typeLabel,
        '#{message}': consultation.message || '(없음)',
      }),
    );
  }

  await Promise.allSettled(promises);
}

export async function sendBrandMessage(
  recipients: { phone: string; name: string }[],
  message: string,
) {
  const config = getConfig();
  if (!config) {
    console.log('[브랜드메시지] 환경변수 미설정 — 발송 스킵');
    return null;
  }

  if (recipients.length === 0) {
    console.log('[브랜드메시지] 수신자 없음 — 발송 스킵');
    return null;
  }

  const fullMessage = `(광고) DRE수학학원\n${message}\n\n무료수신거부 0507-1346-1125`;

  const messages = recipients.map((r) => ({
    to: r.phone.replace(/-/g, ''),
    from: config.senderPhone,
    text: fullMessage,
    kakaoOptions: {
      pfId: config.pfId,
      bms: {
        targeting: 'I',
        chatBubbleType: 'TEXT',
      },
    },
  }));

  const res = await fetch(SOLAPI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: makeAuthHeader(config.apiKey, config.apiSecret),
    },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Solapi ${res.status}: ${text}`);
  }

  const data = await res.json();
  console.log('[브랜드메시지] 발송 결과:', JSON.stringify(data));
  return data;
}

export async function sendScheduleAlimtalk(
  phone: string,
  { name, date, time }: { name: string; date: string; time: string },
) {
  const config = getConfig();
  if (!config) {
    console.log('[일정 알림톡] 환경변수 미설정 — 발송 스킵');
    return;
  }

  const templateId = process.env.SOLAPI_TEMPLATE_ID_SCHEDULE;
  if (!templateId) {
    console.log('[일정 알림톡] SOLAPI_TEMPLATE_ID_SCHEDULE 미설정 — 발송 스킵');
    return;
  }

  return sendAlimtalk(phone, templateId, {
    '#{name}': name,
    '#{date}': date,
    '#{time}': time,
  });
}
