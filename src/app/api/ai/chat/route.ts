import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { chatConversations, chatMessages, userPreferences } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { message, conversationId, context = {} } = body;

    // Get session ID for anonymous users
    const sessionId = !userId ? request.headers.get('x-session-id') || uuidv4() : null;

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    let conversation;

    // Find or create conversation
    if (conversationId) {
      const existingConversation = await db
        .select()
        .from(chatConversations)
        .where(eq(chatConversations.id, conversationId))
        .limit(1);

      if (existingConversation.length > 0) {
        conversation = existingConversation[0];
      }
    }

    if (!conversation) {
      // Create new conversation
      const newConversation = await db
        .insert(chatConversations)
        .values({
          userId,
          sessionId,
          title: generateConversationTitle(message),
          context: {
            intent: detectIntent(message),
            ...context,
          },
          status: 'active',
        })
        .returning();

      conversation = newConversation[0];
    }

    // Save user message
    await db.insert(chatMessages).values({
      conversationId: conversation.id,
      role: 'user',
      content: message,
      messageType: 'text',
    });

    // Get user preferences for personalization
    let userPrefs = null;
    if (userId) {
      const preferences = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId))
        .limit(1);

      if (preferences.length > 0) {
        userPrefs = preferences[0];
      }
    }

    // Get conversation history for context
    const conversationHistory = await db
      .select({
        role: chatMessages.role,
        content: chatMessages.content,
        messageType: chatMessages.messageType,
        metadata: chatMessages.metadata,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversation.id))
      .orderBy(desc(chatMessages.createdAt))
      .limit(10);

    // Generate AI response
    const aiResponse = await generateAIResponse({
      userMessage: message,
      conversationHistory,
      userPreferences: userPrefs,
      context: { ...conversation.context, ...context },
    });

    // Save AI response
    await db.insert(chatMessages).values({
      conversationId: conversation.id,
      role: 'assistant',
      content: aiResponse.content,
      messageType: aiResponse.type,
      metadata: aiResponse.metadata,
    });

    // Update conversation context
    await db
      .update(chatConversations)
      .set({
        context: {
          ...conversation.context,
          ...aiResponse.updatedContext,
        },
        updatedAt: new Date(),
      })
      .where(eq(chatConversations.id, conversation.id));

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conversation.id,
        message: {
          id: uuidv4(), // This would come from the database in real implementation
          role: 'assistant',
          content: aiResponse.content,
          messageType: aiResponse.type,
          metadata: aiResponse.metadata,
          createdAt: new Date().toISOString(),
        },
        context: {
          ...conversation.context,
          ...aiResponse.updatedContext,
        },
        suggestions: aiResponse.suggestions,
      },
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process chat message',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get conversation history
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!conversationId && !userId && !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID, User ID, or Session ID required' },
        { status: 400 }
      );
    }

    let conversations;

    if (conversationId) {
      // Get specific conversation
      conversations = await db
        .select()
        .from(chatConversations)
        .where(eq(chatConversations.id, conversationId))
        .limit(1);
    } else {
      // Get user's conversations
      const whereClause = userId
        ? eq(chatConversations.userId, userId)
        : eq(chatConversations.sessionId, sessionId!);

      conversations = await db
        .select()
        .from(chatConversations)
        .where(whereClause)
        .orderBy(desc(chatConversations.updatedAt))
        .limit(10);
    }

    // Get messages for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conversation) => {
        const messages = await db
          .select({
            id: chatMessages.id,
            role: chatMessages.role,
            content: chatMessages.content,
            messageType: chatMessages.messageType,
            metadata: chatMessages.metadata,
            createdAt: chatMessages.createdAt,
          })
          .from(chatMessages)
          .where(eq(chatMessages.conversationId, conversation.id))
          .orderBy(chatMessages.createdAt)
          .limit(limit);

        return {
          ...conversation,
          messages,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: conversationId
        ? conversationsWithMessages[0] || null
        : conversationsWithMessages,
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch chat history',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Mock AI response generation (replace with actual AI service)
async function generateAIResponse({
  userMessage,
  conversationHistory,
  userPreferences,
  context,
}: {
  userMessage: string;
  conversationHistory: any[];
  userPreferences: any;
  context: any;
}) {
  // Mock AI processing - replace with actual AI service integration
  // This would typically involve:
  // 1. Intent recognition and entity extraction
  // 2. Context understanding and conversation state management
  // 3. Product search and recommendation logic
  // 4. Natural language generation

  const intent = detectIntent(userMessage);

  switch (intent) {
    case 'product_search':
      return await handleProductSearch(userMessage, userPreferences, context);
    case 'product_recommendation':
      return await handleProductRecommendation(userMessage, userPreferences, context);
    case 'comparison':
      return await handleProductComparison(userMessage, context);
    case 'general_inquiry':
    default:
      return handleGeneralInquiry(userMessage, context);
  }
}

async function handleProductSearch(message: string, userPrefs: any, context: any) {
  // Mock product search based on user message
  const searchResults = []; // This would come from actual search

  return {
    content: "I found several products that match your criteria. Here are my top recommendations:",
    type: 'product_recommendation',
    metadata: {
      products: [
        { id: uuidv4(), reason: 'Matches your style preferences', confidence: 0.95 },
        { id: uuidv4(), reason: 'Within your budget range', confidence: 0.87 },
        { id: uuidv4(), reason: 'Highly rated by similar users', confidence: 0.82 },
      ],
      aiModel: 'shopping-assistant-v1',
      processingTime: 850,
    },
    updatedContext: {
      ...context,
      intent: 'product_search',
      lastQuery: message,
      searchResults: searchResults,
    },
    suggestions: [
      "Would you like me to explain the differences between these options?",
      "Should I show you customer reviews for these products?",
      "Would you like to see more options in a different price range?",
    ],
  };
}

async function handleProductRecommendation(message: string, userPrefs: any, context: any) {
  return {
    content: "Based on your preferences and browsing history, I recommend these products that align with your style and budget:",
    type: 'product_recommendation',
    metadata: {
      products: [
        { id: uuidv4(), reason: 'Perfect match for your modern style', confidence: 0.92 },
        { id: uuidv4(), reason: 'Complements your recent purchases', confidence: 0.88 },
      ],
      aiModel: 'recommendation-engine-v2',
      processingTime: 650,
    },
    updatedContext: {
      ...context,
      intent: 'product_recommendation',
      recommendations: ['modern', 'minimalist'],
    },
    suggestions: [
      "Would you like to see how these would look in your space?",
      "Should I add any of these to your wishlist?",
      "Would you like to see similar items from other brands?",
    ],
  };
}

async function handleProductComparison(message: string, context: any) {
  return {
    content: "Let me compare these products for you based on key features, price, and customer satisfaction:",
    type: 'text',
    metadata: {
      comparison: {
        products: [],
        criteria: ['price', 'quality', 'features', 'reviews'],
      },
      aiModel: 'comparison-engine-v1',
      processingTime: 450,
    },
    updatedContext: {
      ...context,
      intent: 'comparison',
    },
    suggestions: [
      "Would you like me to highlight the pros and cons?",
      "Should I factor in shipping costs and delivery times?",
      "Would you like to see what other customers prefer?",
    ],
  };
}

function handleGeneralInquiry(message: string, context: any) {
  return {
    content: "I'm here to help you find the perfect furniture and home decor items. What specific type of product are you looking for today?",
    type: 'text',
    metadata: {
      aiModel: 'general-assistant-v1',
      processingTime: 200,
    },
    updatedContext: {
      ...context,
      intent: 'general_inquiry',
    },
    suggestions: [
      "Browse living room furniture",
      "Show me bedroom sets",
      "Help me decorate my office",
      "Find dining room furniture",
    ],
  };
}

function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
    return 'product_recommendation';
  }
  if (lowerMessage.includes('compare') || lowerMessage.includes('vs') || lowerMessage.includes('difference')) {
    return 'comparison';
  }
  if (lowerMessage.includes('looking for') || lowerMessage.includes('need') || lowerMessage.includes('want')) {
    return 'product_search';
  }

  return 'general_inquiry';
}

function generateConversationTitle(firstMessage: string): string {
  // Generate a meaningful title from the first message
  const words = firstMessage.split(' ').slice(0, 6);
  return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '');
}