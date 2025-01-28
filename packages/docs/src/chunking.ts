import { DocumentChunk, ChunkingOptions, DocumentMetadata } from './types';

const DEFAULT_OPTIONS: ChunkingOptions = {
  maxChunkSize: 1000,  // Increased to allow for natural paragraph groupings
  minChunkSize: 100,   // Minimum size to prevent tiny chunks
  overlapSize: 50      // Overlap size
};

export class DocumentChunker {
  private options: ChunkingOptions;

  constructor(options: Partial<ChunkingOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  *chunkDocumentGenerator(
    content: string,
    metadata: DocumentMetadata,
    startLine: number = 1
  ): Generator<DocumentChunk> {
    // Pre-process content to normalize newlines and remove excessive whitespace
    content = content.replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')  // Normalize multiple newlines to double newlines
      .trim();

    // Split content into paragraphs
    const paragraphs = content.split('\n\n');
    let currentChunk: string[] = [];
    let currentSize = 0;
    let currentLine = startLine;
    let lineCount = 0;

    for (const paragraph of paragraphs) {
      const paragraphSize = paragraph.length;
      const paragraphLines = (paragraph.match(/\n/g) || []).length + 1;

      // If adding this paragraph would exceed maxChunkSize and we have content,
      // yield the current chunk
      if (currentSize + paragraphSize > this.options.maxChunkSize && currentChunk.length > 0) {
        const chunkContent = currentChunk.join('\n\n').trim();
        if (this.isValidChunk(chunkContent)) {
          yield {
            content: chunkContent,
            metadata,
            startLine: currentLine,
            endLine: currentLine + lineCount
          };
        }
        
        // Start new chunk with overlap if needed
        const lastParagraph = currentChunk[currentChunk.length - 1];
        currentChunk = lastParagraph ? [lastParagraph] : [];
        currentSize = lastParagraph ? lastParagraph.length : 0;
        currentLine += lineCount - (lastParagraph ? (lastParagraph.match(/\n/g) || []).length + 1 : 0);
        lineCount = lastParagraph ? (lastParagraph.match(/\n/g) || []).length + 1 : 0;
      }

      // Add paragraph to current chunk
      currentChunk.push(paragraph);
      currentSize += paragraphSize;
      lineCount += paragraphLines;

      // If we've exceeded maxChunkSize with a single paragraph, we need to force split it
      if (currentSize > this.options.maxChunkSize) {
        const forcedChunks = this.forceSplitLongParagraph(currentChunk.join('\n\n'));
        for (const chunk of forcedChunks) {
          const chunkLineCount = (chunk.match(/\n/g) || []).length + 1;
          if (this.isValidChunk(chunk)) {
            yield {
              content: chunk,
              metadata,
              startLine: currentLine,
              endLine: currentLine + chunkLineCount
            };
          }
          currentLine += chunkLineCount;
        }
        currentChunk = [];
        currentSize = 0;
        lineCount = 0;
      }
    }

    // Yield any remaining content
    if (currentChunk.length > 0) {
      const chunkContent = currentChunk.join('\n\n').trim();
      if (this.isValidChunk(chunkContent)) {
        yield {
          content: chunkContent,
          metadata,
          startLine: currentLine,
          endLine: currentLine + lineCount
        };
      }
    }
  }

  private isValidChunk(content: string): boolean {
    const trimmed = content.trim();
    return trimmed.length >= this.options.minChunkSize &&
           /[a-zA-Z0-9]/.test(trimmed) &&
           !/^[\s\p{P}]+$/u.test(trimmed);
  }

  private forceSplitLongParagraph(text: string): string[] {
    const chunks: string[] = [];
    let currentPosition = 0;

    while (currentPosition < text.length) {
      const maxEnd = Math.min(currentPosition + this.options.maxChunkSize, text.length);
      let endPosition = this.findBreakPoint(text, currentPosition, maxEnd);
      
      if (endPosition <= currentPosition) {
        endPosition = maxEnd;
      }

      const chunk = text.slice(currentPosition, endPosition).trim();
      if (this.isValidChunk(chunk)) {
        chunks.push(chunk);
      }

      currentPosition = endPosition;
    }

    return chunks;
  }

  private findBreakPoint(text: string, start: number, end: number): number {
    // Look for sentence breaks first
    const sentenceBreak = text.lastIndexOf('. ', end);
    if (sentenceBreak > start && !this.isAbbreviation(text, sentenceBreak)) {
      return sentenceBreak + 1;
    }

    // Then look for other punctuation
    const punctuationBreak = text.slice(start, end).search(/[.!?:]\s/);
    if (punctuationBreak > 0) {
      return start + punctuationBreak + 1;
    }

    // Finally, look for word breaks
    const lastSpace = text.lastIndexOf(' ', end);
    if (lastSpace > start) return lastSpace;

    return end;
  }

  private isAbbreviation(text: string, position: number): boolean {
    const commonAbbreviations = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Sr.', 'Jr.', 'vs.', 'i.e.', 'e.g.'];
    const beforePeriod = text.slice(Math.max(0, position - 10), position + 1);
    return commonAbbreviations.some(abbr => beforePeriod.endsWith(abbr));
  }

  // Keep the original method for backward compatibility
  chunkDocument(
    content: string,
    metadata: DocumentMetadata,
    startLine: number = 1
  ): DocumentChunk[] {
    return Array.from(this.chunkDocumentGenerator(content, metadata, startLine));
  }
} 