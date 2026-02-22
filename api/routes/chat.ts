import { Router, Request, Response } from 'express';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import {
  createConversation,
  getConversationsByUserId,
  getConversationById,
  updateConversationTimestamp,
  updateConversationTitle,
} from '../../lib/db/queries/conversations';
import {
  createMessage,
  getMessagesByConversationId,
  getConversationHistory,
  getMessageCount,
} from '../../lib/db/queries/messages';

const router = Router();

// Helper function to send SSE events
const sendEvent = (res: Response, event: string, data: any) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

// POST /api/chat/message - Send message with streaming
router.post('/message', async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract userId from verified JWT token
    const userId = req.user!.id;
    const { conversationId, message } = req.body;

    // Validate required fields
    if (!message) {
      res.status(400).json({
        error: 'Missing required fields',
        details: 'message is required'
      });
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({ error: 'AI service not configured' });
      return;
    }

    // Create conversation if not provided
    let convId = conversationId;
    if (!convId) {
      const conversation = await createConversation(userId);
      convId = conversation.id;
    }

    // Store user message in database
    await createMessage(convId, 'user', message);

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Send start event
    sendEvent(res, 'start', { conversationId: convId });

    // Load conversation history from database
    const history = await getConversationHistory(convId, 20);

    // Add system message to beginning
    const conversationHistory = [
      {
        role: 'system' as const,
        content: 'You are a helpful travel planning assistant. Help users plan trips, suggest destinations, and organize itineraries.'
      },
      ...history
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

    // Store assistant message in database
    const assistantMsg = await createMessage(convId, 'assistant', fullResponse);

    // Update conversation timestamp
    await updateConversationTimestamp(convId);

    // Generate title if this is the first message (2 messages total: 1 user + 1 assistant)
    const messageCount = await getMessageCount(convId);
    if (messageCount === 2) {
      // Generate a simple title from the first user message (truncate if too long)
      const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
      await updateConversationTitle(convId, title);
    }

    // Send completion event
    sendEvent(res, 'done', {
      messageId: assistantMsg.id,
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
    // Extract userId from verified JWT token
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    // Query database for conversations
    const result = await getConversationsByUserId(userId, limit, offset);

    res.json({
      conversations: result.conversations,
      hasMore: result.hasMore,
      total: result.conversations.length,
    });

  } catch (error: any) {
    console.error('List conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// POST /api/chat/conversations - Create new conversation
router.post('/conversations', async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract userId from verified JWT token
    const userId = req.user!.id;
    const { tripId } = req.body;

    // Create conversation in database
    const conversation = await createConversation(userId, tripId);

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
    // Extract userId from verified JWT token
    const userId = req.user!.id;

    // Get conversation from database with ownership check
    const conversation = await getConversationById(id, userId);

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    // Get messages
    const msgs = await getMessagesByConversationId(id);

    res.json({
      conversation,
      messages: msgs,
    });

  } catch (error: any) {
    console.error('Get conversation error:', error);

    // Handle access denied error
    if (error.message === 'Access denied') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

export default router;
