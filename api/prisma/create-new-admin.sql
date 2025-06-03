-- Delete existing users and create a new admin
DELETE FROM "User";

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
) VALUES (
  'user_admin2',
  'admin@demo.com',
  '$2a$10$OIsPrXRqTjjHtxlfqnVpaeHLrSQF0YEnaMq7hgDxvcq1qyom2t2IS',  -- hashed version of 'password123'
  'Admin',
  'User',
  'ADMIN',
  'org_default',
  NOW(),
  NOW()
); 