import crypto from 'crypto';

const RESET_TTL_MS = 1000 * 60 * 60 * 1; // 1시간 (비밀번호 재설정은 좀 더 짧게 유지)

export function hashPasswordResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

export function createPasswordResetToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashPasswordResetToken(token);
    const expires = new Date(Date.now() + RESET_TTL_MS);
    return { token, tokenHash, expires };
}

function buildPasswordResetEmailHtml(resetUrl: string, username: string) {
    return `
  <div style="font-family:Arial,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;max-width:560px;margin:0 auto;padding:20px;color:#111827;">
    <p style="margin:0 0 10px 0;font-size:16px;font-weight:700;">DRE M 비밀번호 재설정</p>
    <p style="margin:0 0 10px 0;line-height:1.6;">안녕하세요, ${username}님.</p>
    <p style="margin:0 0 12px 0;line-height:1.6;">비밀번호 재설정 요청이 접수되었습니다. 아래 링크를 열어 새 비밀번호를 설정해 주세요.</p>
    <p style="margin:0 0 12px 0;word-break:break-all;">
      <a href="${resetUrl}" style="color:#2563eb;text-decoration:underline;">${resetUrl}</a>
    </p>
    <p style="margin:0;color:#6b7280;font-size:12px;">이 링크는 1시간 동안만 유효합니다. 직접 요청하지 않으셨다면 이 메일을 무시하셔도 됩니다.</p>
  </div>
  `;
}

function buildPasswordResetEmailText(resetUrl: string, username: string) {
    return [
        `안녕하세요, ${username}님.`,
        '',
        '비밀번호 재설정 요청이 접수되었습니다.',
        '아래 링크를 열어 DRE M 새 비밀번호를 설정해 주세요.',
        resetUrl,
        '',
        '이 링크는 1시간 동안만 유효합니다. 직접 요청하지 않으셨다면 이 메일을 무시하셔도 됩니다.',
    ].join('\n');
}

export async function sendPasswordResetEmail(params: {
    to: string;
    username: string;
    resetUrl: string;
}): Promise<{ ok: boolean; reason?: string }> {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !fromEmail) {
        return { ok: false, reason: 'EMAIL_PROVIDER_NOT_CONFIGURED' };
    }

    const subject = '[DRE M] 비밀번호 재설정 안내';
    const html = buildPasswordResetEmailHtml(params.resetUrl, params.username);
    const text = buildPasswordResetEmailText(params.resetUrl, params.username);

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
            console.error('[passwordReset] resend error:', res.status, detail);
            return { ok: false, reason: 'EMAIL_SEND_FAILED' };
        }

        return { ok: true };
    } catch (error) {
        console.error('[passwordReset] send exception:', error);
        return { ok: false, reason: 'EMAIL_SEND_EXCEPTION' };
    }
}
