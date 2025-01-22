import { SupabaseClient } from '@supabase/supabase-js'
import { listTickets } from '../tickets'
import { DatabaseError } from '../errors'

describe('tickets database operations', () => {
  let mockSupabase: jest.Mocked<SupabaseClient>

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis()
    } as any
  })

  describe('listTickets', () => {
    it('should successfully list tickets with user relationships', async () => {
      // Setup mock data
      const mockTickets = [{
        id: '1',
        title: 'Test Ticket',
        description: 'Test Description',
        status: 'open',
        priority: 'medium',
        customer_email: 'customer@test.com',
        created_by: 'user1',
        assigned_to: 'user2',
        created_by_user: {
          id: 'user1',
          email: 'agent1@test.com',
          name: 'Agent 1',
          role: 'agent'
        },
        assigned_to_user: {
          id: 'user2',
          email: 'agent2@test.com',
          name: 'Agent 2',
          role: 'agent'
        }
      }]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockTickets,
            error: null
          })
        })
      } as any)

      const result = await listTickets(mockSupabase)
      
      expect(result).toEqual(mockTickets)
      expect(mockSupabase.from).toHaveBeenCalledWith('tickets')
      expect(mockSupabase.from().select).toHaveBeenCalledWith(
        '*, created_by_user:users!tickets_created_by_fkey(id,email,name,role,created_at), assigned_to_user:users!tickets_assigned_to_fkey(id,email,name,role,created_at)'
      )
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: {
              message: 'column users_1.id does not exist',
              code: '42703'
            }
          })
        })
      } as any)

      await expect(listTickets(mockSupabase)).rejects.toThrow(DatabaseError)
    })
  })
}) 