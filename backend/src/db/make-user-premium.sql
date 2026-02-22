-- Make a user premium by email
-- Usage: Replace 'your-email@example.com' with your actual email

UPDATE users 
SET role = 'premium' 
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, name, role, balance, created_at 
FROM users 
WHERE email = 'your-email@example.com';
