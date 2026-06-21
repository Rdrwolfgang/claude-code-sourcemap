-- CreateTable
CREATE TABLE "Judge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "court" TEXT NOT NULL,
    "appointedDate" DATETIME,
    "party" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "bio" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Defendant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "dob" DATETIME,
    "race" TEXT,
    "sex" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT NOT NULL DEFAULT 'TN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseNumber" TEXT NOT NULL,
    "court" TEXT NOT NULL,
    "county" TEXT NOT NULL DEFAULT 'Shelby',
    "state" TEXT NOT NULL DEFAULT 'TN',
    "filedDate" DATETIME,
    "dispositionDate" DATETIME,
    "status" TEXT NOT NULL,
    "judgeId" TEXT,
    "prosecutorName" TEXT,
    "daOffice" TEXT,
    "isHighProfile" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Case_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseDefendant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "defendantId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Defendant',
    CONSTRAINT "CaseDefendant_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseDefendant_defendantId_fkey" FOREIGN KEY ("defendantId") REFERENCES "Defendant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Charge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "statute" TEXT,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "isViolent" BOOLEAN NOT NULL DEFAULT false,
    "isDrugRelated" BOOLEAN NOT NULL DEFAULT false,
    "disposition" TEXT,
    "sentence" TEXT,
    "bondAmount" REAL,
    "bondType" TEXT,
    CONSTRAINT "Charge_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Hearing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "hearingDate" DATETIME NOT NULL,
    "hearingType" TEXT NOT NULL,
    "outcome" TEXT,
    "notes" TEXT,
    CONSTRAINT "Hearing_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WatchlistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userEmail" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DataSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastChecked" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Judge_court_idx" ON "Judge"("court");

-- CreateIndex
CREATE INDEX "Judge_name_idx" ON "Judge"("name");

-- CreateIndex
CREATE INDEX "Defendant_lastName_firstName_idx" ON "Defendant"("lastName", "firstName");

-- CreateIndex
CREATE UNIQUE INDEX "Case_caseNumber_key" ON "Case"("caseNumber");

-- CreateIndex
CREATE INDEX "Case_caseNumber_idx" ON "Case"("caseNumber");

-- CreateIndex
CREATE INDEX "Case_judgeId_idx" ON "Case"("judgeId");

-- CreateIndex
CREATE INDEX "Case_court_idx" ON "Case"("court");

-- CreateIndex
CREATE INDEX "Case_filedDate_idx" ON "Case"("filedDate");

-- CreateIndex
CREATE INDEX "CaseDefendant_caseId_idx" ON "CaseDefendant"("caseId");

-- CreateIndex
CREATE INDEX "CaseDefendant_defendantId_idx" ON "CaseDefendant"("defendantId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseDefendant_caseId_defendantId_key" ON "CaseDefendant"("caseId", "defendantId");

-- CreateIndex
CREATE INDEX "Charge_caseId_idx" ON "Charge"("caseId");

-- CreateIndex
CREATE INDEX "Charge_severity_idx" ON "Charge"("severity");

-- CreateIndex
CREATE INDEX "Charge_disposition_idx" ON "Charge"("disposition");

-- CreateIndex
CREATE INDEX "Hearing_caseId_idx" ON "Hearing"("caseId");

-- CreateIndex
CREATE INDEX "Hearing_hearingDate_idx" ON "Hearing"("hearingDate");

-- CreateIndex
CREATE INDEX "WatchlistItem_userEmail_idx" ON "WatchlistItem"("userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistItem_userEmail_itemType_itemId_key" ON "WatchlistItem"("userEmail", "itemType", "itemId");
