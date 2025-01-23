// Custom error class for database operations
export class DatabaseError extends Error {
  constructor(
    message: string,
    public operation: string,
    public originalError?: unknown
  ) {
    // Include operation in the message for better context
    super(`Database error in ${operation}: ${message}${originalError ? ` - ${getErrorDetails(originalError)}` : ''}`)
    this.name = 'DatabaseError'
  }

  toString() {
    return `${this.name}: ${this.message}`
  }
}

// Helper to extract error details from various error types
function getErrorDetails(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'object' && error !== null) {
    // Handle Supabase PostgrestError
    if ('message' in error && 'details' in error && 'code' in error) {
      return `${error.message} (Code: ${error.code}, Details: ${error.details})`
    }
    return JSON.stringify(error)
  }
  return String(error)
}

// Helper to wrap database errors with context
export function wrapDbError(operation: string, error: unknown): DatabaseError {
  if (error instanceof DatabaseError) {
    return error // Don't wrap already wrapped errors
  }
  
  let message = `Failed to ${operation}`
  
  // Add specific error messages for common cases
  if (error instanceof Error) {
    if (error.message.includes('foreign key constraint')) {
      message = 'Referenced record does not exist'
    } else if (error.message.includes('unique constraint')) {
      message = 'Record already exists'
    } else if (error.message.includes('not-found')) {
      message = 'Record not found'
    }
  }

  return new DatabaseError(message, operation, error)
} 