import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { userPreferences, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user preferences
    const preferences = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (preferences.length === 0) {
      // Return default preferences if none exist
      return NextResponse.json({
        success: true,
        data: {
          id: null,
          userId,
          styleProfile: {
            modern: 0.5,
            traditional: 0.5,
            minimalist: 0.5,
            bohemian: 0.5,
            industrial: 0.5,
            scandinavian: 0.5,
          },
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
          createdAt: null,
          updatedAt: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: preferences[0],
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch preferences',
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
    const {
      styleProfile,
      budgetPreferences,
      preferredCategories,
      colorPreferences,
      roomTypes,
      sizePreferences,
      brandPreferences,
      notificationSettings,
    } = body;

    // Check if preferences already exist
    const existingPreferences = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    let result;

    if (existingPreferences.length > 0) {
      // Update existing preferences
      result = await db
        .update(userPreferences)
        .set({
          styleProfile,
          budgetPreferences,
          preferredCategories,
          colorPreferences,
          roomTypes,
          sizePreferences,
          brandPreferences,
          notificationSettings,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, userId))
        .returning();
    } else {
      // Create new preferences
      result = await db
        .insert(userPreferences)
        .values({
          userId,
          styleProfile,
          budgetPreferences,
          preferredCategories,
          colorPreferences,
          roomTypes,
          sizePreferences,
          brandPreferences,
          notificationSettings,
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      data: result[0],
      message: existingPreferences.length > 0 ? 'Preferences updated successfully' : 'Preferences created successfully',
    });
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save preferences',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updates = body;

    // Partial update of preferences
    const result = await db
      .update(userPreferences)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, userId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Preferences not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update preferences',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}