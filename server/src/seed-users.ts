import bcrypt from 'bcryptjs';
import { query, queryOne } from './db.js';

async function seedUsers() {
  console.log('Seeding users...');
  
  const users = [
    { email: 'admin@smartclinic.com', password: 'admin123', firstName: 'Admin', lastName: 'User', role: 'admin' },
    { email: 'doctor@smartclinic.com', password: 'doctor123', firstName: 'John', lastName: 'Doctor', role: 'doctor' },
    { email: 'nurse@smartclinic.com', password: 'nurse123', firstName: 'Jane', lastName: 'Nurse', role: 'nurse' },
    { email: 'reception@smartclinic.com', password: 'reception123', firstName: 'Mary', lastName: 'Reception', role: 'receptionist' },
    { email: 'cashier@smartclinic.com', password: 'cashier123', firstName: 'Bob', lastName: 'Cashier', role: 'cashier' },
    { email: 'lab@smartclinic.com', password: 'lab123', firstName: 'Lab', lastName: 'Tech', role: 'lab_technician' },
    { email: 'pharmacy@smartclinic.com', password: 'pharmacy123', firstName: 'Phil', lastName: 'Pharmacist', role: 'pharmacist' },
  ];

  for (const userData of users) {
    try {
      // Check if user exists
      const existing = await queryOne<{ id: string }>(
        'SELECT id FROM users WHERE email = $1',
        [userData.email]
      );

      if (existing) {
        // Update password
        const passwordHash = await bcrypt.hash(userData.password, 12);
        await query(
          'UPDATE users SET password_hash = $1 WHERE email = $2',
          [passwordHash, userData.email]
        );
        console.log(`Updated password for ${userData.email}`);
      } else {
        // Create user
        const passwordHash = await bcrypt.hash(userData.password, 12);
        const user = await queryOne<{ id: string }>(
          `INSERT INTO users (email, password_hash, first_name, last_name)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [userData.email, passwordHash, userData.firstName, userData.lastName]
        );

        if (user) {
          // Assign role
          await query(
            'INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [user.id, userData.role]
          );
          console.log(`Created user ${userData.email} with role ${userData.role}`);
        }
      }
    } catch (error) {
      console.error(`Error processing ${userData.email}:`, error);
    }
  }

  console.log('Done seeding users!');
  process.exit(0);
}

seedUsers().catch(console.error);
