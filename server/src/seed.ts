import { pool } from './db.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('🌱 Seeding database with default admin user...');
  
  try {
    // Check if admin user already exists
    const existingUser = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      ['admin@crystalhealth.com']
    );
    
    if (existingUser.rows.length > 0) {
      console.log('⚠️  Admin user already exists. Skipping...');
      console.log('');
      console.log('📧 Email: admin@crystalhealth.com');
      console.log('🔑 Password: Admin123!');
      await pool.end();
      return;
    }
    
    // Create password hash
    const passwordHash = await bcrypt.hash('Admin123!', 12);
    
    // Insert admin user
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, employee_id, department)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      ['admin@crystalhealth.com', passwordHash, 'System', 'Administrator', 'EMP001', 'Administration']
    );
    
    const userId = userResult.rows[0].id;
    
    // Assign admin role
    await pool.query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, $2)`,
      [userId, 'admin']
    );
    
    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('       LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:    admin@crystalhealth.com');
    console.log('🔑 Password: Admin123!');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('You can now login to the application!');
    
    // Also create some sample data
    console.log('');
    console.log('📊 Creating sample data...');
    
    // Create sample patients
    await pool.query(`
      INSERT INTO patients (patient_number, first_name, last_name, date_of_birth, gender, phone, email, status, created_by)
      VALUES 
        ('PAT-001', 'John', 'Doe', '1985-03-15', 'male', '+1234567890', 'john.doe@email.com', 'active', $1),
        ('PAT-002', 'Jane', 'Smith', '1990-07-22', 'female', '+1234567891', 'jane.smith@email.com', 'active', $1),
        ('PAT-003', 'Robert', 'Johnson', '1978-11-08', 'male', '+1234567892', 'robert.j@email.com', 'active', $1)
      ON CONFLICT (patient_number) DO NOTHING
    `, [userId]);
    
    // Create sample beds
    await pool.query(`
      INSERT INTO beds (bed_number, room_number, department, bed_type, status, daily_rate)
      VALUES 
        ('BED-101', 'Room 101', 'General Ward', 'standard', 'available', 150.00),
        ('BED-102', 'Room 101', 'General Ward', 'standard', 'available', 150.00),
        ('BED-201', 'Room 201', 'ICU', 'icu', 'available', 500.00),
        ('BED-301', 'Room 301', 'Emergency', 'emergency', 'available', 300.00)
      ON CONFLICT (bed_number) DO NOTHING
    `);
    
    console.log('✅ Sample data created!');
    console.log('   - 3 sample patients');
    console.log('   - 4 sample beds');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
