-- Migration: Create audit_logs table
-- Task: 1.5 audit_logs tablosu için migration oluştur
-- Requirements: 11.4, 14.5, 19.1, 19.2

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('investment', 'trade', 'balance', 'position')),
  entity_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  old_state JSONB,
  new_state JSONB,
  user_id UUID,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create composite index on entity_type and entity_id for entity audit queries
-- Requirement 19.1: Log every investment state change
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Create index on timestamp for time-based queries
-- Requirement 19.3: Maintain immutable audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Create index on user_id for user activity audit
-- Requirement 14.5: Log all investment operations with user_id
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Add comments to table and columns
COMMENT ON TABLE audit_logs IS 'Immutable audit trail for all system operations (7 year retention)';
COMMENT ON COLUMN audit_logs.id IS 'Unique identifier for the audit log entry';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity: investment, trade, balance, or position';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID of the entity being audited';
COMMENT ON COLUMN audit_logs.action IS 'Action performed (e.g., created, updated, deleted, state_change)';
COMMENT ON COLUMN audit_logs.old_state IS 'Previous state of the entity (JSON)';
COMMENT ON COLUMN audit_logs.new_state IS 'New state of the entity (JSON)';
COMMENT ON COLUMN audit_logs.user_id IS 'User who triggered the action (null for system actions)';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the user (for security audit)';
COMMENT ON COLUMN audit_logs.timestamp IS 'Timestamp when action occurred';
