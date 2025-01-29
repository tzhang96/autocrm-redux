import { NextResponse } from 'next/server';
import { contentMap, DocContent } from '@autocrm/docs/dist/content';

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const path = `${params.category}/index` as keyof typeof contentMap;
    const doc = contentMap[path] as DocContent | undefined;

    if (!doc) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      content: doc.content,
      metadata: doc.metadata
    });
  } catch (error) {
    console.error('Error loading category:', error);
    return NextResponse.json(
      { error: 'Failed to load category' },
      { status: 500 }
    );
  }
} 