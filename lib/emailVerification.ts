import crypto from 'crypto';

const VERIFY_TTL_MS = 1000 * 60 * 60 * 4; // 4h

export function hashVerificationToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function createVerificationToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashVerificationToken(token);
  const expires = new Date(Date.now() + VERIFY_TTL_MS);
  return { token, tokenHash, expires };
}

function buildVerificationEmailHtml(verifyUrl: string, username: string) {
  return `
  <div style="font-family:Arial,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;max-width:560px;margin:0 auto;padding:20px;color:#111827;">
    <p style="margin:0 0 10px 0;font-size:16px;font-weight:700;">DRE M 이메일 인증</p>
    <p style="margin:0 0 10px 0;line-height:1.6;">안녕하세요, ${username}님.</p>
    <p style="margin:0 0 12px 0;line-height:1.6;">아래 링크를 열어 이메일 인증을 완료해 주세요.</p>
    <p style="margin:0 0 12px 0;word-break:break-all;">
      <a href="${verifyUrl}" style="color:#2563eb;text-decoration:underline;">${verifyUrl}</a>
    </p>
    <p style="margin:0;color:#6b7280;font-size:12px;">이 링크는 4시간 동안 유효합니다.</p>
  </div>
  `;
}

function buildVerificationEmailText(verifyUrl: string, username: string) {
  return [
    `안녕하세요, ${username}님.`,
    '',
    '아래 링크를 열어 DRE M 이메일 인증을 완료해 주세요.',
    verifyUrl,
    '',
    '이 링크는 4시간 동안 유효합니다.',
  ].join('\n');
}

export async function sendVerificationEmail(params: {
  to: string;
  username: string;
  verifyUrl: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return { ok: false, reason: 'EMAIL_PROVIDER_NOT_CONFIGURED' };
  }

  const subject = '[DRE M] 이메일 인증';
  const html = buildVerificationEmailHtml(params.verifyUrl, params.username);
  const text = buildVerificationEmailText(params.verifyUrl, params.username);

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [params.to],
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('[emailVerification] resend error:', res.status, detail);
      return { ok: false, reason: 'EMAIL_SEND_FAILED' };
    }

    return { ok: true };
  } catch (error) {
    console.error('[emailVerification] send exception:', error);
    return { ok: false, reason: 'EMAIL_SEND_EXCEPTION' };
  }
}
