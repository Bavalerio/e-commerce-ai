import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/api/dummyjson';

interface RouteParams {
  slug: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Product slug is required' },
        { status: 400 }
      );
    }

    // Fetch product from DummyJSON API
    const product = await getProduct(slug);

    // Build the response with additional category data
    const response = {
      ...product,
      category: {
        id: product.categoryId,
        name: product.categoryId?.replace('cat-', '').replace(/-/g, ' '),
        slug: product.categoryId?.replace('cat-', ''),
        description: `Products in ${product.categoryId?.replace('cat-', '').replace(/-/g, ' ')} category`,
        imageUrl: null,
      },
      variants: [], // DummyJSON doesn't provide variants, but we maintain the structure
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    
    if (error instanceof Error && error.message === 'Product not found') {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch product',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}