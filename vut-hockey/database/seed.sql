USE vut_hockey;

-- Run this after schema.sql. It creates an admin without placing a password
-- in source control. Generate a hash with:
-- python -c "from werkzeug.security import generate_password_hash; print(generate_password_hash('your-password'))"
-- Then replace the value below before running this file.
INSERT INTO users (name, email, password_hash, role)
VALUES ('VUT Hockey Administrator', 'admin@example.com', 'REPLACE_WITH_WERKZEUG_PASSWORD_HASH', 'admin')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO teams (name, category, description)
VALUES
  ('VUT Men''s Hockey', 'Men''s', 'Team information coming soon.'),
  ('VUT Women''s Hockey', 'Women''s', 'Team information coming soon.')
ON DUPLICATE KEY UPDATE category = VALUES(category);

INSERT INTO settings (setting_key, setting_value)
VALUES
  ('club_name', 'VUT Hockey'),
  ('contact_email', ''),
  ('contact_phone', ''),
  ('address', ''),
  ('instagram_url', ''),
  ('facebook_url', '')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);