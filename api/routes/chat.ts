import { Router, Request, Response } from 'express';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const router = Router();

// Helper function to send SSE events
const sendEvent = (res: Response, event: string, data: any) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

// POST /api/chat/message - Send message with streaming
router.post('/message', async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId, message, userId } = req.body;

    // Validate required fields
    if (!message || !userId) {
      res.status(400).json({
        error: 'Missing required fields',
        details: 'message and userId are required'
      });
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({ error: 'AI service not configured' });
      return;
    }

    // For now, create a mock conversation ID if not provided
    // In production, this will create/get from database
    const convId = conversationId || `conv_${Date.now()}`;

    // TODO: Store user message in database
    // await db.insert(messages).values({
    //   conversation_id: convId,
    //   content: message,
    //   role: 'user',
    // });

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Send start event
    sendEvent(res, 'start', { conversationId: convId });

    // TODO: Load conversation history from database
    // const dbMessages = await db.select()
    //   .from(messages)
    //   .where(eq(messages.conversation_id, convId))
    //   .orderBy(messages.timestamp)
    //   .limit(20);

    // For now, use simple conversation history
    const conversationHistory = [
      {
        role: 'system' as const,
        content: 'You are a helpful travel planning assistant. Help users plan trips, suggest destinations, and organize itineraries.'
      },
      {
        role: 'user' as const,
        content: message
      }
    ];

    // Stream response from OpenAI
    const result = await streamText({
      model: openai(process.env.GPT_MODEL || 'gpt-4o'),
      messages: conversationHistory,
    });

    // Stream tokens to client
    let fullResponse = '';
    console.log('Result object keys:', Object.keys(result));

    try {
      for await (const textPart of result.textStream) {
        console.log('Token chunk:', textPart);
        fullResponse += textPart;
        sendEvent(res, 'token', { content: textPart });
      }
    } catch (streamError) {
      console.error('Stream error:', streamError);
    }

    console.log('Full response length:', fullResponse.length);

    // TODO: Store assistant message in database
    // const [assistantMsg] = await db.insert(messages).values({
    //   conversation_id: convId,
    //   content: fullResponse,
    //   role: 'assistant',
    // }).returning();

    // Send completion event
    sendEvent(res, 'done', {
      messageId: `msg_${Date.now()}`, // Replace with actual DB ID
      conversationId: convId,
    });

    res.end();

  } catch (error: any) {
    console.error('Chat error:', error);

    // Send error event if streaming has started
    try {
      sendEvent(res, 'error', {
        message: error.message || 'An error occurred while processing your message'
      });
    } catch (e) {
      // If we can't send SSE event, just end the response
    }

    res.end();
  }
});

// GET /api/chat/conversations - List user conversations
router.get('/conversations', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
    // const limit = parseInt(req.query.limit as string) || 20;
    // const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      res.status(400).json({ error: 'userId required' });
      return;
    }

    // TODO: Query database for conversations
    // const convs = await db
    //   .select()
    //   .from(conversations)
    //   .where(eq(conversations.user_id, userId as string))
    //   .orderBy(desc(conversations.updated_at))
    //   .limit(limit + 1)
    //   .offset(offset);

    // const hasMore = convs.length > limit;
    // const results = hasMore ? convs.slice(0, -1) : convs;

    // Mock response for now
    res.json({
      conversations: [],
      hasMore: false,
      total: 0,
    });

  } catch (error: any) {
    console.error('List conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// POST /api/chat/conversations - Create new conversation
router.post('/conversations', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, tripId } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'userId required' });
      return;
    }

    // TODO: Create conversation in database
    // const [conversation] = await db.insert(conversations)
    //   .values({
    //     user_id: userId,
    //     trip_id: tripId || null,
    //   })
    //   .returning();

    // Mock response for now
    const conversation = {
      id: `conv_${Date.now()}`,
      user_id: userId,
      trip_id: tripId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    res.status(201).json({ conversation });

  } catch (error: any) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// GET /api/chat/conversations/:id - Get conversation details
router.get('/conversations/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      res.status(400).json({ error: 'userId required' });
      return;
    }

    // TODO: Get conversation from database
    // const [conversation] = await db
    //   .select()
    //   .from(conversations)
    //   .where(eq(conversations.id, id));

    // if (!conversation) {
    //   return res.status(404).json({ error: 'Conversation not found' });
    // }

    // // Verify ownership
    // if (conversation.user_id !== userId) {
    //   return res.status(403).json({ error: 'Access denied' });
    // }

    // // Get messages
    // const msgs = await db
    //   .select()
    //   .from(messages)
    //   .where(eq(messages.conversation_id, id))
    //   .orderBy(messages.timestamp);

    // Mock response for now
    res.json({
      conversation: {
        id,
        user_id: userId,
        trip_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      messages: [],
    });

  } catch (error: any) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

export default router;
