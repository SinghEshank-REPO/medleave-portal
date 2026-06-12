export type Role = 'STUDENT' | 'ADVISOR' | 'MED_OFFICER' | 'WARDEN' | 'FACULTY' | 'HOD' | 'ADMIN';

export type LeaveCategory = 'FEVER_INFECTION' | 'INJURY' | 'CHRONIC' | 'MENTAL_HEALTH' | 'OTHER';

export type LeaveStatus = 
  | 'PENDING_HEALTH_CENTRE'
  | 'PENDING_WARDEN'
  | 'PENDING_ADVISOR'
  | 'APPROVED'
  | 'REJECTED'
  | 'CLARIFICATION_REQUESTED';

export type DocumentStatus = 'UNVERIFIED' | 'VALID' | 'SUSPICIOUS';

export type CondonationStatus = 'PENDING' | 'CONDONED' | 'REJECTED';

export type NotificationType = 
  | 'APPROVAL_REQUEST'
  | 'CLARIFICATION'
  | 'DECISION'
  | 'ESCALATION'
  | 'COMMENT';
