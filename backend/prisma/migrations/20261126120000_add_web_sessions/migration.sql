CREATE TABLE "WebSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WebSession_expiresAt_idx" ON "WebSession"("expiresAt");
CREATE INDEX "WebSession_userId_idx" ON "WebSession"("userId");

ALTER TABLE "WebSession"
ADD CONSTRAINT "WebSession_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
