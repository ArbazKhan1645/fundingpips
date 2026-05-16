import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { answerWithLordfundedAi } from '@/lib/backend/ai';
import { jsonError, jsonOk } from '@/lib/backend/security';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const schema = z.object({
  sessionId: z.string().uuid().optional(),
  visitorId: z.string().min(3).max(128).optional(),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(4000),
  })).min(1).max(20),
});

export async function POST(request: NextRequest) {
  try {
    const payload = schema.parse(await request.json());
    const supabaseAdmin = getSupabaseAdmin();
    let sessionId = payload.sessionId;

    if (!sessionId) {
      const { data, error } = await supabaseAdmin
        .from('ai_chat_sessions')
        .insert({ visitor_id: payload.visitorId ?? null, title: payload.messages.at(-1)?.content.slice(0, 80) })
        .select('id')
        .single();

      if (error) return jsonError('Unable to create chat session.', 500);
      sessionId = data.id;
    }

    const lastUserMessage = payload.messages.filter((m) => m.role === 'user').at(-1);
    if (lastUserMessage) {
      await supabaseAdmin.from('ai_chat_messages').insert({
        session_id: sessionId,
        role: 'user',
        content: lastUserMessage.content,
      });
    }

    const answer = await answerWithLordfundedAi(payload.messages);

    await supabaseAdmin.from('ai_chat_messages').insert({
      session_id: sessionId,
      role: 'assistant',
      content: answer,
    });

    return jsonOk({ sessionId, message: { role: 'assistant', content: answer } });
  } catch {
    return jsonError('Invalid chat request.', 400);
  }
}
