-- ============================================================
-- Next360 — V7
-- In-app account deletion.
--
-- Both the App Store and Google Play require an app that lets users create an
-- account to also let them delete it from inside the app. Orders must survive
-- for tax and consumer-protection reasons, so deletion anonymises the person
-- rather than dropping the row.
-- ============================================================

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deletion_reason VARCHAR(500);

-- Anonymised accounts keep a row (orders reference it) but must never be
-- reachable by sign-in, so the phone is scrambled on deletion. Partial index
-- keeps lookups on live accounts fast.
CREATE INDEX IF NOT EXISTS ix_users_active_phone
    ON users (phone) WHERE deleted_at IS NULL;
