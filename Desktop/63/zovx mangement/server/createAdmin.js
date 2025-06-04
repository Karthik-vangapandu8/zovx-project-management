const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();

const createAdmin = async () => {
  try {
    console.log('🔄 Connecting to PostgreSQL...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'sandeep@zovx.pro' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists, updating password...');
      
      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('Sandeep@8332', salt);
      
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log('✅ Admin password updated successfully!');
    } else {
      // Create new admin user
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('Sandeep@8332', salt);

      const adminUser = await prisma.user.create({
        data: {
          name: 'Sandeep Kumar',
          email: 'sandeep@zovx.pro',
          password: hashedPassword,
          role: 'ADMIN',
          department: 'Management',
          position: 'CEO/Founder',
          avatar: 'https://ui-avatars.com/api/?name=Sandeep+Kumar&background=1976d2&color=fff'
        }
      });

      console.log('✅ Admin user created successfully!');
    }

    console.log('📧 Email: sandeep@zovx.pro');
    console.log('🔑 Password: Sandeep@8332');
    console.log('👑 Role: Admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
};

createAdmin(); 