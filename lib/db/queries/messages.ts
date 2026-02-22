import { db } from '../index';
import { messages, type Message } from '../schema';
import { eq, asc, desc } from 'drizzle-orm';

/**
 * Create a new message
 */
export async function createMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string
): Promise<Message> {
  const [message] = await db
    .insert(messages)
    .values({
      conversationId,
      role,
      content,
    })
    .returning();

  return message;
}

/**
 * Get all messages for a conversation
 */
export async function getMessagesByConversationId(
  conversationId: string,
  limit?: number
): Promise<Message[]> {
  let query = db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  if (limit) {
    query = query.limit(limit) as any;
  }

  return await query;
}

/**
 * Get conversation history formatted for OpenAI API
 * Returns messages in the format: { role: 'user' | 'assistant' | 'system', content: string }
 */
export async function getConversationHistory(
  conversationId: string,
  limit: number = 20
): Promise<Array<{ role: 'user' | 'assistant' | 'system'; content: string }>> {
  // Get the most recent messages, but we need them in chronological order
  const recentMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);

  // Reverse to get chronological order (oldest first)
  const chronologicalMessages = recentMessages.reverse();

  // Format for OpenAI API
  return chronologicalMessages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}

/**
 * Get message count for a conversation
 */
export async function getMessageCount(conversationId: string): Promise<number> {
  const result = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId));

  return result.length;
}
