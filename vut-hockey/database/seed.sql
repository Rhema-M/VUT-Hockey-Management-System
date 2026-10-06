USE vut_hockey;

-- Run this after schema.sql. It creates an admin without placing a password
-- in source control. Generate a hash with:
-- python -c "from werkzeug.security import generate_password_hash; print(generate_password_hash('your-password'))"
-- Then replace the value below before running this file.
INSERT INTO users (name, email, password_hash, role)
VALUES ('VUT Hockey Administrator', 'admin@example.com', 'scrypt:32768:8:1$dxybBaIAxjmBQ3wk$4fb5c9ae902ac2f80311f39b47d845e1226b903d5eebc508f80bd1debeeff1f7f2eb2055d6f2d6060f8b8f58d87463b88840af9b9151903fdcca417227291d1d', 'admin')
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