import { PrismaClient, Gender, MaritalStatus, DecisionChoice, VerificationStatus, JourneyStage } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Hyderabad',
  'Gurugram', 'Noida', 'Chennai', 'Kolkata', 'Ahmedabad', 'Chandigarh'
];

const MALE_FIRST_NAMES = [
  'Aarav', 'Aditya', 'Arjun', 'Kabir', 'Rohan', 'Vihaan', 'Dev', 'Ishaan', 'Karan', 'Aryan',
  'Nikhil', 'Rhea', 'Varun', 'Siddharth', 'Tanmay', 'Sameer', 'Vikram', 'Anand', 'Gaurav', 'Manish',
  'Akash', 'Kunal', 'Pranav', 'Rahul', 'Aayush', 'Harsh', 'Mayank', 'Sachin', 'Yash', 'Abhinav',
  'Tarun', 'Deepak', 'Alok', 'Mohit', 'Neeraj', 'Chirag', 'Saurabh', 'Vivek', 'Gautam', 'Karthik',
  'Raghav', 'Abhishek', 'Naveen', 'Rishabh', 'Sumit', 'Amit', 'Ankit', 'Sunny', 'Rajat', 'Pankaj'
];

const FEMALE_FIRST_NAMES = [
  'Ananya', 'Diya', 'Ishita', 'Pooja', 'Rhea', 'Tara', 'Aanya', 'Sanya', 'Meera', 'Kavya',
  'Tanvi', 'Natasha', 'Sneha', 'Shruti', 'Anushka', 'Simran', 'Kriti', 'Aditi', 'Mallika', 'Neha',
  'Priyanka', 'Radhika', 'Shreya', 'Divya', 'Bhavna', 'Sunaina', 'Mansi', 'Sakshi', 'Payal', 'Isha',
  'Vidya', 'Swati', 'Preeti', 'Garima', 'Aparna', 'Nikita', 'Richa', 'Nandini', 'Rashmi', 'Pallavi',
  'Shalini', 'Smriti', 'Aarti', 'Komal', 'Prachi', 'Alisha', 'Monika', 'Ritu', 'Jyoti', 'Shweta',
  'Deepika', 'Akanksha', 'Karishma', 'Parul', 'Rupal', 'Surabhi', 'Vandana', 'Geetika', 'Ankita', 'Bani'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Kapoor', 'Mehta', 'Iyer', 'Nair', 'Patel', 'Reddy', 'Singh', 'Gupta',
  'Chopra', 'Malhotra', 'Joshi', 'Bhat', 'Deshmukh', 'Kulkarni', 'Banerjee', 'Chatterjee', 'Sen', 'Das',
  'Agarwal', 'Bansal', 'Mittal', 'Goel', 'Saxena', 'Bhardwaj', 'Pillai', 'Menon', 'Rao', 'Hebbar',
  'Shah', 'Trivedi', 'Pandey', 'Mishra', 'Dubey', 'Tiwari', 'Bhatnagar', 'Sarin', 'Khanna', 'Sethi'
];

const COLLEGES = [
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'BITS Pilani', 'St. Xavier\'s College, Mumbai',
  'SRCC, Delhi University', 'Lady Shri Ram College', 'IIM Ahmedabad', 'ISB Hyderabad',
  'National Law School, Bengaluru', 'Christ University', 'Symbiosis Pune', 'Delhi School of Economics'
];

const DEGREES = [
  'B.Tech in Computer Science', 'B.Tech in Electrical Engineering', 'MBA in Finance & Strategy',
  'B.Com (Honours)', 'Bachelor of Design (B.Des)', 'M.Sc in Economics', 'B.A. in Psychology & Literature',
  'Master of Data Science', 'B.Arch (Architecture)', 'LL.B (Corporate Law)', 'Chartered Accountant (CA)'
];

const COMPANIES = [
  'Google India', 'Microsoft', 'McKinsey & Company', 'Boston Consulting Group', 'Goldman Sachs',
  'HDFC Bank', 'Zomato', 'Swiggy', 'Tata Consultancy Services', 'Infosys', 'Flipkart', 'Deloitte',
  'Unilever India', 'Adobe', 'Nykaa', 'Zerodha', 'CRED', 'Razorpay'
];

const DESIGNATIONS = [
  'Senior Software Engineer', 'Lead Product Manager', 'Management Consultant', 'VP Investment Banking',
  'Design Director', 'Senior Strategy Associate', 'Principal Data Scientist', 'Corporate Legal Counsel',
  'Brand Marketing Manager', 'Financial Analyst', 'Engineering Manager', 'Architect & Spatial Designer'
];

const LANGUAGES = [
  ['Hindi', 'English'],
  ['Hindi', 'English', 'Marathi'],
  ['Tamil', 'English', 'Hindi'],
  ['Telugu', 'English', 'Hindi'],
  ['Bengali', 'English', 'Hindi'],
  ['Gujarati', 'English', 'Hindi'],
  ['Punjabi', 'English', 'Hindi'],
  ['Malayalam', 'English', 'Hindi'],
  ['Kannada', 'English', 'Hindi']
];

const MOTHER_TONGUES = ['Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Punjabi', 'Malayalam', 'Kannada'];

const HOBBIES_LIST = [
  ['Trekking', 'Specialty Coffee', 'Contemporary Fiction', 'Film Photography'],
  ['Classical Music', 'Baking', 'Yoga', 'Art Galleries'],
  ['Marathon Running', 'Podcasts', 'Culinary Experiments', 'Scuba Diving'],
  ['Playing Guitar', 'Badminton', 'Traveling', 'Board Games'],
  ['Writing', 'Pottery', 'Gardening', 'Museum Walks'],
  ['Tennis', 'Wine Tasting', 'Architecture', 'Formula 1']
];

const DIET_CHOICES = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Jain', 'Vegan'];

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export async function main() {
  console.log('🌱 Starting database seeding for TDC Matchmaker MVP...');

  // 1. Clean existing records safely
  await prisma.activityEvent.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.partnerPreferences.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.matchmaker.deleteMany({});

  // 2. Create Demo Matchmaker
  const hashedPassword = await bcrypt.hash('matchmaker123', 10);
  const demoMatchmaker = await prisma.matchmaker.create({
    data: {
      email: 'demo@thedatecrew.com',
      username: 'matchmaker_demo',
      password: hashedPassword,
      name: 'Priya Sengupta',
      phone: '+919820012345',
    },
  });
  console.log(`✅ Demo matchmaker created: demo@thedatecrew.com / matchmaker123 (ID: ${demoMatchmaker.id})`);

  // 3. Create Primary Demo Customers Assigned to Matchmaker
  // Demo Male Customer (Arjun Kapoor - seeking Female)
  const arjun = await prisma.customer.create({
    data: {
      matchmakerId: demoMatchmaker.id,
      firstName: 'Arjun',
      lastName: 'Kapoor',
      gender: Gender.MALE,
      dateOfBirth: new Date('1994-04-12'), // 32 yrs
      country: 'India',
      city: 'Mumbai',
      height: 180,
      email: 'arjun.kapoor@example.com',
      phone: '+919820199001',
      undergraduateCollege: 'IIT Bombay',
      degree: 'B.Tech in Computer Science',
      currentCompany: 'CRED',
      designation: 'Staff Software Architect',
      income: 4200000,
      currency: 'INR',
      incomePeriod: 'per annum',
      maritalStatus: MaritalStatus.NEVER_MARRIED,
      languagesKnown: ['Hindi', 'English', 'Marathi'],
      numberOfSiblings: 1,
      caste: 'Punjabi Khatri',
      religion: 'Hindu',
      motherTongue: 'Hindi',
      wantChildren: DecisionChoice.YES,
      openToRelocation: DecisionChoice.MAYBE,
      openToPets: DecisionChoice.YES,
      diet: 'Vegetarian',
      horoscopePreference: DecisionChoice.NO,
      relationshipGoals: 'Marriage within 1-2 years',
      hobbies: ['Specialty Coffee', 'Trekking', 'Film Photography', 'Reading'],
      journeyStage: JourneyStage.READY_FOR_MATCHES,
      verificationStatus: VerificationStatus.VERIFIED,
      profileCompleteness: 100,
      lastContactDate: new Date(),
      bioNotes: 'Warm, articulate, family-oriented professional looking for a partner with shared cultural and intellectual values.',
      partnerPreferences: {
        create: {
          preferredAgeMin: 26,
          preferredAgeMax: 32,
          preferredHeightMin: 158,
          preferredHeightMax: 175,
          preferredCities: ['Mumbai', 'Pune', 'Bengaluru'],
          preferredEducation: ['B.Tech', 'MBA', 'Design', 'Economics'],
          preferredProfessions: ['Product Manager', 'Designer', 'Consultant', 'Software Engineer'],
          preferredIncomeMin: 1500000,
          preferredRelocation: DecisionChoice.YES,
          preferredChildren: DecisionChoice.YES,
          preferredPets: DecisionChoice.YES,
          preferredDiet: ['Vegetarian', 'Eggetarian'],
          preferredMaritalStatus: [MaritalStatus.NEVER_MARRIED],
          dealbreakers: ['Smokers', 'Opposed to children'],
          specialNotes: 'Prefers an ambitious and compassionate partner who appreciates thoughtful conversations.',
        },
      },
    },
  });

  // Demo Female Customer (Meera Nair - seeking Male)
  const meera = await prisma.customer.create({
    data: {
      matchmakerId: demoMatchmaker.id,
      firstName: 'Meera',
      lastName: 'Nair',
      gender: Gender.FEMALE,
      dateOfBirth: new Date('1996-09-18'), // 29 yrs
      country: 'India',
      city: 'Bengaluru',
      height: 167,
      email: 'meera.nair@example.com',
      phone: '+919820199002',
      undergraduateCollege: 'IIM Ahmedabad',
      degree: 'MBA in Finance & Strategy',
      currentCompany: 'McKinsey & Company',
      designation: 'Engagement Manager',
      income: 3800000,
      currency: 'INR',
      incomePeriod: 'per annum',
      maritalStatus: MaritalStatus.NEVER_MARRIED,
      languagesKnown: ['English', 'Hindi', 'Malayalam'],
      numberOfSiblings: 1,
      caste: 'Nair',
      religion: 'Hindu',
      motherTongue: 'Malayalam',
      wantChildren: DecisionChoice.YES,
      openToRelocation: DecisionChoice.YES,
      openToPets: DecisionChoice.YES,
      diet: 'Eggetarian',
      horoscopePreference: DecisionChoice.NO,
      relationshipGoals: 'Marriage within 1-2 years',
      hobbies: ['Classical Dance', 'Badminton', 'Traveling', 'Podcasts'],
      journeyStage: JourneyStage.READY_FOR_MATCHES,
      verificationStatus: VerificationStatus.VERIFIED,
      profileCompleteness: 100,
      lastContactDate: new Date(Date.now() - 86400000 * 2),
      bioNotes: 'Dynamic consultant with a global perspective, passionate about art, travel, and grounded family values.',
      partnerPreferences: {
        create: {
          preferredAgeMin: 28,
          preferredAgeMax: 35,
          preferredHeightMin: 172,
          preferredHeightMax: 188,
          preferredCities: ['Bengaluru', 'Mumbai', 'Hyderabad', 'Delhi'],
          preferredEducation: ['IIT', 'IIM', 'BITS', 'MBA', 'Masters'],
          preferredProfessions: ['Product Manager', 'Software Engineer', 'Consultant', 'Founder'],
          preferredIncomeMin: 3000000,
          preferredRelocation: DecisionChoice.YES,
          preferredChildren: DecisionChoice.YES,
          preferredPets: DecisionChoice.YES,
          dealbreakers: ['Inflexible on relocation'],
          specialNotes: 'Looking for a thoughtful, driven life partner with emotional maturity.',
        },
      },
    },
  });

  // Additional assigned demo customers for varied journey stages
  const additionalDemoCustomers = [
    {
      firstName: 'Kabir',
      lastName: 'Mehta',
      gender: Gender.MALE,
      dateOfBirth: new Date('1992-11-05'),
      city: 'Delhi',
      height: 177,
      email: 'kabir.mehta@example.com',
      phone: '+919820199003',
      college: 'SRCC, Delhi University',
      degree: 'B.Com (Honours)',
      company: 'Goldman Sachs',
      designation: 'VP Investment Banking',
      income: 5500000,
      motherTongue: 'Hindi',
      stage: JourneyStage.MATCH_SUGGESTED,
    },
    {
      firstName: 'Rhea',
      lastName: 'Deshmukh',
      gender: Gender.FEMALE,
      dateOfBirth: new Date('1998-02-14'),
      city: 'Pune',
      height: 164,
      email: 'rhea.deshmukh@example.com',
      phone: '+919820199004',
      college: 'Symbiosis Pune',
      degree: 'Bachelor of Design (B.Des)',
      company: 'Zomato',
      designation: 'Product Designer',
      income: 2100000,
      motherTongue: 'Marathi',
      stage: JourneyStage.FOLLOW_UP_REQUIRED,
    },
    {
      firstName: 'Tanmay',
      lastName: 'Iyer',
      gender: Gender.MALE,
      dateOfBirth: new Date('1995-07-22'),
      city: 'Chennai',
      height: 175,
      email: 'tanmay.iyer@example.com',
      phone: '+919820199005',
      college: 'IIT Madras',
      degree: 'B.Tech in Electrical Engineering',
      company: 'Microsoft',
      designation: 'Senior Software Engineer',
      income: 3400000,
      motherTongue: 'Tamil',
      stage: JourneyStage.ONBOARDING,
    },
  ];

  for (const c of additionalDemoCustomers) {
    await prisma.customer.create({
      data: {
        matchmakerId: demoMatchmaker.id,
        firstName: c.firstName,
        lastName: c.lastName,
        gender: c.gender,
        dateOfBirth: c.dateOfBirth,
        city: c.city,
        height: c.height,
        email: c.email,
        phone: c.phone,
        undergraduateCollege: c.college,
        degree: c.degree,
        currentCompany: c.company,
        designation: c.designation,
        income: c.income,
        currency: 'INR',
        incomePeriod: 'per annum',
        maritalStatus: MaritalStatus.NEVER_MARRIED,
        languagesKnown: ['English', 'Hindi', c.motherTongue],
        numberOfSiblings: 1,
        motherTongue: c.motherTongue,
        wantChildren: DecisionChoice.YES,
        openToRelocation: DecisionChoice.MAYBE,
        openToPets: DecisionChoice.YES,
        diet: 'Vegetarian',
        relationshipGoals: 'Marriage within 1-2 years',
        hobbies: ['Reading', 'Trekking', 'Music'],
        journeyStage: c.stage,
        verificationStatus: VerificationStatus.VERIFIED,
        profileCompleteness: 95,
        lastContactDate: new Date(Date.now() - 86400000 * 4),
        partnerPreferences: {
          create: {
            preferredAgeMin: 24,
            preferredAgeMax: 33,
            preferredCities: [c.city, 'Mumbai', 'Bengaluru'],
          },
        },
      },
    });
  }

  console.log(`✅ Demo assigned customers created for matchmaker.`);

  // 4. Seed At Least 100 Opposite-Gender Female Profiles (Candidate Pool for Arjun)
  // And 20 additional Male Profiles (Candidate Pool for Meera)
  const candidateBatch: any[] = [];

  // Generate 110 diverse, plausible female profiles
  for (let i = 0; i < 110; i++) {
    const firstName = FEMALE_FIRST_NAMES[i % FEMALE_FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 3 + 1) % LAST_NAMES.length];
    const city = INDIAN_CITIES[i % INDIAN_CITIES.length];
    const college = COLLEGES[i % COLLEGES.length];
    const degree = DEGREES[i % DEGREES.length];
    const company = COMPANIES[i % COMPANIES.length];
    const designation = DESIGNATIONS[i % DESIGNATIONS.length];
    const languages = LANGUAGES[i % LANGUAGES.length];
    const motherTongue = MOTHER_TONGUES[i % MOTHER_TONGUES.length];
    const hobbies = HOBBIES_LIST[i % HOBBIES_LIST.length];
    const diet = DIET_CHOICES[i % DIET_CHOICES.length];

    // Ages between 24 and 34 (birthdays 1992 - 2002)
    const birthYear = 1993 + (i % 9);
    const birthMonth = (i % 12) + 1;
    const birthDay = (i % 27) + 1;
    const dob = new Date(`${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`);

    // Height between 156 and 174 cm (shorter than Arjun's 180cm, fulfilling assessment requirement)
    const height = 157 + (i % 16);

    // Income between 14 LPA and 36 LPA (reasonable distribution, many earning less or equal to Arjun)
    const income = 1400000 + (i % 12) * 200000;

    const wantChildrenChoice = i % 10 === 0 ? DecisionChoice.NO : i % 5 === 0 ? DecisionChoice.MAYBE : DecisionChoice.YES;
    const relocationChoice = i % 4 === 0 ? DecisionChoice.NO : i % 3 === 0 ? DecisionChoice.MAYBE : DecisionChoice.YES;
    const verification = i % 8 === 0 ? VerificationStatus.PENDING : VerificationStatus.VERIFIED;

    candidateBatch.push({
      firstName,
      lastName,
      gender: Gender.FEMALE,
      dateOfBirth: dob,
      country: 'India',
      city,
      height,
      email: `candidate.f.${i + 1}.${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `+9198${String(10000000 + i * 73).slice(0, 8)}`,
      undergraduateCollege: college,
      degree,
      currentCompany: company,
      designation,
      income,
      currency: 'INR',
      incomePeriod: 'per annum',
      maritalStatus: i === 42 ? MaritalStatus.DIVORCED : MaritalStatus.NEVER_MARRIED,
      languagesKnown: languages,
      numberOfSiblings: (i % 3),
      motherTongue,
      wantChildren: wantChildrenChoice,
      openToRelocation: relocationChoice,
      openToPets: DecisionChoice.YES,
      diet,
      horoscopePreference: DecisionChoice.NO,
      relationshipGoals: 'Marriage within 1-2 years',
      hobbies,
      journeyStage: JourneyStage.READY_FOR_MATCHES,
      verificationStatus: verification,
      profileCompleteness: 90 + (i % 11),
      partnerPreferences: {
        create: {
          preferredAgeMin: 27,
          preferredAgeMax: 36,
          preferredHeightMin: 172,
          preferredHeightMax: 188,
          preferredCities: [city, 'Mumbai', 'Bengaluru'],
          preferredRelocation: relocationChoice,
          preferredChildren: wantChildrenChoice,
          preferredPets: DecisionChoice.YES,
          preferredDiet: [diet, 'Vegetarian'],
        },
      },
    });
  }

  // Insert all female candidates
  let femaleCount = 0;
  for (const candidateData of candidateBatch) {
    await prisma.customer.create({ data: candidateData });
    femaleCount++;
  }
  console.log(`✅ Seeded ${femaleCount} fictional female candidate profiles (exceeds 100 opposite-gender requirement)!`);

  // Generate 110 diverse, plausible male profiles (candidate pool for female customers such as Meera)
  const maleBatch: any[] = [];
  for (let i = 0; i < 110; i++) {
    const firstName = MALE_FIRST_NAMES[i % MALE_FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 5 + 2) % LAST_NAMES.length];
    const city = INDIAN_CITIES[(i + 3) % INDIAN_CITIES.length];
    const diet = DIET_CHOICES[(i + 1) % DIET_CHOICES.length];
    const birthYear = 1989 + (i % 9);
    const dob = new Date(`${birthYear}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`);
    const wantChildrenChoice = i % 10 === 0 ? DecisionChoice.NO : i % 5 === 0 ? DecisionChoice.MAYBE : DecisionChoice.YES;
    const relocationChoice = i % 4 === 0 ? DecisionChoice.NO : i % 3 === 0 ? DecisionChoice.MAYBE : DecisionChoice.YES;

    maleBatch.push({
      firstName,
      lastName,
      gender: Gender.MALE,
      dateOfBirth: dob,
      country: 'India',
      city,
      height: 168 + (i % 20),
      email: `candidate.m.${i + 1}.${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `+9197${String(20000000 + i * 61).slice(0, 8)}`,
      undergraduateCollege: COLLEGES[(i + 2) % COLLEGES.length],
      degree: DEGREES[(i + 1) % DEGREES.length],
      currentCompany: COMPANIES[(i + 4) % COMPANIES.length],
      designation: DESIGNATIONS[(i + 2) % DESIGNATIONS.length],
      income: 1800000 + (i % 14) * 250000,
      currency: 'INR',
      incomePeriod: 'per annum',
      maritalStatus: i === 57 ? MaritalStatus.DIVORCED : MaritalStatus.NEVER_MARRIED,
      languagesKnown: LANGUAGES[(i + 3) % LANGUAGES.length],
      numberOfSiblings: i % 3,
      motherTongue: MOTHER_TONGUES[(i + 2) % MOTHER_TONGUES.length],
      wantChildren: wantChildrenChoice,
      openToRelocation: relocationChoice,
      openToPets: i % 6 === 0 ? DecisionChoice.MAYBE : DecisionChoice.YES,
      diet,
      horoscopePreference: DecisionChoice.NO,
      relationshipGoals: 'Marriage within 1-2 years',
      hobbies: HOBBIES_LIST[(i + 5) % HOBBIES_LIST.length],
      journeyStage: JourneyStage.READY_FOR_MATCHES,
      verificationStatus: i % 8 === 0 ? VerificationStatus.PENDING : VerificationStatus.VERIFIED,
      profileCompleteness: 88 + (i % 13),
      partnerPreferences: {
        create: {
          preferredAgeMin: 24,
          preferredAgeMax: 33,
          preferredHeightMin: 155,
          preferredHeightMax: 175,
          preferredCities: [city, 'Mumbai', 'Bengaluru'],
          preferredRelocation: relocationChoice,
          preferredChildren: wantChildrenChoice,
          preferredPets: DecisionChoice.YES,
          preferredDiet: [diet, 'Vegetarian'],
        },
      },
    });
  }
  let maleCount = 0;
  for (const candidateData of maleBatch) {
    await prisma.customer.create({ data: candidateData });
    maleCount++;
  }
  console.log(`✅ Seeded ${maleCount} fictional male candidate profiles (pool for female customers)!`);

  // Seed sample initial note on Arjun
  await prisma.note.create({
    data: {
      customerId: arjun.id,
      matchmakerId: demoMatchmaker.id,
      category: 'CALL',
      content: 'Initial discovery call with Arjun. Looking for a partner with strong intellectual curiosity, mutual respect, and family orientation. Open to relocation for the right match.',
    },
  });

  // Seed sample initial note on Meera
  await prisma.note.create({
    data: {
      customerId: meera.id,
      matchmakerId: demoMatchmaker.id,
      category: 'MEETING',
      content: 'In-person consultation in Bengaluru. Meera values ambition, emotional stability, and clear communication. Ready for introductions.',
    },
  });

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
