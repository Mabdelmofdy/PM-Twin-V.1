/**
 * Expand demo data for POC: 20-30 professionals, 10-15 companies, 40-50 opportunities,
 * more applications and matches. Adds 2 pending users and 1 draft opportunity for admin demo.
 * Run from repo root: node POC/scripts/expand-demo-data.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PASS_HASH = 'cGFzc3dvcmQxMjM='; // password123
const NOW = new Date().toISOString();

function loadJson(filename) {
  const filePath = path.join(DATA_DIR, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJson(filename, obj) {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(obj, null, 2), 'utf8');
}

const PRO_NAMES = [
  'Youssef Al-Rashid', 'Maha Al-Otaibi', 'Faisal Al-Ghamdi', 'Huda Al-Shammari', 'Tariq Al-Dosari',
  'Rania Al-Harbi', 'Badr Al-Qahtani', 'Dana Al-Mutairi', 'Waleed Al-Shehri', 'Lina Al-Omari',
  'Hamad Al-Subaie', 'Nada Al-Juhani', 'Saud Al-Balawi', 'Reem Al-Dossary', 'Fahad Al-Harbi',
  'Mona Al-Shahrani', 'Nawaf Al-Ghamdi', 'Lamia Al-Qahtani', 'Abdulrahman Al-Shehri', 'Hind Al-Dosari'
];
const PRO_EMAILS = [
  'youssef.rashid@email.com', 'maha.otaibi@email.com', 'faisal.ghamdi@email.com', 'huda.shammari@email.com', 'tariq.dosari@email.com',
  'rania.harbi@email.com', 'badr.qahtani@email.com', 'dana.mutairi@email.com', 'waleed.shehri@email.com', 'lina.omari@email.com',
  'hamad.subaie@email.com', 'nada.juhani@email.com', 'saud.balawi@email.com', 'reem.dossary@email.com', 'fahad.harbi@email.com',
  'mona.shahrani@email.com', 'nawaf.ghamdi@email.com', 'lamia.qahtani@email.com', 'abdulrahman.shehri@email.com', 'hind.dosari@email.com'
];
const SKILLS_POOL = ['Project Management', 'Structural Design', 'BIM', 'AutoCAD', 'Cost Estimation', 'Construction Supervision', 'LEED', 'MEP', 'Civil Engineering', 'Architecture', 'Contract Management', 'Risk Management', 'PMP', 'Revit', 'Sustainability'];
const SECTORS_POOL = ['Construction', 'Infrastructure', 'Real Estate', 'Energy', 'Transportation', 'Building', 'Commercial', 'Industrial'];

function makeProfessional(i) {
  const id = `user-pro-${String(9 + i).padStart(3, '0')}`;
  const status = (i === 0 || i === 1) ? 'pending' : 'active'; // first two pending for admin demo
  const n = PRO_NAMES[i];
  const skills = [...new Set([...SKILLS_POOL.sort(() => Math.random() - 0.5).slice(0, 6)])];
  const sectors = [...new Set([...SECTORS_POOL.sort(() => Math.random() - 0.5).slice(0, 3)])];
  return {
    id,
    email: PRO_EMAILS[i],
    passwordHash: PASS_HASH,
    role: 'professional',
    status,
    isPublic: true,
    connectionCount: 50 + Math.floor(Math.random() * 200),
    profile: {
      name: n,
      type: 'professional',
      headline: `${skills[0]} Specialist | ${sectors[0]}`,
      title: skills[0] + ' Professional',
      phone: '+966 55 ' + (100 + i) + ' ' + (1000 + i),
      location: ['Riyadh', 'Jeddah', 'Dammam', 'Khobar'][i % 4] + ', KSA',
      bio: `Experienced professional in ${sectors.join(', ')}.`,
      specializations: skills.slice(0, 3),
      skills,
      sectors,
      experience: 5 + (i % 12),
      yearsExperience: 5 + (i % 12),
      education: 'BSc/MSc',
      certifications: i % 3 === 0 ? ['PMP'] : i % 3 === 1 ? ['LEED AP'] : [],
      availability: 'Available',
      preferredWorkMode: ['Hybrid', 'Remote', 'On-Site'][i % 3],
      preferredPaymentModes: ['cash'],
      financialCapacity: 200000 + i * 10000,
      services: skills.slice(0, 4),
      interests: sectors,
      hourlyRate: 250 + i * 15,
      currency: 'SAR',
      languages: ['Arabic', 'English'],
      socialMediaLinks: {},
      avatar: null
    },
    createdAt: NOW,
    updatedAt: NOW
  };
}

const COMPANY_NAMES = [
  'Al-Rajhi Construction', 'Saudi Consolidated Contractors', 'Al-Bawani Company', 'El Seif Engineering', 'Al-Yamama Company',
  'Al-Fouzan Trading & Construction', 'Al-Rashid Trading', 'Al-Mabani General Contractors JV', 'Saudi Real Estate Co', 'Arabian Pipeline Co',
  'Gulf Consolidated Contractors', 'Saudi Industrial Services'
];
const COMPANY_EMAILS = [
  'info@alrajhi-const.com', 'contact@scc.com.sa', 'projects@albawani.com', 'info@elseif.com', 'contact@alyamama.com',
  'info@alfouzan.com', 'contact@alrashid-trading.com', 'info@almabani-jv.com', 'contact@srec.com', 'info@arabianpipeline.com',
  'contact@gcc-sa.com', 'info@sis.com.sa'
];

function makeCompany(i) {
  const id = `user-company-${String(5 + i).padStart(3, '0')}`;
  const name = COMPANY_NAMES[i];
  const sectors = [...new Set([...SECTORS_POOL.sort(() => Math.random() - 0.5).slice(0, 3)])];
  return {
    id,
    email: COMPANY_EMAILS[i],
    passwordHash: PASS_HASH,
    role: 'company_owner',
    status: 'active',
    isPublic: true,
    connectionCount: 80 + Math.floor(Math.random() * 300),
    profile: {
      name,
      type: 'company',
      headline: `${sectors[0]} and Construction`,
      companyType: i % 3 === 0 ? 'Large Enterprise' : i % 3 === 1 ? 'Medium Enterprise' : 'Small Enterprise',
      registrationNumber: '1010' + (500000 + i),
      phone: '+966 11 ' + (200 + i) + ' ' + (1000 + i),
      website: 'https://example.com',
      address: 'Riyadh, Saudi Arabia',
      location: ['Riyadh', 'Jeddah', 'Dammam'][i % 3] + ', KSA',
      description: `${name} - construction and engineering.`,
      sectors,
      industry: sectors,
      employeeCount: i % 3 === 0 ? '1000+' : i % 3 === 1 ? '500-1000' : '100-500',
      yearEstablished: 1980 + (i % 30),
      certifications: ['ISO 9001', 'ISO 14001'],
      financialCapacity: 10000000 * (1 + (i % 5)),
      preferredPaymentModes: ['cash', 'barter'],
      services: ['General Contracting', 'Design-Build', 'Project Management'],
      interests: sectors,
      socialMediaLinks: {},
      avatar: null
    },
    createdAt: NOW,
    updatedAt: NOW
  };
}

function makeOpportunity(idx, creatorId, modelType, subModelType, status) {
  const id = `opp-${String(25 + idx).padStart(3, '0')}`;
  const titles = {
    project_based: ['Civil Works Package – Highway Project', 'MEP Installation – Commercial Tower', 'Structural Steel Erection – Industrial Facility', 'Site Supervision – Residential Complex', 'Design Review – Hospital Project'],
    strategic_partnership: ['JV for GCC Infrastructure', 'Long-term Alliance – Building Materials', 'Mentorship Program – Young Engineers'],
    resource_pooling: ['Bulk Cement Purchase', 'Equipment Sharing – Cranes', 'Shared BIM Resources'],
    hiring: ['Site Engineer – Riyadh', 'Project Coordinator – Jeddah', 'Quantity Surveyor – Dammam', 'MEP Draftsman – Remote'],
    competition: ['Design Competition – Mixed Use', 'RFP – Sustainability Study']
  };
  const arr = titles[modelType] || titles.project_based;
  const title = arr[idx % arr.length];
  return {
    id,
    title,
    description: title + '. Demo opportunity for PMTwin POC.',
    creatorId,
    modelType,
    subModelType: subModelType || (modelType === 'project_based' ? 'task_based' : modelType === 'hiring' ? 'professional_hiring' : 'strategic_jv'),
    status,
    intent: modelType === 'hiring' || modelType === 'competition' ? 'request' : idx % 3 === 0 ? 'offer' : 'request',
    location: 'Riyadh, KSA',
    locationCountry: 'sa',
    locationRegion: 'Riyadh',
    locationCity: 'Riyadh',
    locationDistrict: '',
    latitude: 24.7136,
    longitude: 46.6753,
    exchangeMode: 'cash',
    paymentModes: ['cash'],
    scope: { requiredSkills: ['Project Management', 'Construction'], sectors: ['Construction'], certifications: [] },
    exchangeData: { exchangeMode: 'cash', currency: 'SAR', exchangeTermsSummary: '', cashAmount: 100000, cashPaymentTerms: 'Milestone-Based', cashMilestones: '' },
    attributes: {},
    createdAt: NOW,
    updatedAt: NOW,
    collaborationModel: modelType
  };
}

function run() {
  const usersFile = loadJson('users.json');
  const companiesFile = loadJson('companies.json');
  const opportunitiesFile = loadJson('opportunities.json');
  const applicationsFile = loadJson('applications.json');
  const matchesFile = loadJson('matches.json');

  const users = usersFile.data || [];
  const companies = companiesFile.data || [];
  const opportunities = opportunitiesFile.data || [];
  const applications = applicationsFile.data || [];
  const matches = matchesFile.data || [];

  const existingUserIds = new Set(users.map(u => u.id));
  const existingCompanyIds = new Set(companies.map(c => c.id));
  const existingOppIds = new Set(opportunities.map(o => o.id));
  const existingAppIds = new Set(applications.map(a => a.id));
  const existingMatchIds = new Set(matches.map(m => m.id));

  const creatorIds = [...existingUserIds].filter(id => id.startsWith('user-pro-')).concat([...existingCompanyIds]);
  const allCandidateIds = [...existingUserIds].filter(id => id.startsWith('user-pro-'));

  // Add 20 professionals (user-pro-009 to user-pro-028)
  for (let i = 0; i < 20; i++) {
    const p = makeProfessional(i);
    if (!existingUserIds.has(p.id)) { users.push(p); existingUserIds.add(p.id); allCandidateIds.push(p.id); }
  }

  // Add 11 companies (user-company-005 to user-company-015)
  for (let i = 0; i < 11; i++) {
    const c = makeCompany(i);
    if (!existingCompanyIds.has(c.id)) { companies.push(c); existingCompanyIds.add(c.id); creatorIds.push(c.id); }
  }

  // Add 26 opportunities (opp-025 to opp-050): mix statuses, one draft
  const oppCreators = ['user-company-001', 'user-company-002', 'user-company-003', 'user-pro-001', 'user-pro-003', 'user-company-005', 'user-company-006', 'user-pro-010', 'user-pro-015'];
  const models = [
    { modelType: 'project_based', subModelType: 'task_based' },
    { modelType: 'project_based', subModelType: 'consortium' },
    { modelType: 'strategic_partnership', subModelType: 'strategic_jv' },
    { modelType: 'resource_pooling', subModelType: 'bulk_purchasing' },
    { modelType: 'hiring', subModelType: 'professional_hiring' },
    { modelType: 'competition', subModelType: 'competition_rfp' }
  ];
  for (let idx = 0; idx < 26; idx++) {
    const id = `opp-${String(25 + idx).padStart(3, '0')}`;
    if (existingOppIds.has(id)) continue;
    const creator = oppCreators[idx % oppCreators.length];
    const m = models[idx % models.length];
    const status = idx === 0 ? 'draft' : (idx % 5 === 0 ? 'in_negotiation' : idx % 7 === 0 ? 'closed' : 'published');
    const opp = makeOpportunity(idx, creator, m.modelType, m.subModelType, status);
    opportunities.push(opp);
    existingOppIds.add(id);
  }

  // Add applications: spread across opportunities and applicants
  const appApplicants = ['user-pro-001', 'user-pro-002', 'user-pro-003', 'user-pro-004', 'user-pro-005', 'user-pro-010', 'user-pro-011', 'user-pro-015', 'user-company-004'];
  const publishedOppIds = opportunities.filter(o => o.status === 'published' || o.status === 'in_negotiation').map(o => o.id);
  let appId = applications.length + 1;
  for (let i = 0; i < 25; i++) {
    const oppId = publishedOppIds[i % publishedOppIds.length];
    const applicantId = appApplicants[i % appApplicants.length];
    if (opportunities.find(o => o.id === oppId).creatorId === applicantId) continue;
    const id = 'app-' + String(appId).padStart(3, '0');
    if (existingAppIds.has(id)) { appId++; continue; }
    const statuses = ['pending', 'pending', 'reviewing', 'shortlisted', 'in_negotiation', 'accepted', 'rejected'];
    applications.push({
      id,
      opportunityId: oppId,
      applicantId,
      status: statuses[i % statuses.length],
      coverLetter: 'Demo application for POC.',
      attachments: [],
      responses: {},
      createdAt: NOW,
      updatedAt: NOW
    });
    existingAppIds.add(id);
    appId++;
  }

  // Add matches: per-opportunity (professionals and optionally companies) and ensure pipeline has content
  let matchId = matches.length + 1;
  const criteria = [{ factor: 'Skills Match', score: 0.9, details: 'Strong alignment' }, { factor: 'Experience', score: 0.85, details: 'Meets requirement' }];
  for (const opp of opportunities.filter(o => o.status === 'published')) {
    const candidates = allCandidateIds.filter(cid => {
      const oppRecord = opportunities.find(o => o.id === opp.id);
      return oppRecord && oppRecord.creatorId !== cid;
    });
    const pick = candidates.sort(() => Math.random() - 0.5).slice(0, 4 + Math.floor(Math.random() * 4));
    for (const candidateId of pick) {
      const id = 'match-' + String(matchId).padStart(3, '0');
      if (existingMatchIds.has(id)) { matchId++; continue; }
      const matchScore = 0.65 + Math.random() * 0.3;
      matches.push({
        id,
        opportunityId: opp.id,
        userId: candidateId,
        candidateId,
        matchScore,
        matchReasons: criteria,
        criteria,
        notified: matchScore >= 0.8,
        createdAt: NOW,
        updatedAt: NOW
      });
      existingMatchIds.add(id);
      matchId++;
    }
  }

  usersFile.data = users;
  companiesFile.data = companies;
  opportunitiesFile.data = opportunities;
  applicationsFile.data = applications;
  matchesFile.data = matches;

  saveJson('users.json', usersFile);
  saveJson('companies.json', companiesFile);
  saveJson('opportunities.json', opportunitiesFile);
  saveJson('applications.json', applicationsFile);
  saveJson('matches.json', matchesFile);

  console.log('Demo data expanded:');
  console.log('  Users (professionals + admin):', users.length);
  console.log('  Companies:', companies.length);
  console.log('  Opportunities:', opportunities.length);
  console.log('  Applications:', applications.length);
  console.log('  Matches:', matches.length);
  console.log('  Pending users:', users.filter(u => u.status === 'pending').length);
  console.log('  Draft opportunities:', opportunities.filter(o => o.status === 'draft').length);
}

run();
