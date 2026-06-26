CREATE TABLE "TripJoinRequest" (
    "tripId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripJoinRequest_pkey" PRIMARY KEY ("tripId","userId")
);

CREATE INDEX "TripJoinRequest_userId_idx" ON "TripJoinRequest"("userId");

ALTER TABLE "TripJoinRequest" ADD CONSTRAINT "TripJoinRequest_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TripJoinRequest" ADD CONSTRAINT "TripJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
