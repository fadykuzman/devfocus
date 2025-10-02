# GDPR-Native Implementation Guide for DevFocus

## Phase 1: Foundation Implementation Guide

This document provides detailed implementation guidance for adding GDPR-native architecture to the existing DevFocus timer application.

## 1. Consent Management System

### 1.1 Core Consent Types Definition

You'll need to create TypeScript types that define the different consent purposes:

**Required Data Purposes:**
- `TIMER_SESSIONS` - Basic timer functionality (focus/break sessions)
- `USER_PREFERENCES` - Settings like timer durations, themes
- `ANALYTICS` - Optional usage statistics (opt-in only)
- `PRODUCTIVITY_INSIGHTS` - Optional productivity analysis (opt-in only)

**Legal Basis Types:**
- `CONSENT` - For optional features like analytics
- `CONTRACT` - For core timer functionality
- `LEGITIMATE_INTEREST` - For essential app operations

**Consent Status:**
- `GRANTED` - User has explicitly agreed
- `WITHDRAWN` - User has revoked consent
- `PENDING` - Awaiting user decision

### 1.2 Consent Record Structure

Each consent record should track:
- Unique ID and timestamp
- Purpose and legal basis
- Grant/withdrawal dates
- User agent and method (explicit/implied)
- Version number for consent changes

### 1.3 Default Privacy Settings

Implement privacy-first defaults:
- Analytics: `false` (opt-in only)
- Productivity insights: `false` (opt-in only)
- Data retention: 30 days (conservative)
- Auto-delete: `true`
- Local encryption: `true`

## 2. Privacy-First Local Storage Layer

### 2.1 Encrypted Storage Wrapper

Create a storage abstraction that:
- Encrypts all data before storing in localStorage
- Uses AES-256-GCM encryption with user-derived keys
- Automatically expires data based on retention policies
- Provides atomic operations for consistency

### 2.2 Data Structure Design

**Storage Schema:**
```
devfocus_encrypted_data: {
  sessions: [...],           // Timer session data
  preferences: {...},        // User settings
  consent: [...],           // Consent records
  privacy_settings: {...},   // Privacy configuration
  audit_log: [...]          // Privacy action log
}
```

### 2.3 Automatic Data Expiration

Implement background process that:
- Runs on app startup and periodically
- Checks data retention policies
- Automatically purges expired data
- Logs deletion actions for audit

## 3. Session Tracking with Privacy Controls

### 3.1 Privacy-Aware Session Data

Only collect minimal necessary data:
- Session duration (number)
- Timer mode (focus/break)
- Start/end timestamps
- Completion status (boolean)

**Never collect:**
- Specific file names or paths
- User-identifiable information
- Detailed activity patterns (without explicit consent)

### 3.2 Consent-Driven Data Collection

```typescript
// Example implementation approach
const collectSessionData = (sessionData: SessionData) => {
  const hasSessionConsent = consentManager.hasConsent(DataPurpose.TIMER_SESSIONS);
  const hasAnalyticsConsent = consentManager.hasConsent(DataPurpose.ANALYTICS);

  if (hasSessionConsent) {
    storageManager.store('sessions', sessionData.minimal);
  }

  if (hasAnalyticsConsent) {
    storageManager.store('analytics', sessionData.aggregated);
  }
};
```

## 4. Privacy Dashboard UI

### 4.1 Dashboard Components

Create React components for:

**Privacy Overview:**
- Current data storage summary
- Active consents display
- Data retention status
- Storage usage metrics

**Consent Management:**
- Toggle switches for each data purpose
- Clear explanations of what each consent enables
- Immediate effect when toggled
- Consent history view

**Data Control:**
- Export data button (JSON/CSV formats)
- Delete specific data types
- Complete account deletion
- Retention period settings

### 4.2 UI/UX Principles

- Privacy controls as features, not barriers
- Clear, non-technical language
- Immediate visual feedback
- Progressive disclosure (advanced options hidden initially)
- Mobile-responsive design

## 5. Data Retention and Automatic Purging

### 5.1 Retention Policy Engine

Implement configurable retention policies:

**Default Policies:**
- Timer sessions: 30 days
- User preferences: 365 days
- Analytics data: 90 days
- Audit logs: 7 years (legal requirement)

**User Configuration:**
- Allow users to adjust retention periods
- Minimum retention for essential data
- Immediate deletion option
- Bulk retention policy changes

### 5.2 Automatic Purging Implementation

```typescript
// Implementation guidance
const purgeExpiredData = () => {
  const policies = getRetentionPolicies();
  const now = new Date();

  policies.forEach(policy => {
    if (policy.autoDelete) {
      const cutoffDate = new Date(now.getTime() - (policy.retentionPeriod * 24 * 60 * 60 * 1000));
      deleteDataOlderThan(policy.purpose, cutoffDate);
      auditLog.record('auto_deletion', { purpose: policy.purpose, cutoffDate });
    }
  });
};
```

## 6. Data Export/Import Functionality

### 6.1 Export Implementation

**Export Formats:**
- JSON: Complete structured data
- CSV: Tabular data for analysis
- Human-readable: Privacy report format

**Export Process:**
1. User requests export via privacy dashboard
2. System generates export file based on current consents
3. Temporary download link created (expires after 24 hours)
4. User downloads data
5. Export request logged for audit

### 6.2 Import/Migration Support

For future self-hosted backend:
- Validate import data structure
- Respect consent settings during import
- Merge with existing data safely
- Audit trail for imported data

## 7. Privacy Policy and Consent UI

### 7.1 First-Run Experience

**Initial Consent Flow:**
1. Welcome screen explaining privacy-first approach
2. Essential vs optional data collection explanation
3. Granular consent checkboxes
4. Clear "Start Using DevFocus" button
5. Link to full privacy policy

### 7.2 Ongoing Consent Management

**Consent Change Flow:**
- Settings menu with "Privacy & Data" section
- Toggle switches for each data purpose
- Immediate effect with confirmation dialog
- Impact explanation ("Disabling this will...")

### 7.3 Privacy Policy Content

**Required Sections:**
- What data we collect and why
- How long we keep it
- Your rights and how to exercise them
- Contact information for privacy questions
- Changes to privacy policy process

## 8. Integration with Existing Timer

### 8.1 Migration Strategy

**Phase 1 Integration:**
1. Add consent check before timer state persistence
2. Wrap existing localStorage calls with encrypted storage
3. Add privacy dashboard as new settings section
4. Implement data export for existing session data

### 8.2 Backward Compatibility

- Migrate existing localStorage data to encrypted format
- Preserve user's current timer sessions
- Default to privacy-friendly settings
- Prompt for consent on first launch after update

### 8.3 Feature Degradation

When consent is withdrawn:
- Timer still works but doesn't save sessions
- Statistics become unavailable
- Clear user feedback about reduced functionality
- Easy path to re-enable features

## 9. Testing Strategy

### 9.1 Privacy Testing Scenarios

**Consent Flow Testing:**
- First-run consent experience
- Consent withdrawal and re-granting
- Feature degradation when consent withdrawn
- Data deletion verification

**Storage Testing:**
- Encryption/decryption integrity
- Automatic data expiration
- Export/import functionality
- Storage quota handling

**Edge Cases:**
- Browser private/incognito mode
- LocalStorage disabled
- Storage quota exceeded
- Corrupted encrypted data

### 9.2 GDPR Compliance Testing

- Verify all GDPR rights are implemented
- Test data deletion completeness
- Validate consent withdrawal effects
- Audit log completeness
- Privacy policy accuracy

## 10. Performance Considerations

### 10.1 Encryption Performance

- Use Web Crypto API for hardware acceleration
- Cache encryption keys during session
- Lazy-load privacy components
- Optimize storage operations

### 10.2 Storage Optimization

- Compress data before encryption
- Implement storage cleanup routines
- Monitor localStorage usage
- Graceful degradation when storage full

## Implementation Priority

1. **Week 1-2**: Core types and consent management
2. **Week 3-4**: Encrypted storage layer and data retention
3. **Week 5-6**: Privacy dashboard UI components
4. **Week 7-8**: Integration with existing timer and testing

This implementation guide provides the foundation for Phase 1 of your GDPR-native architecture while maintaining the simplicity of your current timer application.