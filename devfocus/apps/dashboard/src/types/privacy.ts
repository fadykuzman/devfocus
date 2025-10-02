// GDPR-Native Privacy Types for DevFocus
// This file defines all privacy-related types for our GDPR-compliant system

export const DataPurpose = {
  TIMER_SESSIONS: 'timer_sessions',
  USER_PREFERENCES: 'user_preferences',
  ANALYTICS: 'analytics',
  PRODUCTIVITY_INSIGHTS: 'productivity_insights'
} as const;

export type DataPurpose = (typeof DataPurpose)[keyof typeof DataPurpose];

export const LegalBasis = {
  CONSENT: 'consent',
  CONTRACT: 'contract',
  LEGITIMATE_INTEREST: 'legitimate_interest'
} as const;

export type LegalBasis = (typeof LegalBasis)[keyof typeof LegalBasis];

export const ConsentStatus = {
  GRANTED: 'granted',
  WITHDRAWN: 'withdrawn',
  PENDING: 'pending'
} as const;

export type ConsentStatus = (typeof ConsentStatus)[keyof typeof ConsentStatus];

export interface ConsentRecord {
  id: string;
  purpose: DataPurpose;
  status: ConsentStatus;
  legalBasis: LegalBasis;
  grantedAt?: Date;
  withdrawnAt?: Date;
  version: number;
  metadata?: {
    userAgent?: string;
    timestamp: Date;
    method: 'explicit' | 'implied';
  };
}

export interface DataRetentionPolicy {
  purpose: DataPurpose;
  retentionPeriod: number; // in days
  autoDelete: boolean;
  userConfigurable: boolean;
}

export interface PrivacySettings {
  dataRetentionDays: number;
  allowAnalytics: boolean;
  allowProductivityInsights: boolean;
  autoDeleteExpiredData: boolean;
  encryptLocalData: boolean;
}

export interface DataExportRequest {
  id: string;
  requestedAt: Date;
  format: 'JSON' | 'CSV';
  purposes: DataPurpose[];
  status: 'pending' | 'ready' | 'expired';
  downloadUrl?: string;
  expiresAt: Date;
}

export interface DataDeletionRequest {
  id: string;
  requestedAt: Date;
  purposes: DataPurpose[] | 'all';
  status: 'pending' | 'completed';
  completedAt?: Date;
  confirmationRequired: boolean;
}

export interface PrivacyAuditLog {
  id: string;
  timestamp: Date;
  action: 'consent_granted' | 'consent_withdrawn' | 'data_accessed' | 'data_deleted' | 'data_exported';
  purpose?: DataPurpose;
  userId?: string;
  metadata?: Record<string, any>;
}

// Default retention policies per data type
export const DEFAULT_RETENTION_POLICIES: DataRetentionPolicy[] = [
  {
    purpose: DataPurpose.TIMER_SESSIONS,
    retentionPeriod: 30, // 30 days default
    autoDelete: true,
    userConfigurable: true
  },
  {
    purpose: DataPurpose.USER_PREFERENCES,
    retentionPeriod: 365, // 1 year default
    autoDelete: false,
    userConfigurable: true
  },
  {
    purpose: DataPurpose.ANALYTICS,
    retentionPeriod: 90, // 90 days default
    autoDelete: true,
    userConfigurable: true
  },
  {
    purpose: DataPurpose.PRODUCTIVITY_INSIGHTS,
    retentionPeriod: 180, // 6 months default
    autoDelete: true,
    userConfigurable: true
  }
];

// Default privacy settings (privacy-first defaults)
export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  dataRetentionDays: 30, // Conservative default
  allowAnalytics: false, // Opt-in only
  allowProductivityInsights: false, // Opt-in only
  autoDeleteExpiredData: true, // Privacy-first
  encryptLocalData: true // Always encrypt
};

export interface GDPRRights {
  rightToAccess: boolean; // Article 15
  rightToRectification: boolean; // Article 16
  rightToErasure: boolean; // Article 17 - "Right to be forgotten"
  rightToRestriction: boolean; // Article 18
  rightToDataPortability: boolean; // Article 20
  rightToObject: boolean; // Article 21
}

// All GDPR rights are enabled by default
export const ENABLED_GDPR_RIGHTS: GDPRRights = {
  rightToAccess: true,
  rightToRectification: true,
  rightToErasure: true,
  rightToRestriction: true,
  rightToDataPortability: true,
  rightToObject: true
};