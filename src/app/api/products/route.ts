import { NextRequest, NextResponse } from 'next/server';
import { ProductFilterOptions } from '@/types';
import { getProducts, searchProducts } from '@/lib/api/dummyjson';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const featured = searchParams.get('featured');
    const inStock = searchParams.get('inStock');
    const sortBy = searchParams.get('sortBy') as ProductFilterOptions['sortBy'] || 'created';
    const sortOrder = searchParams.get('sortOrder') as ProductFilterOptions['sortOrder'] || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filter options
    const filters: ProductFilterOptions = {
      categories: category ? [category] : undefined,
      priceRange: (minPrice || maxPrice) ? {
        min: minPrice ? parseFloat(minPrice) : 0,
        max: maxPrice ? parseFloat(maxPrice) : Infinity,
      } : undefined,
      featured: featured === 'true' ? true : undefined,
      inStock: inStock === 'true' ? true : undefined,
      sortBy,
      sortOrder,
      limit,
      offset,
    };

    let result;
    
    if (search) {
      // Use search endpoint if search query is provided
      result = await searchProducts(search, { limit, skip: offset });
    } else {
      // Use regular products endpoint with filters
      result = await getProducts(filters);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Mock data for development - we'll seed the database later
export async function POST(request: NextRequest) {
  try {
    // This would normally create a new product
    // For now, return mock data
    return NextResponse.json({
      success: true,
      message: 'Product creation not implemented yet',
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create product' 
      },
      { status: 500 }
    );
  }
}