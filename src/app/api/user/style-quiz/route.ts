import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { userPreferences } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Style quiz questions and scoring logic
const STYLE_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Which living room appeals to you most?",
    type: "image_choice",
    options: [
      {
        id: "modern",
        label: "Modern & Clean",
        description: "Clean lines, minimal decor, neutral colors",
        scores: { modern: 3, minimalist: 2, scandinavian: 1 }
      },
      {
        id: "traditional",
        label: "Traditional & Cozy",
        description: "Rich fabrics, warm colors, classic furniture",
        scores: { traditional: 3, bohemian: 1 }
      },
      {
        id: "industrial",
        label: "Industrial & Bold",
        description: "Metal accents, exposed brick, dark colors",
        scores: { industrial: 3, modern: 1 }
      }
    ]
  },
  {
    id: 2,
    question: "What's your ideal color palette?",
    type: "multiple_choice",
    options: [
      {
        id: "neutral",
        label: "Neutral & Calm",
        description: "Whites, grays, beiges",
        scores: { minimalist: 3, scandinavian: 2, modern: 1 }
      },
      {
        id: "warm",
        label: "Warm & Inviting",
        description: "Browns, oranges, deep reds",
        scores: { traditional: 3, bohemian: 2 }
      },
      {
        id: "bold",
        label: "Bold & Dramatic",
        description: "Black, deep blues, rich jewel tones",
        scores: { industrial: 3, modern: 2 }
      },
      {
        id: "natural",
        label: "Natural & Organic",
        description: "Earth tones, forest greens, natural wood",
        scores: { scandinavian: 3, bohemian: 2, traditional: 1 }
      }
    ]
  },
  {
    id: 3,
    question: "How do you prefer your furniture?",
    type: "multiple_choice",
    options: [
      {
        id: "sleek",
        label: "Sleek & Streamlined",
        description: "Clean lines, built-in storage, multifunctional",
        scores: { modern: 3, minimalist: 2 }
      },
      {
        id: "ornate",
        label: "Detailed & Ornate",
        description: "Carved details, rich materials, statement pieces",
        scores: { traditional: 3, bohemian: 1 }
      },
      {
        id: "rustic",
        label: "Rustic & Handcrafted",
        description: "Natural materials, visible craftsmanship, imperfections",
        scores: { scandinavian: 3, bohemian: 2, industrial: 1 }
      },
      {
        id: "minimalist",
        label: "Simple & Essential",
        description: "Only what's needed, perfect proportions, no clutter",
        scores: { minimalist: 3, scandinavian: 2, modern: 1 }
      }
    ]
  },
  {
    id: 4,
    question: "What's your approach to decorating?",
    type: "multiple_choice",
    options: [
      {
        id: "less_is_more",
        label: "Less is More",
        description: "Few carefully chosen pieces, lots of empty space",
        scores: { minimalist: 3, modern: 2, scandinavian: 1 }
      },
      {
        id: "layered",
        label: "Layered & Rich",
        description: "Multiple textures, patterns, and colors",
        scores: { bohemian: 3, traditional: 2 }
      },
      {
        id: "functional",
        label: "Functional First",
        description: "Everything serves a purpose, form follows function",
        scores: { industrial: 3, modern: 2, minimalist: 1 }
      },
      {
        id: "cozy",
        label: "Cozy & Comfortable",
        description: "Soft textures, warm lighting, inviting spaces",
        scores: { scandinavian: 3, traditional: 2, bohemian: 1 }
      }
    ]
  },
  {
    id: 5,
    question: "Which materials do you gravitate towards?",
    type: "multiple_choice",
    options: [
      {
        id: "metal_glass",
        label: "Metal & Glass",
        description: "Chrome, steel, clear surfaces",
        scores: { modern: 3, industrial: 2, minimalist: 1 }
      },
      {
        id: "wood_fabric",
        label: "Rich Wood & Fabric",
        description: "Dark woods, leather, heavy textiles",
        scores: { traditional: 3, industrial: 1 }
      },
      {
        id: "natural_wood",
        label: "Natural Wood & Stone",
        description: "Light woods, natural stone, organic materials",
        scores: { scandinavian: 3, bohemian: 2, minimalist: 1 }
      },
      {
        id: "mixed",
        label: "Mixed & Eclectic",
        description: "Combination of various materials and textures",
        scores: { bohemian: 3, industrial: 1 }
      }
    ]
  },
  {
    id: 6,
    question: "What's your ideal lighting?",
    type: "multiple_choice",
    options: [
      {
        id: "bright_clean",
        label: "Bright & Clean",
        description: "Lots of natural light, LED fixtures, even illumination",
        scores: { modern: 3, minimalist: 2, scandinavian: 1 }
      },
      {
        id: "warm_ambient",
        label: "Warm & Ambient",
        description: "Table lamps, candles, soft glowing light",
        scores: { traditional: 3, bohemian: 2, scandinavian: 1 }
      },
      {
        id: "dramatic",
        label: "Dramatic & Focused",
        description: "Pendant lights, spotlights, architectural lighting",
        scores: { industrial: 3, modern: 2 }
      },
      {
        id: "natural",
        label: "Natural & Soft",
        description: "Maximize daylight, simple fixtures, gentle shadows",
        scores: { scandinavian: 3, minimalist: 2, bohemian: 1 }
      }
    ]
  },
  {
    id: 7,
    question: "How important is having the latest trends?",
    type: "scale",
    options: [
      {
        id: "very_important",
        label: "Very Important",
        scores: { modern: 3, bohemian: 1 }
      },
      {
        id: "somewhat_important",
        label: "Somewhat Important",
        scores: { modern: 2, industrial: 1 }
      },
      {
        id: "not_important",
        label: "Not Important",
        scores: { traditional: 3, minimalist: 2, scandinavian: 2 }
      },
      {
        id: "prefer_timeless",
        label: "Prefer Timeless Pieces",
        scores: { traditional: 3, minimalist: 3, scandinavian: 2 }
      }
    ]
  },
  {
    id: 8,
    question: "What's your budget approach?",
    type: "multiple_choice",
    options: [
      {
        id: "investment",
        label: "Investment Pieces",
        description: "Buy fewer, high-quality items that last",
        scores: { traditional: 3, minimalist: 2, modern: 2 }
      },
      {
        id: "mix_match",
        label: "Mix High & Low",
        description: "Combine expensive and affordable pieces",
        scores: { bohemian: 3, modern: 2, industrial: 1 }
      },
      {
        id: "diy",
        label: "DIY & Thrifted",
        description: "Enjoy finding and making unique pieces",
        scores: { bohemian: 3, industrial: 2, scandinavian: 1 }
      },
      {
        id: "affordable",
        label: "Affordable & Fresh",
        description: "Update frequently with budget-friendly options",
        scores: { modern: 2, bohemian: 1 }
      }
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');

    if (questionId) {
      // Return specific question
      const question = STYLE_QUIZ_QUESTIONS.find(q => q.id === parseInt(questionId));
      
      if (!question) {
        return NextResponse.json(
          { success: false, error: 'Question not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: question,
      });
    }

    // Return all questions
    return NextResponse.json({
      success: true,
      data: {
        questions: STYLE_QUIZ_QUESTIONS,
        totalQuestions: STYLE_QUIZ_QUESTIONS.length,
      },
    });
  } catch (error) {
    console.error('Error fetching style quiz questions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch quiz questions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, error: 'Answers array is required' },
        { status: 400 }
      );
    }

    // Calculate style scores based on answers
    const styleScores = calculateStyleScores(answers);
    
    // Generate style profile
    const styleProfile = generateStyleProfile(styleScores);
    
    // Generate recommendations based on style
    const recommendations = generateStyleRecommendations(styleProfile);

    // Save or update user preferences
    const existingPreferences = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    let preferences;

    if (existingPreferences.length > 0) {
      // Update existing preferences with new style profile
      preferences = await db
        .update(userPreferences)
        .set({
          styleProfile: styleScores,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, userId))
        .returning();
    } else {
      // Create new preferences
      preferences = await db
        .insert(userPreferences)
        .values({
          userId,
          styleProfile: styleScores,
          budgetPreferences: {
            min: 0,
            max: 10000,
            categories: {},
          },
          preferredCategories: [],
          colorPreferences: [],
          roomTypes: [],
          sizePreferences: {},
          brandPreferences: [],
          notificationSettings: {
            priceDrops: true,
            restockAlerts: true,
            newArrivals: false,
            recommendations: true,
          },
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      data: {
        styleProfile,
        styleScores,
        preferences: preferences[0],
        recommendations,
        analysis: {
          primaryStyle: styleProfile.primaryStyle,
          secondaryStyles: styleProfile.secondaryStyles,
          confidence: styleProfile.confidence,
          description: generateStyleDescription(styleProfile),
        },
      },
    });
  } catch (error) {
    console.error('Error processing style quiz:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process quiz results',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function calculateStyleScores(answers: Array<{ questionId: number; selectedOption: string }>) {
  const scores = {
    modern: 0,
    traditional: 0,
    minimalist: 0,
    bohemian: 0,
    industrial: 0,
    scandinavian: 0,
  };

  answers.forEach(answer => {
    const question = STYLE_QUIZ_QUESTIONS.find(q => q.id === answer.questionId);
    if (!question) return;

    const option = question.options.find(opt => opt.id === answer.selectedOption);
    if (!option || !option.scores) return;

    // Add scores for this answer
    Object.entries(option.scores).forEach(([style, score]) => {
      if (scores.hasOwnProperty(style)) {
        (scores as any)[style] += score;
      }
    });
  });

  // Normalize scores to percentages
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  
  if (totalScore > 0) {
    Object.keys(scores).forEach(style => {
      (scores as any)[style] = (scores as any)[style] / totalScore;
    });
  }

  return scores;
}

function generateStyleProfile(styleScores: Record<string, number>) {
  // Sort styles by score
  const sortedStyles = Object.entries(styleScores)
    .sort(([, a], [, b]) => b - a)
    .map(([style, score]) => ({ style, score }));

  const primaryStyle = sortedStyles[0];
  const secondaryStyles = sortedStyles.slice(1, 3);

  // Calculate confidence based on how dominant the primary style is
  const confidence = primaryStyle.score - (secondaryStyles[0]?.score || 0);

  return {
    primaryStyle: {
      name: primaryStyle.style,
      score: primaryStyle.score,
      percentage: Math.round(primaryStyle.score * 100),
    },
    secondaryStyles: secondaryStyles.map(({ style, score }) => ({
      name: style,
      score,
      percentage: Math.round(score * 100),
    })),
    confidence: Math.min(confidence * 2, 1), // Scale confidence
    allScores: styleScores,
  };
}

function generateStyleRecommendations(styleProfile: any) {
  const { primaryStyle, secondaryStyles } = styleProfile;
  
  const styleRecommendations: Record<string, any> = {
    modern: {
      colors: ['white', 'gray', 'black', 'chrome'],
      materials: ['glass', 'metal', 'leather'],
      furniture: ['sleek sofas', 'minimalist coffee tables', 'geometric lighting'],
      tips: ['Focus on clean lines', 'Use neutral color palette', 'Minimize clutter'],
    },
    traditional: {
      colors: ['burgundy', 'navy', 'forest green', 'gold'],
      materials: ['dark wood', 'rich fabrics', 'brass'],
      furniture: ['tufted sofas', 'wooden dining tables', 'classic armchairs'],
      tips: ['Layer textures and patterns', 'Use warm lighting', 'Display collected items'],
    },
    minimalist: {
      colors: ['white', 'beige', 'soft gray'],
      materials: ['natural wood', 'stone', 'cotton'],
      furniture: ['simple bed frames', 'floating shelves', 'basic seating'],
      tips: ['Keep only essentials', 'Focus on quality over quantity', 'Embrace negative space'],
    },
    bohemian: {
      colors: ['jewel tones', 'earth tones', 'warm oranges'],
      materials: ['textiles', 'rattan', 'reclaimed wood'],
      furniture: ['floor cushions', 'vintage finds', 'hanging chairs'],
      tips: ['Mix patterns and textures', 'Display collections', 'Add plants and natural elements'],
    },
    industrial: {
      colors: ['charcoal', 'rust', 'raw metals'],
      materials: ['exposed brick', 'metal', 'concrete'],
      furniture: ['metal frame furniture', 'leather seating', 'pipe shelving'],
      tips: ['Expose architectural elements', 'Use raw materials', 'Focus on functionality'],
    },
    scandinavian: {
      colors: ['white', 'light wood tones', 'soft pastels'],
      materials: ['light wood', 'wool', 'linen'],
      furniture: ['blonde wood furniture', 'cozy textiles', 'simple lighting'],
      tips: ['Maximize natural light', 'Use cozy textures', 'Keep it functional and beautiful'],
    },
  };

  const primaryRecs = styleRecommendations[primaryStyle.name] || {};
  const secondaryRecs = secondaryStyles.length > 0 
    ? styleRecommendations[secondaryStyles[0].name] || {}
    : {};

  return {
    primaryStyle: {
      name: primaryStyle.name,
      recommendations: primaryRecs,
    },
    blendedRecommendations: {
      colors: [...(primaryRecs.colors || []), ...(secondaryRecs.colors || [])].slice(0, 6),
      materials: [...(primaryRecs.materials || []), ...(secondaryRecs.materials || [])].slice(0, 4),
      furniture: [...(primaryRecs.furniture || []), ...(secondaryRecs.furniture || [])].slice(0, 6),
      tips: [...(primaryRecs.tips || []), ...(secondaryRecs.tips || [])].slice(0, 5),
    },
  };
}

function generateStyleDescription(styleProfile: any): string {
  const { primaryStyle, secondaryStyles } = styleProfile;
  
  const descriptions: Record<string, string> = {
    modern: "You love clean lines, minimalist aesthetics, and contemporary design",
    traditional: "You appreciate classic elegance, rich materials, and timeless pieces",
    minimalist: "You believe in the beauty of simplicity and functional design",
    bohemian: "You enjoy eclectic mixes, vibrant colors, and global influences", 
    industrial: "You're drawn to raw materials, urban aesthetics, and functional design",
    scandinavian: "You value cozy comfort, natural materials, and functional beauty",
  };

  let description = descriptions[primaryStyle.name] || "You have a unique design aesthetic";
  
  if (secondaryStyles.length > 0 && secondaryStyles[0].percentage > 20) {
    const secondaryDesc = descriptions[secondaryStyles[0].name];
    description += ` with elements of ${secondaryStyles[0].name.toLowerCase()} style`;
  }

  return description + ".";
}