import type { TicketActions } from './types';
import { Database } from '@autocrm/core';
type Ticket = Database['public']['Tables']['tickets']['Row'];
export declare const sendMessage: TicketActions['sendMessage'];
export declare const updateTicketStatus: TicketActions['updateTicketStatus'];
export declare const updateTicketPriority: TicketActions['updateTicketPriority'];
export declare const assignTicket: TicketActions['assignTicket'];
export declare const getAvailableAgents: TicketActions['getAvailableAgents'];
export declare function getTicket(ticketId: string): Promise<any>;
export declare function updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<{
    success: boolean;
}>;
export declare function addMessage(ticketId: string, content: string): Promise<{
    success: boolean;
}>;
export {};
//# sourceMappingURL=actions.d.ts.map