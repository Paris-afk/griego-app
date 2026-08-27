-- CreateTable
CREATE TABLE "AlphabetLetter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "languageId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "uppercase" TEXT NOT NULL,
    "lowercase" TEXT NOT NULL,
    "nameGreek" TEXT NOT NULL,
    "nameTranslit" TEXT NOT NULL,
    "ipa" TEXT NOT NULL,
    "equivalentEs" TEXT NOT NULL,
    "transferencia" TEXT NOT NULL,
    "note" TEXT,
    CONSTRAINT "AlphabetLetter_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AlphabetLetter_languageId_order_key" ON "AlphabetLetter"("languageId", "order");
