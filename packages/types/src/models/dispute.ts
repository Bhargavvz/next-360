import { DisputeStatus } from '../enums';

/** Dispute */
export interface Dispute {
  id: string;
  ticketNumber: string;
  orderId: string;
  productId?: string;
  customerId: string;
  sellerId: string;
  assignedAdminId?: string;
  status: DisputeStatus;
  subject: string;
  description: string;
  messages: DisputeMessage[];
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

/** Dispute message */
export interface DisputeMessage {
  id: string;
  disputeId: string;
  senderId: string;
  senderRole: string;
  message: string;
  attachments?: string[];
  createdAt: string;
}

/** Support ticket */
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  subject: string;
  description: string;
  category: string;
  status: string;
  assignedAdminId?: string;
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
}

/** Support message */
export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  attachments?: string[];
  createdAt: string;
}
