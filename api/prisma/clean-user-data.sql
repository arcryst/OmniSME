-- Delete user-specific data for the current user
DELETE FROM "Approval" WHERE "approverId" = (
  SELECT "id" FROM "User" 
  WHERE "email" = CURRENT_USER
);

DELETE FROM "License" WHERE "userId" = (
  SELECT "id" FROM "User" 
  WHERE "email" = CURRENT_USER
);

DELETE FROM "Request" WHERE "userId" = (
  SELECT "id" FROM "User" 
  WHERE "email" = CURRENT_USER
); 