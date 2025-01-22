// Custom error class for database operations
export class DatabaseError extends Error {
  constructor(
    message: string,
    public operation: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Helper to wrap database errors with context
export function wrapDbError(operation: string, error: unknown): DatabaseError {
  return new DatabaseError(
    error instanceof DatabaseError ? error.message : `Failed to ${operation}`,
    operation,
    error
  )
} 