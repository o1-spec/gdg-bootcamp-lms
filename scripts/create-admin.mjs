#!/usr/bin/env node
/**
 * Initial Production Administrator Provisioning Script
 *
 * Usage:
 *   ADMIN_EMAIL=admin@gdglasu.dev ADMIN_PASSWORD=StrongPassword123! npm run create-admin
 * Or interactively:
 *   npm run create-admin
 * Or with flags:
 *   npm run create-admin -- --email=admin@gdglasu.dev --password=StrongPassword123!
 */

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const prisma = new PrismaClient();

function getArg(name) {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (arg) return arg.split('=')[1];
  return null;
}

async function prompt(question, isPassword = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('====================================================');
  console.log('GDG LASU Bootcamp LMS: Production Admin Provisioner');
  console.log('====================================================');

  let email = process.env.ADMIN_EMAIL || getArg('email');
  let password = process.env.ADMIN_PASSWORD || getArg('password');
  let firstName = process.env.ADMIN_FIRST_NAME || getArg('firstName') || 'Super';
  let lastName = process.env.ADMIN_LAST_NAME || getArg('lastName') || 'Admin';

  if (!email) {
    email = await prompt('Enter Admin Email: ');
  }

  if (!email || !email.includes('@')) {
    console.error('❌ Error: A valid email address is required.');
    process.exit(1);
  }

  if (!password) {
    password = await prompt('Enter Admin Password (min 8 characters): ', true);
  }

  if (!password || password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters long.');
    process.exit(1);
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    const passwordHash = await bcrypt.hash(password, 12);

    if (existing) {
      console.log(`\nUser with email "${email}" already exists. Upgrading to SUPER_ADMIN...`);
      const updated = await prisma.user.update({
        where: { email },
        data: {
          role: Role.SUPER_ADMIN,
          isActive: true,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
        },
      });

      console.log(`✅ Success: User [${updated.email}] updated to role [${updated.role}].`);
    } else {
      console.log(`\nCreating new SUPER_ADMIN user for "${email}"...`);
      const created = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          displayName: `${firstName} ${lastName}`,
          passwordHash,
          role: Role.SUPER_ADMIN,
          isActive: true,
          onboardingCompleted: true,
          notificationPreferences: {
            assignments: true,
            sessions: true,
            resources: true,
            announcements: true,
            feedback: true,
          },
        },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
        },
      });

      console.log(`✅ Success: Created new SUPER_ADMIN [${created.email}] (ID: ${created.id}).`);
    }

    console.log('\nYou can now log in at /login with these credentials.');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Error provisioning admin account:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
