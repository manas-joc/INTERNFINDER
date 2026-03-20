import db from './index.js';

const jobTitles = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'Product Manager',
  'UI/UX Designer', 'Graphic Designer', 'Marketing Specialist', 'Digital Marketing Manager',
  'Financial Analyst', 'Accountant', 'HR Coordinator', 'Recruiter',
  'Sales Representative', 'Account Executive', 'Customer Support Specialist', 'Operations Manager',
  'Business Analyst', 'Project Manager', 'Content Writer', 'Copywriter',
  'Systems Administrator', 'DevOps Engineer', 'Cloud Architect', 'Security Analyst'
];

const companies = [
  'TechCorp', 'Innovate LLC', 'Global Solutions', 'NextGen Systems',
  'Alpha Industries', 'Beta Finance', 'Gamma Designs', 'Delta Marketing',
  'Epsilon Tech', 'Zeta Analytics', 'Omega Corp', 'Sigma Software',
  'CloudNet', 'DataFlow', 'CreativeMinds', 'FinTech Partners',
  'HealthPlus', 'EduTech', 'GreenEnergy', 'SmartHome Inc'
];

const locations = [
  'Bangalore, Karnataka', 'Mumbai, Maharashtra', 'Pune, Maharashtra', 'Hyderabad, Telangana',
  'Chennai, Tamil Nadu', 'New Delhi, Delhi', 'Gurgaon, Haryana', 'Noida, Uttar Pradesh',
  'Kolkata, West Bengal', 'Ahmedabad, Gujarat', 'Remote', 'Jaipur, Rajasthan',
  'Chandigarh', 'Indore, Madhya Pradesh', 'Kochi, Kerala', 'Coimbatore, Tamil Nadu'
];

const types = ['Internship', 'Full-time', 'Part-time', 'Contract'];

const descriptions = [
  'We are looking for a motivated individual to join our team. You will work on exciting projects and collaborate with cross-functional teams.',
  'Join our fast-growing startup! We offer a dynamic environment where you can learn and grow your skills rapidly.',
  'An excellent opportunity for a detail-oriented professional. You will be responsible for managing key tasks and driving results.',
  'We are seeking a creative problem solver. If you are passionate about innovation and excellence, apply now.',
  'Looking for a team player with strong communication skills. You will interact with clients and help deliver top-notch solutions.'
];

function generateSalary(type: string) {
  if (type === 'Internship') {
    const stipends = ['₹10,000 - ₹15,000 / month', '₹15,000 - ₹25,000 / month', '₹20,000 - ₹30,000 / month', 'Unpaid'];
    return stipends[Math.floor(Math.random() * stipends.length)];
  } else if (type === 'Part-time') {
    const ptSalaries = ['₹15,000 - ₹25,000 / month', '₹20,000 - ₹40,000 / month', '₹200 - ₹500 / hour'];
    return ptSalaries[Math.floor(Math.random() * ptSalaries.length)];
  } else {
    // Full-time or Contract
    const ftSalaries = ['₹4,00,000 - ₹6,00,000 LPA', '₹6,00,000 - ₹10,00,000 LPA', '₹10,00,000 - ₹15,00,000 LPA', '₹15,00,000 - ₹25,00,000 LPA', '₹25,00,000+ LPA'];
    return ftSalaries[Math.floor(Math.random() * ftSalaries.length)];
  }
}

export function seedJobs() {
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM jobs');
  const { count } = countStmt.get() as { count: number };

  if (count === 0) {
    console.log('Seeding 100 jobs...');
    const insertStmt = db.prepare('INSERT INTO jobs (title, company, location, salary, description, type) VALUES (?, ?, ?, ?, ?, ?)');
    
    const transaction = db.transaction(() => {
      for (let i = 0; i < 100; i++) {
        const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
        const company = companies[Math.floor(Math.random() * companies.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        const salary = generateSalary(type);
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];
        
        insertStmt.run(title, company, location, salary, description, type);
      }
    });

    transaction();
    console.log('Successfully seeded 100 jobs.');
  }
}
