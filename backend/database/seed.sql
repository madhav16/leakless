-- ============================================================
-- LeakLess Seed Data — Development Only
-- Run AFTER schema.sql
-- ============================================================

USE leakless_db;

-- ────────────────────────────────────────────────────────────
-- SUBSCRIPTIONS
-- ────────────────────────────────────────────────────────────
INSERT INTO subscriptions
  (id, name, cost, billing_cycle, category, renewal_date, is_trial, trial_end_date)
VALUES
  ('a1b2c3d4-0001-0000-0000-000000000001', 'Netflix',       15.99, 'monthly',   'Entertainment', '2026-06-15', 0, NULL),
  ('a1b2c3d4-0002-0000-0000-000000000002', 'Spotify',        9.99, 'monthly',   'Music',         '2026-06-20', 0, NULL),
  ('a1b2c3d4-0003-0000-0000-000000000003', 'Adobe CC',      54.99, 'monthly',   'Design',        '2026-06-01', 0, NULL),
  ('a1b2c3d4-0004-0000-0000-000000000004', 'GitHub Pro',     4.00, 'monthly',   'Development',   '2026-06-25', 0, NULL),
  ('a1b2c3d4-0005-0000-0000-000000000005', 'Figma',         15.00, 'monthly',   'Design',        '2026-07-01', 0, NULL),
  ('a1b2c3d4-0006-0000-0000-000000000006', 'Linear Pro',     8.00, 'monthly',   'Productivity',  '2026-06-10', 0, NULL),
  ('a1b2c3d4-0007-0000-0000-000000000007', 'Notion Plus',    8.00, 'monthly',   'Productivity',  '2026-06-18', 0, NULL),
  ('a1b2c3d4-0008-0000-0000-000000000008', 'AWS Free Tier',  0.00, 'monthly',   'Cloud',         '2026-06-30', 1, '2026-06-30'),
  ('a1b2c3d4-0009-0000-0000-000000000009', 'Vercel Pro',    20.00, 'monthly',   'Development',   '2026-06-05', 0, NULL),
  ('a1b2c3d4-0010-0000-0000-000000000010', 'Loom Business', 12.50, 'monthly',   'Productivity',  '2026-06-12', 1, '2026-06-05');

-- ────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ────────────────────────────────────────────────────────────
INSERT INTO notifications
  (id, subscription_id, type, message, is_read)
VALUES
  ('b1b2c3d4-0001-0000-0000-000000000001', 'a1b2c3d4-0003-0000-0000-000000000003', 'renewal_reminder',     'Adobe CC renews on June 1st for $54.99.',                    0),
  ('b1b2c3d4-0002-0000-0000-000000000002', 'a1b2c3d4-0009-0000-0000-000000000009', 'renewal_reminder',     'Vercel Pro renews in 5 days.',                               0),
  ('b1b2c3d4-0003-0000-0000-000000000003', 'a1b2c3d4-0008-0000-0000-000000000008', 'trial_expiring',       'AWS Free Tier trial ends June 30th. Review before charges.', 0),
  ('b1b2c3d4-0004-0000-0000-000000000004', 'a1b2c3d4-0010-0000-0000-000000000010', 'trial_expiring',       'Loom Business trial ends in 5 days.',                        0),
  ('b1b2c3d4-0005-0000-0000-000000000005', 'a1b2c3d4-0006-0000-0000-000000000006', 'subscription_inactive','Linear Pro hasn''t been used in 46 days.',                   1),
  ('b1b2c3d4-0006-0000-0000-000000000006', 'a1b2c3d4-0010-0000-0000-000000000010', 'subscription_inactive','Loom Business hasn''t been used in 91 days.',                1);
