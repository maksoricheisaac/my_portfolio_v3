/**
 * Optional non-interactive bootstrap (CI, scripted deploys). The recommended path is the setup
 * wizard at /admin/setup.
 *
 * Creates the admin from ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME when it does not exist and
 * imports the initial projects. Safe to re-run: existing rows are left untouched unless
 * SEED_RESET_ADMIN_PASSWORD=true.
 */
import 'dotenv/config';
import { hash } from '@node-rs/argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { passwordProblem } from '../src/auth/password-policy';
import { importSeedProjects } from '../src/setup/seed-projects';

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Admin';

  if (email && password) {
    const problem = passwordProblem(password, email);
    if (problem) throw new Error(`ADMIN_PASSWORD rejected: ${problem}`);

    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (!existing) {
      await prisma.adminUser.create({
        data: { email, name, passwordHash: await hash(password) },
      });
      console.log(`Admin created: ${email}`);
    } else if (process.env.SEED_RESET_ADMIN_PASSWORD === 'true') {
      await prisma.adminUser.update({
        where: { email },
        data: {
          passwordHash: await hash(password),
          failedLogins: 0,
          lockedUntil: null,
        },
      });
      console.log(`Admin password reset: ${email}`);
    } else {
      console.log(`Admin already exists: ${email}`);
    }
  } else {
    console.log(
      'ADMIN_EMAIL / ADMIN_PASSWORD not set: admin left to the setup wizard.',
    );
  }

  const count = await importSeedProjects(prisma);
  console.log(`Projects ensured: ${count}`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
