import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { 
  products, 
  productRecommendations, 
  userPreferences, 
  searchHistory,
  cartItems,
  carts,
  orderItems,
  orders,
  categories
} from '@/lib/db/schema';
import { eq, desc, and, inArray, gte, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'personalized';
    const productId = searchParams.get('productId');
    const categoryId = searchParams.get('categoryId');
    const limit = parseInt(searchParams.get('limit') || '12');
    const includeReasons = searchParams.get('includeReasons') === 'true';
    const sessionId = searchParams.get('sessionId');

    if (!userId && !sessionId) {
      return NextResponse.json(
        { success: false, error: 'User ID or session ID required' },
        { status: 401 }
      );
    }

    let recommendations;

    switch (type) {
      case 'personalized':
        recommendations = await getPersonalizedRecommendations(userId, sessionId, limit, includeReasons);
        break;
      case 'similar':
        if (!productId) {
          return NextResponse.json(
            { success: false, error: 'Product ID required for similar recommendations' },
            { status: 400 }
          );
        }
        recommendations = await getSimilarProductRecommendations(productId, userId, sessionId, limit, includeReasons);
        break;
      case 'complementary':
        if (!productId) {
          return NextResponse.json(
            { success: false, error: 'Product ID required for complementary recommendations' },
            { status: 400 }
          );
        }
        recommendations = await getComplementaryRecommendations(productId, userId, sessionId, limit, includeReasons);
        break;
      case 'trending':
        recommendations = await getTrendingRecommendations(categoryId, limit, includeReasons);
        break;
      case 'cross_sell':
        recommendations = await getCrossSellRecommendations(userId, sessionId, limit, includeReasons);
        break;
      case 'up_sell':
        recommendations = await getUpSellRecommendations(userId, sessionId, limit, includeReasons);
        break;
      case 'recently_viewed':
        recommendations = await getRecentlyViewedRecommendations(userId, sessionId, limit);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid recommendation type' },
          { status: 400 }
        );
    }

    // Track recommendation views for analytics
    if (recommendations.length > 0) {
      await trackRecommendationView(userId, sessionId, type, recommendations.map(r => r.id));
    }

    return NextResponse.json({
      success: true,
      data: {
        type,
        recommendations,
        metadata: {
          totalResults: recommendations.length,
          generatedAt: new Date().toISOString(),
          algorithm: `${type}_recommendation_v1`,
          personalized: !!userId,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Generate new recommendations
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { 
      type, 
      sourceProductId, 
      context = {}, 
      forceRefresh = false,
      algorithm = 'default'
    } = body;

    const sessionId = !userId ? request.headers.get('x-session-id') || uuidv4() : null;

    if (!userId && !sessionId) {
      return NextResponse.json(
        { success: false, error: 'User ID or session ID required' },
        { status: 401 }
      );
    }

    // Check if we have fresh recommendations (unless force refresh)
    if (!forceRefresh) {
      const existingRecommendations = await db
        .select()
        .from(productRecommendations)
        .where(
          and(
            userId ? eq(productRecommendations.userId, userId) : eq(productRecommendations.sessionId, sessionId!),
            eq(productRecommendations.recommendationType, type),
            sourceProductId ? eq(productRecommendations.sourceProductId, sourceProductId) : sql`true`,
            gte(productRecommendations.createdAt, new Date(Date.now() - 60 * 60 * 1000)) // 1 hour
          )
        )
        .limit(12);

      if (existingRecommendations.length > 0) {
        const productIds = existingRecommendations.map(r => r.recommendedProductId);
        const recommendedProducts = await getProductDetails(productIds);
        
        return NextResponse.json({
          success: true,
          data: {
            type,
            recommendations: recommendedProducts.map(product => ({
              ...product,
              recommendationScore: existingRecommendations.find(r => r.recommendedProductId === product.id)?.score,
              reason: existingRecommendations.find(r => r.recommendedProductId === product.id)?.reason,
            })),
            fromCache: true,
          },
        });
      }
    }

    // Generate fresh recommendations
    const newRecommendations = await generateRecommendations({
      type,
      userId,
      sessionId,
      sourceProductId,
      context,
      algorithm,
    });

    // Store recommendations for caching
    if (newRecommendations.length > 0) {
      const recommendationRecords = newRecommendations.map(rec => ({
        userId,
        sessionId,
        sourceProductId,
        recommendedProductId: rec.id,
        recommendationType: type,
        score: rec.score?.toString() || '0.5',
        reason: rec.reason,
        algorithm,
        context: context,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }));

      await db.insert(productRecommendations).values(recommendationRecords);
    }

    return NextResponse.json({
      success: true,
      data: {
        type,
        recommendations: newRecommendations,
        fromCache: false,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Track recommendation interactions
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { recommendationId, action, productId, metadata = {} } = body;

    if (!recommendationId && !productId) {
      return NextResponse.json(
        { success: false, error: 'Recommendation ID or Product ID required' },
        { status: 400 }
      );
    }

    // Update recommendation tracking
    const updateData: any = {};
    
    if (action === 'click') {
      updateData.clicked = true;
    } else if (action === 'convert') {
      updateData.converted = true;
    }

    if (recommendationId) {
      await db
        .update(productRecommendations)
        .set(updateData)
        .where(eq(productRecommendations.id, recommendationId));
    } else if (productId) {
      // Update by product ID for the current user/session
      const whereClause = userId 
        ? and(
            eq(productRecommendations.userId, userId),
            eq(productRecommendations.recommendedProductId, productId)
          )
        : and(
            eq(productRecommendations.sessionId, request.headers.get('x-session-id')!),
            eq(productRecommendations.recommendedProductId, productId)
          );

      await db
        .update(productRecommendations)
        .set(updateData)
        .where(whereClause);
    }

    return NextResponse.json({
      success: true,
      message: `Recommendation ${action} tracked successfully`,
    });
  } catch (error) {
    console.error('Error tracking recommendation interaction:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to track recommendation interaction',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions
async function getPersonalizedRecommendations(userId: string | null, sessionId: string | null, limit: number, includeReasons: boolean) {
  // Get user preferences and behavior data
  let userPrefs = null;
  let userBehavior = null;

  if (userId) {
    // Get user preferences
    const preferences = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);
    
    if (preferences.length > 0) {
      userPrefs = preferences[0];
    }

    // Get user behavior (recent orders, cart items, search history)
    userBehavior = await getUserBehaviorData(userId);
  }

  // Generate personalized recommendations based on user data
  const recommendations = await generatePersonalizedProducts(userPrefs, userBehavior, limit);
  
  return includeReasons ? addRecommendationReasons(recommendations, 'personalized') : recommendations;
}

async function getSimilarProductRecommendations(productId: string, userId: string | null, sessionId: string | null, limit: number, includeReasons: boolean) {
  // Get the source product
  const sourceProduct = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (sourceProduct.length === 0) {
    return [];
  }

  // Find similar products based on category, tags, price range, etc.
  const product = sourceProduct[0];
  const priceMin = Number(product.price) * 0.7;
  const priceMax = Number(product.price) * 1.3;

  const similarProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      shortDescription: products.shortDescription,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      images: products.images,
      tags: products.tags,
      categoryId: products.categoryId,
      featured: products.featured,
    })
    .from(products)
    .where(
      and(
        eq(products.status, 'active'),
        eq(products.categoryId, product.categoryId!),
        sql`${products.id} != ${productId}`,
        gte(products.inventory, 1)
      )
    )
    .limit(limit);

  return includeReasons ? addRecommendationReasons(similarProducts, 'similar') : similarProducts;
}

async function getComplementaryRecommendations(productId: string, userId: string | null, sessionId: string | null, limit: number, includeReasons: boolean) {
  // Mock complementary product logic
  // In reality, this would use ML models to find products commonly bought together
  
  const complementaryProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      shortDescription: products.shortDescription,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      images: products.images,
      tags: products.tags,
      categoryId: products.categoryId,
      featured: products.featured,
    })
    .from(products)
    .where(
      and(
        eq(products.status, 'active'),
        gte(products.inventory, 1)
      )
    )
    .limit(limit);

  return includeReasons ? addRecommendationReasons(complementaryProducts, 'complementary') : complementaryProducts;
}

async function getTrendingRecommendations(categoryId: string | null, limit: number, includeReasons: boolean) {
  // Get trending products (high views, recent purchases, etc.)
  let whereConditions = [eq(products.status, 'active'), gte(products.inventory, 1)];
  
  if (categoryId) {
    whereConditions.push(eq(products.categoryId, categoryId));
  }

  const trendingProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      shortDescription: products.shortDescription,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      images: products.images,
      tags: products.tags,
      categoryId: products.categoryId,
      featured: products.featured,
    })
    .from(products)
    .where(and(...whereConditions))
    .orderBy(desc(products.featured), desc(products.createdAt))
    .limit(limit);

  return includeReasons ? addRecommendationReasons(trendingProducts, 'trending') : trendingProducts;
}

async function getCrossSellRecommendations(userId: string | null, sessionId: string | null, limit: number, includeReasons: boolean) {
  // Get products from different categories that complement user's interests
  const crossSellProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      shortDescription: products.shortDescription,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      images: products.images,
      tags: products.tags,
      categoryId: products.categoryId,
      featured: products.featured,
    })
    .from(products)
    .where(
      and(
        eq(products.status, 'active'),
        gte(products.inventory, 1)
      )
    )
    .limit(limit);

  return includeReasons ? addRecommendationReasons(crossSellProducts, 'cross_sell') : crossSellProducts;
}

async function getUpSellRecommendations(userId: string | null, sessionId: string | null, limit: number, includeReasons: boolean) {
  // Get higher-value products in similar categories
  const upSellProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      shortDescription: products.shortDescription,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      images: products.images,
      tags: products.tags,
      categoryId: products.categoryId,
      featured: products.featured,
    })
    .from(products)
    .where(
      and(
        eq(products.status, 'active'),
        gte(products.inventory, 1)
      )
    )
    .orderBy(desc(products.price))
    .limit(limit);

  return includeReasons ? addRecommendationReasons(upSellProducts, 'up_sell') : upSellProducts;
}

async function getRecentlyViewedRecommendations(userId: string | null, sessionId: string | null, limit: number) {
  // Get products from user's search history
  const whereClause = userId 
    ? eq(searchHistory.userId, userId)
    : eq(searchHistory.sessionId, sessionId!);

  const recentSearches = await db
    .select({
      clickedProducts: searchHistory.clickedProducts,
    })
    .from(searchHistory)
    .where(whereClause)
    .orderBy(desc(searchHistory.createdAt))
    .limit(10);

  const clickedProductIds = recentSearches
    .flatMap(search => search.clickedProducts || [])
    .slice(0, limit);

  if (clickedProductIds.length === 0) {
    return [];
  }

  return getProductDetails(clickedProductIds);
}

async function getUserBehaviorData(userId: string) {
  // Get user's recent orders, cart items, and search history
  const recentOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(5);

  const currentCart = await db
    .select()
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);

  let cartItems = [];
  if (currentCart.length > 0) {
    cartItems = await db
      .select()
      .from(cartItems as any)
      .where(eq((cartItems as any).cartId, currentCart[0].id));
  }

  const recentSearches = await db
    .select()
    .from(searchHistory)
    .where(eq(searchHistory.userId, userId))
    .orderBy(desc(searchHistory.createdAt))
    .limit(10);

  return {
    recentOrders,
    cartItems,
    recentSearches,
  };
}

async function generatePersonalizedProducts(userPrefs: any, userBehavior: any, limit: number) {
  // Mock personalized product generation
  // In reality, this would use ML models to analyze user preferences and behavior
  
  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      shortDescription: products.shortDescription,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      images: products.images,
      tags: products.tags,
      categoryId: products.categoryId,
      featured: products.featured,
    })
    .from(products)
    .where(
      and(
        eq(products.status, 'active'),
        gte(products.inventory, 1)
      )
    )
    .limit(limit);
}

async function getProductDetails(productIds: string[]) {
  if (productIds.length === 0) return [];
  
  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      shortDescription: products.shortDescription,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      images: products.images,
      tags: products.tags,
      categoryId: products.categoryId,
      featured: products.featured,
    })
    .from(products)
    .where(inArray(products.id, productIds));
}

function addRecommendationReasons(products: any[], type: string) {
  // Add AI-generated reasons for recommendations
  const reasonMap: Record<string, string[]> = {
    personalized: [
      'Matches your style preferences',
      'Within your budget range',
      'Similar to your recent purchases',
      'Highly rated by users like you',
    ],
    similar: [
      'Similar design and features',
      'Same category and style',
      'Comparable quality and price',
      'From the same brand',
    ],
    complementary: [
      'Frequently bought together',
      'Completes the look',
      'Perfect pairing',
      'Enhances your space',
    ],
    trending: [
      'Popular this week',
      'Trending in your area',
      'Customer favorite',
      'New arrival',
    ],
    cross_sell: [
      'Perfect addition to your collection',
      'Matches your current items',
      'Expands your style',
      'Popular combination',
    ],
    up_sell: [
      'Premium quality upgrade',
      'Better value for money',
      'Enhanced features',
      'Professional choice',
    ],
  };

  const reasons = reasonMap[type] || reasonMap.personalized;

  return products.map(product => ({
    ...product,
    reason: reasons[Math.floor(Math.random() * reasons.length)],
    score: Math.random() * 0.3 + 0.7, // Random score between 0.7-1.0
  }));
}

async function trackRecommendationView(userId: string | null, sessionId: string | null, type: string, productIds: string[]) {
  // Track that recommendations were viewed (for analytics)
  // This could be stored in a separate analytics table
  console.log(`Recommendations viewed: ${type}, products: ${productIds.join(', ')}`);
}

async function generateRecommendations({
  type,
  userId,
  sessionId,
  sourceProductId,
  context,
  algorithm,
}: {
  type: string;
  userId: string | null;
  sessionId: string | null;
  sourceProductId?: string;
  context: any;
  algorithm: string;
}) {
  // This is where you'd integrate with your ML recommendation service
  // For now, return mock recommendations
  
  switch (type) {
    case 'personalized':
      return getPersonalizedRecommendations(userId, sessionId, 12, true);
    case 'similar':
      return sourceProductId ? getSimilarProductRecommendations(sourceProductId, userId, sessionId, 12, true) : [];
    case 'trending':
      return getTrendingRecommendations(null, 12, true);
    default:
      return [];
  }
}