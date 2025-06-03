-- Create admin user with password hash for 'admin123'
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
  'user_admin',
  'admin@demo.com',
  '$2a$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33P3x/T8zQz7Tk5hWyDBP2.',  -- hashed version of 'admin123'
  'Admin',
  'User',
  'ADMIN',
  'org_default',
  NOW(),
  NOW()
); 