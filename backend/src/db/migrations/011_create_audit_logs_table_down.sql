-- Migration Rollback: Drop audit_logs table
-- Task: 1.5 audit_logs tablosu için migration oluştur

-- Drop indexes first
DROP INDEX IF EXISTS idx_audit_logs_user_id;
DROP INDEX IF EXISTS idx_audit_logs_timestamp;
DROP INDEX IF EXISTS idx_audit_logs_entity;

-- Drop the table
DROP TABLE IF EXISTS audit_logs;
