const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  try {
    // Check if admin exists
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@automation-hub.local' },
    });

    if (existing) {
      console.log('✅ Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'admin@automation-hub.local',
        password: hashedPassword,
      },
    });

    console.log('✅ Admin user created:', user.email);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
