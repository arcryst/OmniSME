-- Delete data in the correct order to respect foreign key constraints
DELETE FROM "Approval";
DELETE FROM "License";
DELETE FROM "Request";
DELETE FROM "Software"; 