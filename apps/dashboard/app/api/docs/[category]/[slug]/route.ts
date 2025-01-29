import { NextResponse } from 'next/server';
import { contentMap } from '@autocrm/docs/dist/content';

export async function GET(
  request: Request,
  { params }: { params: { category: string; slug: string } }
) {
  try {
    const path = `${params.category}/${params.slug}`;
    const doc = contentMap[path];

    if (!doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      content: doc.content,
      metadata: doc.metadata
    });
  } catch (error) {
    console.error('Error loading document:', error);
    return NextResponse.json(
      { error: 'Failed to load document' },
      { status: 500 }
    );
  }
} 