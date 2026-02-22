import { db } from '../index';
import { conversations, type Conversation } from '../schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Create a new conversation
 */
export async function createConversation(
  userId: string,
  tripId?: string
): Promise<Conversation> {
  const [conversation] = await db
    .insert(conversations)
    .values({
      userId,
      tripId: tripId || null,
    })
    .returning();

  return conversation;
}

/**
 * Get conversations by user ID with pagination
 */
export async function getConversationsByUserId(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ conversations: Conversation[]; hasMore: boolean }> {
  // Fetch one extra to determine if there are more results
  const results = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt))
    .limit(limit + 1)
    .offset(offset);

  const hasMore = results.length > limit;
  const conversationsList = hasMore ? results.slice(0, -1) : results;

  return {
    conversations: conversationsList,
    hasMore,
  };
}

/**
 * Get a single conversation by ID with ownership check
 */
export async function getConversationById(
  id: string,
  userId: string
): Promise<Conversation | null> {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));

  if (!conversation) {
    return null;
  }

  // Verify ownership
  if (conversation.userId !== userId) {
    throw new Error('Access denied');
  }

  return conversation;
}

/**
 * Update conversation's updated_at timestamp
 */
export async function updateConversationTimestamp(id: string): Promise<void> {
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, id));
}

/**
 * Update conversation title (typically from first message)
 */
export async function updateConversationTitle(
  id: string,
  title: string
): Promise<void> {
  await db
    .update(conversations)
    .set({ title })
    .where(eq(conversations.id, id));
}
