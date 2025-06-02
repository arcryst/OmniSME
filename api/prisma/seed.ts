import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';

const prisma = new PrismaClient();

const softwareData = [
  {
    name: 'Slack',
    description: 'Team communication and collaboration platform',
    category: 'Communication',
    vendor: 'Slack Technologies',
    costPerLicense: 8.75,
    billingCycle: 'MONTHLY' as const,
    logoUrl: 'https://cdn.brandfetch.io/idIaLn9OSF/w/512/h/512/theme/dark/icon.png',
    websiteUrl: 'https://slack.com',
    requiresApproval: false,
  },
  {
    name: 'Microsoft Office 365',
    description: 'Complete office productivity suite',
    category: 'Productivity',
    vendor: 'Microsoft',
    costPerLicense: 12.50,
    billingCycle: 'MONTHLY' as const,
    logoUrl: 'https://cdn.brandfetch.io/idxAg10C0L/w/512/h/512/theme/dark/icon.png',
    websiteUrl: 'https://office.com',
    requiresApproval: true,
  },
  {
    name: 'Zoom',
    description: 'Video conferencing and online meetings',
    category: 'Communication',
    vendor: 'Zoom Video Communications',
    costPerLicense: 14.99,
    billingCycle: 'MONTHLY' as const,
    logoUrl: 'https://cdn.brandfetch.io/idPBLxi8Cq/w/512/h/512/theme/dark/icon.png',
    websiteUrl: 'https://zoom.us',
    requiresApproval: false,
  },
  {
    name: 'GitHub',
    description: 'Code hosting and version control',
    category: 'Development',
    vendor: 'GitHub Inc.',
    costPerLicense: 4.00,
    billingCycle: 'MONTHLY' as const,
    logoUrl: 'https://cdn.brandfetch.io/idZAyF9rlg/w/512/h/512/theme/dark/icon.png',
    websiteUrl: 'https://github.com',
    requiresApproval: true,
  },
  {
    name: 'Figma',
    description: 'Collaborative design tool',
    category: 'Design',
    vendor: 'Figma Inc.',
    costPerLicense: 15.00,
    billingCycle: 'MONTHLY' as const,
    logoUrl: 'https://cdn.brandfetch.io/idD4hbLgFz/w/512/h/512/theme/dark/icon.png',
    websiteUrl: 'https://figma.com',
    requiresApproval: true,
  },
  {
    name: 'Notion',
    description: 'All-in-one workspace for notes and collaboration',
    category: 'Productivity',
    vendor: 'Notion Labs',
    costPerLicense: 10.00,
    billingCycle: 'MONTHLY' as const,
    logoUrl: 'https://cdn.brandfetch.io/id8cyHkp5B/w/512/h/512/theme/dark/icon.png',
    websiteUrl: 'https://notion.so',
    requiresApproval: false,
  },
  {
    name: 'Jira',
    description: 'Project management and issue tracking',
    category: 'Project Management',
    vendor: 'Atlassian',
    costPerLicense: 7.75,
    billingCycle: 'MONTHLY' as const,
    logoUrl: 'https://cdn.brandfetch.io/idnrCPuv87/w/512/h/512/theme/dark/icon.png',
    websiteUrl: 'https://www.atlassian.com/software/jira',
    requiresApproval: true,
  },
  {
    name: '1Password',
    description: 'Password manager for teams',
    category: 'Security',
    vendor: 'AgileBits',
    costPerLicense: 8.00,
    billingCycle: 'MONTHLY' as const,
    logoUrl: 'https://cdn.brandfetch.io/id-nqvlPKY/w/512/h/512/theme/dark/icon.png',
    websiteUrl: 'https://1password.com',
    requiresApproval: false,
  },
  {
    name: 'Adobe Creative Cloud',
    description: 'Complete creative suite including Photoshop, Illustrator, etc.',
    category: 'Design',
    vendor: 'Adobe',
    costPerLicense: 54.99,
    billingCycle: 'MONTHLY' as const,
    logoUrl: 'https://cdn.brandfetch.io/idAX8x3XeD/w/512/h/512/theme/dark/icon.png',
    websiteUrl: 'https://adobe.com',
    requiresApproval: true,
  },
  {
    name: 'Salesforce',
    description: 'Customer relationship management platform',
    category: 'Sales',
    vendor: 'Salesforce',
    costPerLicense: 75.00,
    billingCycle: 'MONTHLY' as const,
    logoUrl: 'https://cdn.brandfetch.io/idM3k-fbSw/w/512/h/512/theme/dark/icon.png',
    websiteUrl: 'https://salesforce.com',
    requiresApproval: true,
  },
  {
    name: 'Grammarly',
    description: 'Writing assistant and grammar checker',
    category: 'Productivity',
    vendor: 'Grammarly Inc.',
    costPerLicense: 12.00,
    billingCycle: 'MONTHLY' as const,
    logoUrl: 'https://cdn.brandfetch.io/idROmjEf6x/w/512/h/512/theme/dark/icon.png',
    websiteUrl: 'https://grammarly.com',
    requiresApproval: false,
  },
  {
    name: 'Tableau',
    description: 'Data visualization and business intelligence',
    category: 'Analytics',
    vendor: 'Tableau Software',
    costPerLicense: 75.00,
    billingCycle: 'MONTHLY' as const,
    logoUrl: 'https://cdn.brandfetch.io/id3sLBBhOr/w/512/h/512/theme/dark/icon.png',
    websiteUrl: 'https://tableau.com',
    requiresApproval: true,
  },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Clean the database
  await prisma.$transaction([
    prisma.approval.deleteMany(),
    prisma.request.deleteMany(),
    prisma.license.deleteMany(),
    prisma.software.deleteMany(),
    prisma.user.deleteMany(),
    prisma.organization.deleteMany(),
  ]);

  // Create organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Demo Company',
      domain: 'demo.com',
    },
  });

  console.log('✅ Created organization:', organization.name);

  // Create users
  const adminPassword = await hashPassword('admin123');
  const userPassword = await hashPassword('user123');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      organizationId: organization.id,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@demo.com',
      passwordHash: userPassword,
      firstName: 'Manager',
      lastName: 'User',
      role: 'MANAGER',
      organizationId: organization.id,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'john@demo.com',
      passwordHash: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
      organizationId: organization.id,
      managerId: manager.id,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@demo.com',
      passwordHash: userPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'USER',
      organizationId: organization.id,
      managerId: manager.id,
    },
  });

  console.log('✅ Created users');

  // Create software
  const software = await Promise.all(
    softwareData.map(data =>
      prisma.software.create({
        data: {
          ...data,
          organizationId: organization.id,
        },
      })
    )
  );

  console.log('✅ Created', software.length, 'software items');

  // Create some licenses for users
  const licenses = await Promise.all([
    // Admin has some licenses
    prisma.license.create({
      data: {
        userId: admin.id,
        softwareId: software[0].id, // Slack
        organizationId: organization.id,
        status: 'ACTIVE',
      },
    }),
    prisma.license.create({
      data: {
        userId: admin.id,
        softwareId: software[1].id, // Office 365
        organizationId: organization.id,
        status: 'ACTIVE',
      },
    }),
    // User1 has some licenses
    prisma.license.create({
      data: {
        userId: user1.id,
        softwareId: software[0].id, // Slack
        organizationId: organization.id,
        status: 'ACTIVE',
      },
    }),
    prisma.license.create({
      data: {
        userId: user1.id,
        softwareId: software[2].id, // Zoom
        organizationId: organization.id,
        status: 'ACTIVE',
      },
    }),
    // User2 has one license
    prisma.license.create({
      data: {
        userId: user2.id,
        softwareId: software[0].id, // Slack
        organizationId: organization.id,
        status: 'ACTIVE',
      },
    }),
  ]);

  console.log('✅ Created', licenses.length, 'licenses');

  // Create some pending requests
  const requests = await Promise.all([
    prisma.request.create({
      data: {
        userId: user1.id,
        softwareId: software[3].id, // GitHub
        organizationId: organization.id,
        justification: 'Need access to company repositories for development work',
        priority: 'HIGH',
        status: 'PENDING',
      },
    }),
    prisma.request.create({
      data: {
        userId: user2.id,
        softwareId: software[4].id, // Figma
        organizationId: organization.id,
        justification: 'Required for designing new marketing materials',
        priority: 'MEDIUM',
        status: 'PENDING',
      },
    }),
  ]);

  console.log('✅ Created', requests.length, 'pending requests');

  console.log('\n📋 Test credentials:');
  console.log('Admin: admin@demo.com / admin123');
  console.log('Manager: manager@demo.com / user123');
  console.log('User 1: john@demo.com / user123');
  console.log('User 2: jane@demo.com / user123');
  console.log('\n✨ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });