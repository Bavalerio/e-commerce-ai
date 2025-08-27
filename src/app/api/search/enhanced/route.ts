import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { 
  products, 
  categories, 
  productVariants, 
  searchHistory, 
  userPreferences,
  productReviews 
} from '@/lib/db/schema';
import { eq, like, and, or, gte, lte, desc, asc, sql, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const colors = searchParams.get('colors')?.split(',') || [];
    const sizes = searchParams.get('sizes')?.split(',') || [];
    const brands = searchParams.get('brands')?.split(',') || [];
    const ratings = searchParams.get('minRating');
    const inStock = searchParams.get('inStock');
    const featured = searchParams.get('featured');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const aiEnhanced = searchParams.get('aiEnhanced') === 'true';
    const includeFilters = searchParams.get('includeFilters') === 'true';
    const sessionId = searchParams.get('sessionId');

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

    // Build enhanced search conditions
    const searchConditions = await buildEnhancedSearchConditions({
      query,
      category,
      minPrice,
      maxPrice,
      colors,
      sizes,
      brands,
      ratings,
      inStock,
      featured,
      userPrefs,
      aiEnhanced,
    });

    // Determine sort order
    const orderBy = buildSortOrder(sortBy, sortOrder, query, userPrefs);

    // Execute main search query
    const searchResults = await db
      .select({
        // Product fields
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        sku: products.sku,
        inventory: products.inventory,
        images: products.images,
        tags: products.tags,
        featured: products.featured,
        categoryId: products.categoryId,
        vendorId: products.vendorId,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        // Category info
        categoryName: categories.name,
        categorySlug: categories.slug,
        // AI relevance score (mock calculation)
        relevanceScore: sql<number>`
          CASE 
            WHEN ${products.name} ILIKE ${'%' + query + '%'} THEN 1.0
            WHEN ${products.description} ILIKE ${'%' + query + '%'} THEN 0.8
            WHEN ${products.tags} && ARRAY[${query}] THEN 0.6
            ELSE 0.3
          END
        `,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...searchConditions))
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...searchConditions));

    const total = totalCountResult[0].count;
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    // Store search history
    if (query.trim()) {
      await db.insert(searchHistory).values({
        userId,
        sessionId: sessionId || uuidv4(),
        query: query.trim(),
        searchType: 'text',
        filters: {
          category,
          priceRange: { min: minPrice, max: maxPrice },
          colors,
          sizes,
          brands,
          ratings,
          inStock,
          featured,
        },
        resultsCount: searchResults.length,
        aiConfidence: aiEnhanced ? '0.85' : null,
      });
    }

    // Add AI enhancements if requested
    let aiInsights = null;
    if (aiEnhanced && query.trim()) {
      aiInsights = await generateAIInsights(query, searchResults, userPrefs);
    }

    // Generate dynamic filters if requested
    let dynamicFilters = null;
    if (includeFilters) {
      dynamicFilters = await generateDynamicFilters(searchConditions, query);
    }

    // Add search suggestions
    const suggestions = await generateSearchSuggestions(query, searchResults);

    return NextResponse.json({
      success: true,
      data: {
        query: {
          text: query,
          filters: {
            category,
            priceRange: { min: minPrice, max: maxPrice },
            colors,
            sizes,
            brands,
            minRating: ratings,
            inStock,
            featured,
          },
          aiEnhanced,
          sortBy,
          sortOrder,
        },
        results: searchResults.map(result => ({
          ...result,
          relevanceScore: aiEnhanced ? result.relevanceScore : undefined,
        })),
        pagination: {
          page: currentPage,
          limit,
          total,
          totalPages,
        },
        aiInsights,
        dynamicFilters,
        suggestions,
        metadata: {
          searchTime: Date.now(), // Would be actual search time in production
          algorithm: aiEnhanced ? 'ai_enhanced_search_v2' : 'standard_search_v1',
          personalized: !!userPrefs,
        },
      },
    });
  } catch (error) {
    console.error('Error in enhanced search:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform search',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// AI-powered search suggestions
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { query, limit = 10 } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: { suggestions: [] },
      });
    }

    // Generate AI-powered search suggestions
    const suggestions = await generateAIPoweredSuggestions(query, userId, limit);

    return NextResponse.json({
      success: true,
      data: { suggestions },
    });
  } catch (error) {
    console.error('Error generating search suggestions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate suggestions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function buildEnhancedSearchConditions({
  query,
  category,
  minPrice,
  maxPrice,
  colors,
  sizes,
  brands,
  ratings,
  inStock,
  featured,
  userPrefs,
  aiEnhanced,
}: any) {
  let conditions = [eq(products.status, 'active')];

  // Text search with AI enhancement
  if (query.trim()) {
    if (aiEnhanced) {
      // Enhanced search with semantic understanding
      const searchCondition = or(
        like(products.name, `%${query}%`),
        like(products.description, `%${query}%`),
        like(products.shortDescription, `%${query}%`),
        sql`${products.tags} && ARRAY[${query.toLowerCase()}]`,
        sql`${products.name} % ${query}`, // PostgreSQL similarity operator
      );
      conditions.push(searchCondition);
    } else {
      // Standard search
      const searchCondition = or(
        like(products.name, `%${query}%`),
        like(products.description, `%${query}%`),
        like(products.shortDescription, `%${query}%`),
      );
      conditions.push(searchCondition);
    }
  }

  // Category filter
  if (category) {
    conditions.push(eq(products.categoryId, category));
  }

  // Price range
  if (minPrice) {
    conditions.push(gte(products.price, minPrice));
  }
  if (maxPrice) {
    conditions.push(lte(products.price, maxPrice));
  }

  // Color filter (using tags)
  if (colors.length > 0) {
    conditions.push(sql`${products.tags} && ARRAY[${colors}]`);
  }

  // Brand filter (using vendor or tags)
  if (brands.length > 0) {
    conditions.push(sql`${products.tags} && ARRAY[${brands}]`);
  }

  // Stock filter
  if (inStock === 'true') {
    conditions.push(gte(products.inventory, 1));
  }

  // Featured filter
  if (featured === 'true') {
    conditions.push(eq(products.featured, true));
  }

  // Rating filter (would need to join with reviews)
  if (ratings) {
    // This would require a more complex join with product reviews
    // For now, we'll use a placeholder condition
  }

  // User preference filters (AI enhancement)
  if (userPrefs && aiEnhanced) {
    if (userPrefs.preferredCategories?.length > 0) {
      // Boost products in preferred categories
      conditions.push(
        or(
          sql`true`, // Keep all products
          inArray(products.categoryId, userPrefs.preferredCategories)
        )
      );
    }

    if (userPrefs.budgetPreferences) {
      const { min, max } = userPrefs.budgetPreferences;
      if (min && max) {
        // Soft budget filter - prefer products in budget but don't exclude others
        conditions.push(sql`true`);
      }
    }
  }

  return conditions;
}

function buildSortOrder(sortBy: string, sortOrder: string, query: string, userPrefs: any) {
  const orderDirection = sortOrder === 'asc' ? asc : desc;

  switch (sortBy) {
    case 'relevance':
      return query.trim() 
        ? [desc(sql`relevance_score`), desc(products.featured), desc(products.createdAt)]
        : [desc(products.featured), desc(products.createdAt)];
    
    case 'price':
      return [orderDirection(products.price), desc(products.featured)];
    
    case 'name':
      return [orderDirection(products.name)];
    
    case 'created':
      return [orderDirection(products.createdAt)];
    
    case 'rating':
      // Would need to join with reviews for actual rating
      return [desc(products.featured), desc(products.createdAt)];
    
    case 'popularity':
      // Mock popularity based on featured status and creation date
      return [desc(products.featured), desc(products.createdAt)];
    
    default:
      return [desc(products.featured), desc(products.createdAt)];
  }
}

async function generateAIInsights(query: string, results: any[], userPrefs: any) {
  // Mock AI insights generation
  // In production, this would use ML models to analyze search patterns and results
  
  const insights = {
    searchIntent: detectSearchIntent(query),
    resultsSummary: {
      totalProducts: results.length,
      avgPrice: results.reduce((sum, r) => sum + Number(r.price), 0) / results.length,
      topCategories: getTopCategories(results),
      priceRange: {
        min: Math.min(...results.map(r => Number(r.price))),
        max: Math.max(...results.map(r => Number(r.price))),
      },
    },
    recommendations: [
      'Consider filtering by your preferred style preferences',
      'Similar searches often include complementary items',
      'Products in your price range are available with faster shipping',
    ],
    trendsInsights: [
      `"${query}" searches are up 15% this week`,
      'Customers who search for this often also look at home accessories',
      'Consider modern style variants for better matches',
    ],
  };

  return insights;
}

async function generateDynamicFilters(searchConditions: any[], query: string) {
  // Generate dynamic filters based on current search results
  // This would analyze the current result set to suggest relevant filters
  
  const availableFilters = {
    categories: [
      { id: 'living-room', name: 'Living Room', count: 45 },
      { id: 'bedroom', name: 'Bedroom', count: 32 },
      { id: 'dining', name: 'Dining Room', count: 28 },
    ],
    priceRanges: [
      { range: '0-500', label: 'Under $500', count: 67 },
      { range: '500-1000', label: '$500 - $1,000', count: 89 },
      { range: '1000-2000', label: '$1,000 - $2,000', count: 45 },
      { range: '2000+', label: 'Over $2,000', count: 23 },
    ],
    colors: [
      { name: 'Gray', hex: '#808080', count: 34 },
      { name: 'Brown', hex: '#8B4513', count: 28 },
      { name: 'Black', hex: '#000000', count: 25 },
      { name: 'White', hex: '#FFFFFF', count: 41 },
    ],
    brands: [
      { name: 'IKEA', count: 56 },
      { name: 'West Elm', count: 23 },
      { name: 'Crate & Barrel', count: 18 },
    ],
    ratings: [
      { stars: 5, count: 45 },
      { stars: 4, count: 67 },
      { stars: 3, count: 23 },
    ],
  };

  return availableFilters;
}

async function generateSearchSuggestions(query: string, results: any[]) {
  // Generate search suggestions based on current query and results
  
  if (!query.trim()) {
    return {
      trending: [
        'Modern sectional sofa',
        'Dining table set',
        'Office chair ergonomic',
        'Bedroom furniture sets',
      ],
      categories: [
        'Living room furniture',
        'Bedroom furniture',
        'Office furniture',
        'Outdoor furniture',
      ],
    };
  }

  const suggestions = {
    autoComplete: [
      `${query} sets`,
      `${query} modern`,
      `${query} sale`,
      `${query} small space`,
    ],
    related: [
      'Complementary accessories',
      'Matching furniture sets',
      'Similar style items',
      'Same room furniture',
    ],
    refinements: [
      `${query} under $1000`,
      `${query} free shipping`,
      `${query} in stock`,
      `${query} highly rated`,
    ],
  };

  return suggestions;
}

async function generateAIPoweredSuggestions(query: string, userId: string | null, limit: number) {
  // Mock AI-powered suggestion generation
  // In production, this would use ML models trained on search patterns
  
  const baseSuggestions = [
    `${query} modern style`,
    `${query} contemporary`,
    `${query} sets`,
    `${query} small space`,
    `${query} under $1000`,
    `${query} free shipping`,
    `${query} highly rated`,
    `${query} in stock now`,
  ];

  // Get user-specific suggestions if user is logged in
  let personalizedSuggestions: string[] = [];
  if (userId) {
    // This would analyze user's search history and preferences
    personalizedSuggestions = [
      `${query} in your style`,
      `${query} in your budget`,
      `${query} similar to your purchases`,
    ];
  }

  // Get trending suggestions
  const trendingSuggestions = [
    `${query} trending now`,
    `${query} popular this week`,
    `${query} customer favorites`,
  ];

  const allSuggestions = [
    ...personalizedSuggestions,
    ...baseSuggestions,
    ...trendingSuggestions,
  ].slice(0, limit);

  return allSuggestions.map(suggestion => ({
    text: suggestion,
    type: personalizedSuggestions.includes(suggestion) 
      ? 'personalized' 
      : trendingSuggestions.includes(suggestion) 
      ? 'trending' 
      : 'standard',
    confidence: Math.random() * 0.3 + 0.7, // Mock confidence score
  }));
}

function detectSearchIntent(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('buy') || lowerQuery.includes('purchase')) {
    return 'purchase_intent';
  }
  if (lowerQuery.includes('compare') || lowerQuery.includes('vs')) {
    return 'comparison';
  }
  if (lowerQuery.includes('review') || lowerQuery.includes('rating')) {
    return 'research';
  }
  if (lowerQuery.includes('cheap') || lowerQuery.includes('affordable') || lowerQuery.includes('budget')) {
    return 'price_conscious';
  }
  if (lowerQuery.includes('best') || lowerQuery.includes('top')) {
    return 'quality_focused';
  }
  
  return 'discovery';
}

function getTopCategories(results: any[]): Array<{ name: string; count: number }> {
  const categoryCount: Record<string, number> = {};
  
  results.forEach(result => {
    const category = result.categoryName || 'Uncategorized';
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });

  return Object.entries(categoryCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}