import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { carts, cartItems, products, productVariants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!userId && !sessionId) {
      return NextResponse.json({
        success: true,
        data: { items: [], total: 0, itemCount: 0 },
      });
    }

    // Find or create cart
    let cart;
    if (userId) {
      cart = await db
        .select()
        .from(carts)
        .where(eq(carts.userId, userId))
        .limit(1);
    } else if (sessionId) {
      cart = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, sessionId))
        .limit(1);
    }

    if (!cart || cart.length === 0) {
      return NextResponse.json({
        success: true,
        data: { items: [], total: 0, itemCount: 0 },
      });
    }

    const cartId = cart[0].id;

    // Fetch cart items with product details
    const items = await db
      .select({
        // Cart item fields
        id: cartItems.id,
        cartId: cartItems.cartId,
        productId: cartItems.productId,
        variantId: cartItems.variantId,
        quantity: cartItems.quantity,
        price: cartItems.price,
        createdAt: cartItems.createdAt,
        updatedAt: cartItems.updatedAt,
        // Product fields
        productName: products.name,
        productSlug: products.slug,
        productImages: products.images,
        productInventory: products.inventory,
        productStatus: products.status,
        // Variant fields (if applicable)
        variantTitle: productVariants.title,
        variantPrice: productVariants.price,
        variantImage: productVariants.image,
        variantOptions: productVariants.options,
        variantInventory: productVariants.inventory,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(productVariants, eq(cartItems.variantId, productVariants.id))
      .where(eq(cartItems.cartId, cartId));

    // Calculate totals
    const total = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // Format the response
    const formattedItems = items.map(item => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
      product: {
        id: item.productId,
        name: item.productName,
        slug: item.productSlug,
        images: item.productImages,
        inventory: item.productInventory,
        status: item.productStatus,
      },
      variant: item.variantId ? {
        id: item.variantId,
        title: item.variantTitle,
        price: item.variantPrice,
        image: item.variantImage,
        options: item.variantOptions,
        inventory: item.variantInventory,
      } : null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        items: formattedItems,
        total,
        itemCount,
      },
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch cart',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!userId && !sessionId) {
      return NextResponse.json(
        { success: false, error: 'User ID or session ID required' },
        { status: 401 }
      );
    }

    // Find cart
    let cart;
    if (userId) {
      cart = await db
        .select()
        .from(carts)
        .where(eq(carts.userId, userId))
        .limit(1);
    } else if (sessionId) {
      cart = await db
        .select()
        .from(carts)
        .where(eq(carts.sessionId, sessionId))
        .limit(1);
    }

    if (!cart || cart.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Cart is already empty',
      });
    }

    // Clear all cart items
    await db
      .delete(cartItems)
      .where(eq(cartItems.cartId, cart[0].id));

    return NextResponse.json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear cart' 
      },
      { status: 500 }
    );
  }
}