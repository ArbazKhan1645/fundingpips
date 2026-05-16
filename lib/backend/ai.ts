const siteKnowledge = `
Lordfunded is a prop-firm style trading platform inspired by FundingPips workflows.
Core public pages: landing, pricing/challenges, about, blog/news, contact, affiliate, FAQ.
Trader flows: signup/login, email verification, 2FA, dashboard, challenge purchase, account details, equity/drawdown, trade journal, payouts, KYC, affiliate dashboard, notifications, support tickets.
Rules model: challenge tiers can be Instant, One Step, or Two Step. Common rules include profit target, daily drawdown, max drawdown, minimum trading days, profit split, phase progression, account breach, and funded status.
Trading platforms: MT5, cTrader, and Match-Trader should be treated as configurable broker integrations. Broker credentials and trade sync must stay server-side.
Payments: Stripe card payments plus optional crypto providers such as NOWPayments or CoinGate. Webhooks must validate provider signatures.
Payout security: KYC approval and 2FA are mandatory before any payout. Admin approval/rejection is audited.
Admin: users, accounts, challenges, payouts, KYC, leaderboard, affiliates, blog/CMS, analytics, risk monitoring, notifications, and audit logs.
Security: HTTPS, HttpOnly cookies, Supabase RLS, short sessions, refresh rotation, admin IP whitelist, rate limiting, audit trails, input validation, and no exposed provider keys.
`;

export async function answerWithLordfundedAi(messages: Array<{ role: 'user' | 'assistant'; content: string }>) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

  if (!apiKey) {
    return fallbackAnswer(messages.at(-1)?.content ?? '');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      messages: [
        {
          role: 'system',
          content: `You are Lordfunded AI support. Answer concisely and accurately from this knowledge. If payment, KYC, account breach, or payout data is user-specific, tell the user to open a support ticket or dashboard section instead of inventing status.\n\n${siteKnowledge}`,
        },
        ...messages.slice(-12),
      ],
    }),
  });

  if (!response.ok) return fallbackAnswer(messages.at(-1)?.content ?? '');
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? fallbackAnswer(messages.at(-1)?.content ?? '');
}

function fallbackAnswer(input: string) {
  const q = input.toLowerCase();
  if (q.includes('payout') || q.includes('withdraw')) {
    return 'Payouts require an eligible funded account, approved KYC, and enabled 2FA. Submit the request from the dashboard; an admin reviews and audits the approval or rejection.';
  }
  if (q.includes('kyc') || q.includes('verify')) {
    return 'KYC is handled from the verification flow. Upload ID and proof of address, then admin or provider review updates your status to pending, approved, or rejected.';
  }
  if (q.includes('drawdown') || q.includes('rule')) {
    return 'Challenge rules are tier-based: profit target, daily drawdown, max drawdown, minimum trading days, and phase progression are checked against live equity data.';
  }
  return 'Lordfunded supports challenge accounts, funded trader dashboards, KYC, payouts, affiliate tracking, support tickets, and admin risk monitoring. Ask me about any specific flow.';
}
