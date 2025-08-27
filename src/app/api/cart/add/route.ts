import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { carts, cartItems, products, productVariants } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { productId, variantId, quantity = 1, sessionId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!userId && !sessionId) {
      return NextResponse.json(
        { success: false, error: 'User authentication or session ID required' },
        { status: 401 }
      );
    }

    // Verify product exists and is available
    const product = await db
      .select({
        id: products.id,
        price: products.price,
        inventory: products.inventory,
        status: products.status,
        trackInventory: products.trackInventory,
      })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const productData = product[0];

    if (productData.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Product is not available' },
        { status: 400 }
      );
    }

    let itemPrice = productData.price;
    let availableInventory = productData.inventory;

    // Handle variant if specified
    if (variantId) {
      const variant = await db
        .select({
          id: productVariants.id,
          price: productVariants.price,
          inventory: productVariants.inventory,
        })
        .from(productVariants)
        .where(and(
          eq(productVariants.id, variantId),
          eq(productVariants.productId, productId)
        ))
        .limit(1);

      if (variant.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Product variant not found' },
          { status: 404 }
        );
      }

      itemPrice = variant[0].price;
      availableInventory = variant[0].inventory;
    }

    // Check inventory if tracking is enabled
    if (productData.trackInventory && availableInventory < quantity) {
      return NextResponse.json(
        { success: false, error: 'Insufficient inventory' },
        { status: 400 }
      );
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

    let cartId;
    if (!cart || cart.length === 0) {
      // Create new cart
      const newCart = await db
        .insert(carts)
        .values({
          id: randomUUID(),
          userId: userId || null,
          sessionId: sessionId || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: carts.id });
      
      cartId = newCart[0].id;
    } else {
      cartId = cart[0].id;
    }

    // Check if item already exists in cart
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(and(
        eq(cartItems.cartId, cartId),
        eq(cartItems.productId, productId),
        variantId ? eq(cartItems.variantId, variantId) : isNull(cartItems.variantId)
      ))
      .limit(1);

    if (existingItem.length > 0) {
      // Update existing item quantity
      const newQuantity = existingItem[0].quantity + quantity;
      
      // Check inventory again for the new total quantity
      if (productData.trackInventory && availableInventory < newQuantity) {
        return NextResponse.json(
          { success: false, error: 'Insufficient inventory for requested quantity' },
          { status: 400 }
        );
      }

      await db
        .update(cartItems)
        .set({
          quantity: newQuantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem[0].id));

      const updatedItem = { ...existingItem[0], quantity: newQuantity };

      return NextResponse.json({
        success: true,
        data: updatedItem,
        message: 'Cart item updated successfully',
      });
    } else {
      // Add new item to cart
      const newItem = await db
        .insert(cartItems)
        .values({
          id: randomUUID(),
          cartId,
          productId,
          variantId: variantId || null,
          quantity,
          price: itemPrice,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return NextResponse.json({
        success: true,
        data: newItem[0],
        message: 'Item added to cart successfully',
      });
    }
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add item to cart',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}