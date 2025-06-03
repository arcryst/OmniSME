-- Create initial organization
INSERT INTO "Organization" (
  "id",
  "name",
  "domain",
  "createdAt",
  "updatedAt"
) VALUES (
  'org_default',
  'Demo Organization',
  'demo.com',
  NOW(),
  NOW()
); 