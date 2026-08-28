-- CreateIndex
CREATE INDEX "UserAnswer_userId_answeredAt_idx" ON "UserAnswer"("userId", "answeredAt");

-- CreateIndex
CREATE INDEX "UserAnswer_userId_exerciseId_idx" ON "UserAnswer"("userId", "exerciseId");
