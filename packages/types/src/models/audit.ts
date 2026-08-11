import { AuditAction } from '../enums';

/** Audit log entry */
export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  ipAddress?: string;
  metadata?: Record<string, string>;
  timestamp: string;
}
