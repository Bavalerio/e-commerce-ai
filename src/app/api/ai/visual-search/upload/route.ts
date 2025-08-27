import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileName = `visual-search-${uuidv4()}.${file.type.split('/')[1]}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'visual-search');
    
    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }

    // Save file
    const filePath = join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);

    // Generate public URL
    const publicUrl = `/uploads/visual-search/${fileName}`;

    // Extract image metadata
    const metadata = {
      originalName: file.name,
      size: file.size,
      type: file.type,
      dimensions: await getImageDimensions(buffer),
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        fileName,
        metadata,
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload file',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Extract image dimensions (basic implementation)
async function getImageDimensions(buffer: Buffer): Promise<{ width?: number; height?: number }> {
  try {
    // This is a basic implementation. In production, you'd want to use a proper image processing library
    // like sharp or jimp to extract actual dimensions
    return { width: undefined, height: undefined };
  } catch (error) {
    console.error('Error extracting image dimensions:', error);
    return {};
  }
}

// Handle URL-based image processing
export async function PUT(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Download and process the image
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to download image from URL' },
        { status: 400 }
      );
    }

    const contentType = response.headers.get('content-type');
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!contentType || !allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid image format from URL' },
        { status: 400 }
      );
    }

    // Get file size
    const contentLength = response.headers.get('content-length');
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Image too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Generate unique filename and save locally
    const fileName = `visual-search-url-${uuidv4()}.${contentType.split('/')[1]}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'visual-search');
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }

    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/visual-search/${fileName}`;

    // Extract metadata
    const metadata = {
      originalUrl: imageUrl,
      size: buffer.length,
      type: contentType,
      dimensions: await getImageDimensions(buffer),
      processedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        fileName,
        metadata,
      },
    });
  } catch (error) {
    console.error('Error processing image URL:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process image URL',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}