-- ============================================================
-- LeakLess Database Schema
-- MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS leakless_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE leakless_db;

-- ────────────────────────────────────────────────────────────
-- SUBSCRIPTIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id              CHAR(36)        NOT NULL,
  name            VARCHAR(100)    NOT NULL,
  cost            DECIMAL(10, 2)  NOT NULL DEFAULT 0.00,
  billing_cycle   ENUM('daily','weekly','monthly','quarterly','yearly','lifetime')
                                  NOT NULL DEFAULT 'monthly',
  category        VARCHAR(50)     NULL,
  renewal_date    DATE            NULL,
  is_trial        TINYINT(1)      NOT NULL DEFAULT 0,
  trial_end_date  DATE            NULL,
  last_used_date  DATE            NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  -- Speed up renewal-date queries (dashboard upcoming renewals)
  INDEX idx_subscriptions_renewal_date   (renewal_date),

  -- Speed up trial filtering
  INDEX idx_subscriptions_is_trial       (is_trial),

  -- Speed up trial end date queries
  INDEX idx_subscriptions_trial_end_date (trial_end_date),

  -- Speed up category grouping
  INDEX idx_subscriptions_category       (category),

  -- Speed up billing cycle aggregation
  INDEX idx_subscriptions_billing_cycle  (billing_cycle)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id              CHAR(36)        NOT NULL,
  subscription_id CHAR(36)        NOT NULL,
  type            ENUM(
                    'renewal_reminder',
                    'trial_expiring',
                    'payment_due',
                    'subscription_inactive',
                    'health_alert'
                  )               NOT NULL,
  message         TEXT            NOT NULL,
  is_read         TINYINT(1)      NOT NULL DEFAULT 0,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  -- Foreign key — cascade delete notifications when subscription is removed
  CONSTRAINT fk_notifications_subscription
    FOREIGN KEY (subscription_id)
    REFERENCES subscriptions (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  -- Speed up notification feed queries
  INDEX idx_notifications_subscription_id (subscription_id),

  -- Speed up unread count queries
  INDEX idx_notifications_is_read         (is_read),

  -- Speed up sorting by creation time
  INDEX idx_notifications_created_at      (created_at DESC),

  -- Composite index for common query: unread by subscription
  INDEX idx_notifications_sub_unread      (subscription_id, is_read)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
