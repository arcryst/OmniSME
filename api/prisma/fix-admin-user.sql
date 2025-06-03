-- Update admin user with correct password
UPDATE "User"
SET "passwordHash" = '$2a$10$vwKZnWC2S8TrtNkyfumC/ecZfYE1zO65utM1rpBoFpdscSh8UB36y'  -- hashed version of 'admin123'
WHERE "email" = 'admin@demo.com';

-- If no user exists, create one
INSERT INTO "User" (
  "id",
  "email",
  "passwordHash",
  "firstName",
  "lastName",
  "role",
  "organizationId",
  "createdAt",
  "updatedAt"
)
SELECT
  'user_admin3',
  'admin@demo.com',
  '$2a$10$vwKZnWC2S8TrtNkyfumC/ecZfYE1zO65utM1rpBoFpdscSh8UB36y',  -- hashed version of 'admin123'
  'Admin',
  'User',
  'ADMIN',
  'org_default',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "User" WHERE "email" = 'admin@demo.com'
); 