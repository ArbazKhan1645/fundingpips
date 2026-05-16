import 'server-only';

type EmailPayload = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
};

type SmsPayload = {
  to: string;
  body: string;
};

const fromEmail = process.env.TRANSACTIONAL_EMAIL_FROM || 'Lordfunded <noreply@lordfunded.com>';

export async function sendTransactionalEmail(payload: EmailPayload) {
  if (process.env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });
    if (!response.ok) throw new Error('resend_email_failed');
    return;
  }

  if (process.env.SENDGRID_API_KEY) {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: payload.to }] }],
        from: { email: fromEmail.match(/<(.+)>/)?.[1] ?? fromEmail },
        subject: payload.subject,
        content: [{ type: payload.html ? 'text/html' : 'text/plain', value: payload.html ?? payload.text ?? '' }],
      }),
    });
    if (!response.ok) throw new Error('sendgrid_email_failed');
    return;
  }

  throw new Error('email_provider_not_configured');
}

export async function sendSms(payload: SmsPayload) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) throw new Error('sms_provider_not_configured');

  const body = new URLSearchParams({
    To: payload.to,
    From: from,
    Body: payload.body,
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) throw new Error('twilio_sms_failed');
}
