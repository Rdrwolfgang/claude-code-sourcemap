import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const judges = [
  // Criminal Court Divisions (Shelby County)
  { name: "Felicia Corbin-Johnson", division: "Division 1", court: "Criminal Court", party: "D", isActive: true, bio: "Presiding judge of Division 1, Criminal Court. Known for extensive experience in violent crime cases." },
  { name: "James Lammey", division: "Division 2", court: "Criminal Court", party: "R", isActive: true, bio: "Division 2 Criminal Court judge with focus on drug cases and rehabilitation programs." },
  { name: "Jennifer Mitchell", division: "Division 3", court: "Criminal Court", party: "D", isActive: true, bio: "Division 3 presiding judge, handles major felony cases in Shelby County." },
  { name: "Carolyn Wade", division: "Division 4", court: "Criminal Court", party: "D", isActive: true, bio: "Division 4 Criminal Court judge. Former public defender." },
  { name: "Chris Craft", division: "Division 5", court: "Criminal Court", party: "R", isActive: true, bio: "Division 5, longtime Criminal Court judge known for strict sentencing on violent crimes." },
  { name: "John Campbell", division: "Division 6", court: "Criminal Court", party: "D", isActive: true, bio: "Division 6 Criminal Court, handles homicide and aggravated assault cases." },
  { name: "Paula Skahan", division: "Division 7", court: "Criminal Court", party: "D", isActive: true, bio: "Division 7 Criminal Court judge. Focus on domestic violence and sex crimes." },
  { name: "Cyndy Becker", division: "Division 8", court: "Criminal Court", party: "D", isActive: true, bio: "Division 8 Criminal Court. Handles major felonies and career criminal cases." },
  { name: "Lee Coffee", division: "Division 9", court: "Criminal Court", party: "R", isActive: true, bio: "Division 9 Criminal Court. Former prosecutor with extensive trial experience." },
  { name: "Glenn Wright", division: "Division 10", court: "Criminal Court", party: "D", isActive: true, bio: "Division 10 Criminal Court. Handles complex white-collar and violent crime cases." },
  { name: "Mark Ward", division: "Division 11", court: "Criminal Court", party: "D", isActive: true, bio: "Division 11 Criminal Court judge." },
  { name: "J. Robert Carter", division: "Division 12", court: "Criminal Court", party: "D", isActive: true, bio: "Division 12 Criminal Court. Known for comprehensive sentencing and rehabilitation focus." },
  { name: "William Anderson", division: "Division 13", court: "Criminal Court", party: "D", isActive: true, bio: "Division 13 Criminal Court." },
  { name: "Royce Taylor", division: "Division 14", court: "Criminal Court", party: "D", isActive: true, bio: "Division 14 Criminal Court judge." },
  { name: "Michael Peters", division: "Division 15", court: "Criminal Court", party: "D", isActive: true, bio: "Division 15 Criminal Court judge." },
  // Circuit Court
  { name: "James F. Russell", division: "Division 1", court: "Circuit Court", party: "D", isActive: true, bio: "Circuit Court Division 1. Handles civil and criminal appeals." },
  { name: "Gina Higgins", division: "Division 2", court: "Circuit Court", party: "R", isActive: true, bio: "Circuit Court Division 2." },
  { name: "Robert Sammons", division: "Division 3", court: "Circuit Court", party: "D", isActive: true, bio: "Circuit Court Division 3." },
  // General Sessions
  { name: "Melissa Boyd", division: "Division 1", court: "General Sessions", party: "D", isActive: true, bio: "General Sessions Division 1. Handles bail hearings, preliminary hearings." },
  { name: "Gerald Skahan", division: "Division 2", court: "General Sessions", party: "D", isActive: true, bio: "General Sessions Division 2." },
  { name: "Louis Montesi", division: "Division 3", court: "General Sessions", party: "R", isActive: true, bio: "General Sessions Division 3. Known for strict bail-setting in violent cases." },
  { name: "Kathleen Gomes", division: "Division 4", court: "General Sessions", party: "D", isActive: true, bio: "General Sessions Division 4." },
  { name: "Gary Gober", division: "Division 5", court: "General Sessions", party: "D", isActive: true, bio: "General Sessions Division 5. Handles misdemeanor trials and preliminary hearings." },
  { name: "Rachel Tenpenny", division: "Division 6", court: "General Sessions", party: "D", isActive: true, bio: "General Sessions Division 6." },
  { name: "Tanika White", division: "Division 7", court: "General Sessions", party: "D", isActive: true, bio: "General Sessions Division 7." },
  { name: "Bill Anderson", division: "Division 8", court: "General Sessions", party: "D", isActive: true, bio: "General Sessions Division 8." },
  { name: "Joy Touliatos", division: "Division 9", court: "General Sessions", party: "R", isActive: false, bio: "Former General Sessions judge (retired)." },
];

const sampleDefendants = [
  { firstName: "Marcus", lastName: "Williams", dob: new Date("1992-03-14"), race: "Black", sex: "M", city: "Memphis", state: "TN" },
  { firstName: "Darius", lastName: "Johnson", dob: new Date("1988-07-22"), race: "Black", sex: "M", city: "Memphis", state: "TN" },
  { firstName: "Kevin", lastName: "Smith", dob: new Date("1995-11-05"), race: "Black", sex: "M", city: "Memphis", state: "TN" },
  { firstName: "Terrell", lastName: "Brown", dob: new Date("1990-02-18"), race: "Black", sex: "M", city: "Memphis", state: "TN" },
  { firstName: "James", lastName: "Davis", dob: new Date("1985-09-30"), race: "White", sex: "M", city: "Memphis", state: "TN" },
  { firstName: "Robert", lastName: "Wilson", dob: new Date("1978-12-01"), race: "White", sex: "M", city: "Bartlett", state: "TN" },
  { firstName: "DeShawn", lastName: "Thomas", dob: new Date("1998-04-25"), race: "Black", sex: "M", city: "Memphis", state: "TN" },
  { firstName: "Christopher", lastName: "Moore", dob: new Date("1993-08-11"), race: "Black", sex: "M", city: "Memphis", state: "TN" },
  { firstName: "Tyrone", lastName: "Jackson", dob: new Date("1987-01-07"), race: "Black", sex: "M", city: "Memphis", state: "TN" },
  { firstName: "Angela", lastName: "Harris", dob: new Date("1991-06-15"), race: "Black", sex: "F", city: "Memphis", state: "TN" },
  { firstName: "Michael", lastName: "Thompson", dob: new Date("1996-10-28"), race: "Black", sex: "M", city: "Memphis", state: "TN" },
  { firstName: "Justin", lastName: "Garcia", dob: new Date("2000-03-03"), race: "Hispanic", sex: "M", city: "Memphis", state: "TN" },
  { firstName: "Brandon", lastName: "Martinez", dob: new Date("1994-07-17"), race: "Hispanic", sex: "M", city: "Memphis", state: "TN" },
  { firstName: "Travis", lastName: "Robinson", dob: new Date("1982-05-22"), race: "Black", sex: "M", city: "Memphis", state: "TN" },
  { firstName: "Charles", lastName: "Clark", dob: new Date("1975-11-14"), race: "White", sex: "M", city: "Germantown", state: "TN" },
];

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const chargeTemplates = [
  { description: "Aggravated Assault", severity: "Felony B", isViolent: true, isDrugRelated: false },
  { description: "Aggravated Assault - Deadly Weapon", severity: "Felony B", isViolent: true, isDrugRelated: false },
  { description: "Criminal Homicide", severity: "Felony A", isViolent: true, isDrugRelated: false },
  { description: "Second Degree Murder", severity: "Felony A", isViolent: true, isDrugRelated: false },
  { description: "Carjacking", severity: "Felony B", isViolent: true, isDrugRelated: false },
  { description: "Robbery", severity: "Felony C", isViolent: true, isDrugRelated: false },
  { description: "Aggravated Robbery", severity: "Felony B", isViolent: true, isDrugRelated: false },
  { description: "Rape", severity: "Felony A", isViolent: true, isDrugRelated: false },
  { description: "Aggravated Sexual Battery", severity: "Felony B", isViolent: true, isDrugRelated: false },
  { description: "Kidnapping", severity: "Felony B", isViolent: true, isDrugRelated: false },
  { description: "Possession of Controlled Substance", severity: "Felony C", isViolent: false, isDrugRelated: true },
  { description: "Sale of Controlled Substance", severity: "Felony B", isViolent: false, isDrugRelated: true },
  { description: "Possession w/ Intent to Deliver", severity: "Felony B", isViolent: false, isDrugRelated: true },
  { description: "Unlawful Carrying of a Weapon", severity: "Misdemeanor", isViolent: false, isDrugRelated: false },
  { description: "Felon in Possession of a Firearm", severity: "Felony C", isViolent: false, isDrugRelated: false },
  { description: "Burglary", severity: "Felony C", isViolent: false, isDrugRelated: false },
  { description: "Aggravated Burglary", severity: "Felony B", isViolent: false, isDrugRelated: false },
  { description: "Theft of Property", severity: "Felony C", isViolent: false, isDrugRelated: false },
  { description: "DUI", severity: "Misdemeanor", isViolent: false, isDrugRelated: false },
  { description: "Domestic Assault", severity: "Misdemeanor", isViolent: true, isDrugRelated: false },
  { description: "Stalking", severity: "Felony C", isViolent: true, isDrugRelated: false },
  { description: "Reckless Endangerment", severity: "Felony C", isViolent: true, isDrugRelated: false },
  { description: "Attempted Murder in the First Degree", severity: "Felony A", isViolent: true, isDrugRelated: false },
  { description: "Tampering with Evidence", severity: "Felony C", isViolent: false, isDrugRelated: false },
];

const dispositions = ["Guilty Plea", "Guilty", "Not Guilty", "Nolle Pros", "Dismissed", "Diversion", "Bound Over to Grand Jury", "Pending"];
const bondTypes = ["Cash", "Surety", "OR Release", "Held Without Bond", "Reduced Bond"];
const hearingTypes = ["Arraignment", "Bail Hearing", "Preliminary Hearing", "Status Conference", "Suppression Hearing", "Trial", "Sentencing", "Probation Revocation"];
const statuses = ["Open", "Closed", "Pending", "Appealed"];
const prosecutors = [
  "ADA Sarah Collins", "ADA Michael Reed", "ADA Jennifer Park",
  "ADA David Okonkwo", "ADA Rachel Torres", "ADA James Whitfield",
  "ADA Tamika Brown", "ADA Kevin Nguyen",
];

async function main() {
  console.log("🌱 Seeding Shelby County Justice Tracker database...");

  await prisma.hearing.deleteMany();
  await prisma.charge.deleteMany();
  await prisma.caseDefendant.deleteMany();
  await prisma.watchlistItem.deleteMany();
  await prisma.case.deleteMany();
  await prisma.defendant.deleteMany();
  await prisma.judge.deleteMany();
  await prisma.dataSource.deleteMany();

  // Seed judges
  const createdJudges = await Promise.all(
    judges.map((j) =>
      prisma.judge.create({
        data: {
          ...j,
          appointedDate: randomDate(new Date("2000-01-01"), new Date("2020-01-01")),
        },
      })
    )
  );
  console.log(`✅ Seeded ${createdJudges.length} judges`);

  // Seed defendants
  const createdDefendants = await Promise.all(
    sampleDefendants.map((d) => prisma.defendant.create({ data: d }))
  );
  console.log(`✅ Seeded ${createdDefendants.length} defendants`);

  // Seed cases (150 realistic cases)
  const criminalJudges = createdJudges.filter(j => j.court === "Criminal Court" || j.court === "General Sessions");
  const caseCount = 150;
  const startYear = new Date("2019-01-01");
  const endYear = new Date("2024-12-31");

  for (let i = 0; i < caseCount; i++) {
    const judge = randomFrom(criminalJudges);
    const filedDate = randomDate(startYear, endYear);
    const caseNumber = `${filedDate.getFullYear()}-CR-${String(Math.floor(Math.random() * 90000) + 10000)}`;
    const isClosed = Math.random() > 0.3;
    const isHighProfile = Math.random() > 0.92;

    const caseRecord = await prisma.case.create({
      data: {
        caseNumber,
        court: judge.court,
        county: "Shelby",
        state: "TN",
        filedDate,
        dispositionDate: isClosed ? randomDate(filedDate, new Date("2025-06-01")) : null,
        status: isClosed ? randomFrom(["Closed", "Appealed"]) : randomFrom(["Open", "Pending"]),
        judgeId: judge.id,
        prosecutorName: randomFrom(prosecutors),
        daOffice: "Shelby County DA - Steve Mulroy (30th Judicial District)",
        isHighProfile,
        notes: isHighProfile ? "High-profile case with significant public interest." : null,
      },
    });

    // Link 1-3 defendants
    const numDefs = Math.floor(Math.random() * 3) + 1;
    const shuffledDefs = [...createdDefendants].sort(() => Math.random() - 0.5).slice(0, numDefs);
    for (const def of shuffledDefs) {
      await prisma.caseDefendant.create({
        data: { caseId: caseRecord.id, defendantId: def.id },
      });
    }

    // 1-4 charges per case
    const numCharges = Math.floor(Math.random() * 4) + 1;
    for (let c = 0; c < numCharges; c++) {
      const charge = randomFrom(chargeTemplates);
      const disposition = isClosed ? randomFrom(dispositions.filter(d => d !== "Pending")) : "Pending";
      const bondAmt = charge.isViolent
        ? Math.floor(Math.random() * 200000) + 50000
        : Math.floor(Math.random() * 50000) + 5000;

      await prisma.charge.create({
        data: {
          caseId: caseRecord.id,
          ...charge,
          statute: `T.C.A. § ${Math.floor(Math.random() * 30) + 39}-${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 200) + 100}`,
          disposition,
          sentence: disposition === "Guilty" || disposition === "Guilty Plea"
            ? randomFrom(["6 months probation", "1 year supervised probation", "2 years probation", "180 days jail", "1 year county jail", "3 years TDOC", "5 years TDOC", "8 years TDOC", "Time served", "15 years TDOC"])
            : null,
          bondAmount: bondAmt,
          bondType: randomFrom(bondTypes),
        },
      });
    }

    // 1-5 hearing events
    const numHearings = Math.floor(Math.random() * 5) + 1;
    let hearingDate = new Date(filedDate);
    for (let h = 0; h < numHearings; h++) {
      hearingDate = new Date(hearingDate.getTime() + Math.random() * 60 * 24 * 3600 * 1000);
      if (hearingDate > new Date()) break;
      await prisma.hearing.create({
        data: {
          caseId: caseRecord.id,
          hearingDate,
          hearingType: randomFrom(hearingTypes),
          outcome: Math.random() > 0.4 ? randomFrom(["Continued", "Completed", "Reset", "Waived"]) : null,
        },
      });
    }
  }
  console.log(`✅ Seeded ${caseCount} cases with charges and hearings`);

  // Data sources
  await prisma.dataSource.createMany({
    data: [
      {
        name: "Shelby County Criminal Justice System Portal",
        url: "https://cjs.shelbycountytn.gov",
        description: "Official public portal for Shelby County criminal case records, dockets, and defendant information.",
        isActive: true,
        lastChecked: new Date(),
      },
      {
        name: "Tennessee Administrative Office of the Courts",
        url: "https://tncrtinfo.com",
        description: "Statewide Tennessee court information system.",
        isActive: true,
        lastChecked: new Date(),
      },
      {
        name: "Shelby County Criminal Court Clerk",
        url: "https://www.shelbycountytn.gov/219/Criminal-Court-Clerk",
        description: "Official Shelby County Criminal Court Clerk office for case filings and public records.",
        isActive: true,
        lastChecked: new Date(),
      },
      {
        name: "Tennessee Department of Correction - Offender Lookup",
        url: "https://foil.app.tn.gov/foil/search.jsp",
        description: "TDOC public offender lookup system for incarcerated individuals.",
        isActive: true,
        lastChecked: new Date(),
      },
      {
        name: "Shelby County DA - 30th Judicial District",
        url: "https://www.shelbycountytn.gov/185/District-Attorney",
        description: "Official website of the Shelby County District Attorney's office under Steve Mulroy.",
        isActive: true,
        lastChecked: new Date(),
      },
      {
        name: "Memphis Police Department CRIMEMAPPING",
        url: "https://www.crimemapping.com/map/tn/memphis",
        description: "MPD public crime mapping tool for incident data.",
        isActive: true,
        lastChecked: new Date(),
      },
    ],
  });

  console.log("✅ Seeded data sources");
  console.log("\n🎉 Database seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
