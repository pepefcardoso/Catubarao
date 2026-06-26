

-- Add the column as nullable first to avoid default sequence assignment
ALTER TABLE "members" ADD COLUMN "memberNumber" INTEGER;

-- Populate existing rows sequentially based on createdAt ASC
WITH NumberedMembers AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as num
  FROM "members"
)
UPDATE "members"
SET "memberNumber" = NumberedMembers.num
FROM NumberedMembers
WHERE "members".id = NumberedMembers.id;

-- Create the sequence
CREATE SEQUENCE members_memberNumber_seq OWNED BY "members"."memberNumber";

-- Set the sequence to start from the max memberNumber + 1
SELECT setval('members_memberNumber_seq', coalesce(max("memberNumber"), 0) + 1, false) FROM "members";

-- Alter column to use the sequence and make it NOT NULL
ALTER TABLE "members" ALTER COLUMN "memberNumber" SET DEFAULT nextval('members_memberNumber_seq');
ALTER TABLE "members" ALTER COLUMN "memberNumber" SET NOT NULL;

-- Add the unique constraint
CREATE UNIQUE INDEX "members_memberNumber_key" ON "members"("memberNumber");
