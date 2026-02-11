import { pool } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

async function migratePatientFields() {
  console.log('🚀 Running patient fields migration...');
  
  try {
    // Add new columns to patients table
    await pool.query(`
      ALTER TABLE patients 
      ADD COLUMN IF NOT EXISTS photo_url TEXT,
      ADD COLUMN IF NOT EXISTS other_names VARCHAR(255),
      ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Ghana',
      ADD COLUMN IF NOT EXISTS region VARCHAR(100),
      ADD COLUMN IF NOT EXISTS constituency VARCHAR(100),
      ADD COLUMN IF NOT EXISTS district VARCHAR(100),
      ADD COLUMN IF NOT EXISTS id_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS id_number VARCHAR(100)
    `);
    console.log('✅ Added new columns to patients table');

    // Create Ghana locations table for regions, constituencies, districts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ghana_regions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        code VARCHAR(10)
      )
    `);
    console.log('✅ Created ghana_regions table');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ghana_constituencies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        region_id INTEGER REFERENCES ghana_regions(id),
        UNIQUE(name, region_id)
      )
    `);
    console.log('✅ Created ghana_constituencies table');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ghana_districts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        constituency_id INTEGER REFERENCES ghana_constituencies(id),
        region_id INTEGER REFERENCES ghana_regions(id),
        UNIQUE(name, region_id)
      )
    `);
    console.log('✅ Created ghana_districts table');

    // Insert Ghana regions
    const regions = [
      'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern',
      'Volta', 'Northern', 'Upper East', 'Upper West', 'Brong Ahafo',
      'Western North', 'Ahafo', 'Bono East', 'Oti', 'North East', 'Savannah'
    ];

    for (const region of regions) {
      await pool.query(`
        INSERT INTO ghana_regions (name) VALUES ($1)
        ON CONFLICT (name) DO NOTHING
      `, [region]);
    }
    console.log('✅ Inserted Ghana regions');

    // Insert sample constituencies and districts for Greater Accra
    const greaterAccraData = [
      { constituency: 'Ablekuma Central', districts: ['Ablekuma Central'] },
      { constituency: 'Ablekuma North', districts: ['Ablekuma North'] },
      { constituency: 'Ablekuma South', districts: ['Ablekuma South'] },
      { constituency: 'Ablekuma West', districts: ['Ablekuma West'] },
      { constituency: 'Accra Central', districts: ['Accra Metropolitan'] },
      { constituency: 'Ada', districts: ['Ada East', 'Ada West'] },
      { constituency: 'Adentan', districts: ['Adentan Municipal'] },
      { constituency: 'Ashaiman', districts: ['Ashaiman Municipal'] },
      { constituency: 'Ayawaso Central', districts: ['Ayawaso Central'] },
      { constituency: 'Ayawaso East', districts: ['Ayawaso East'] },
      { constituency: 'Ayawaso North', districts: ['Ayawaso North'] },
      { constituency: 'Ayawaso West', districts: ['Ayawaso West Municipal'] },
      { constituency: 'Bortianor-Ngleshie Amanfro', districts: ['Ga South Municipal'] },
      { constituency: 'Dade Kotopon', districts: ['La Dade Kotopon Municipal'] },
      { constituency: 'Dome-Kwabenya', districts: ['Ga East Municipal'] },
      { constituency: 'Klottey Korle', districts: ['Korle Klottey Municipal'] },
      { constituency: 'Kpone Katamanso', districts: ['Kpone Katamanso Municipal'] },
      { constituency: 'Krowor', districts: ['Krowor Municipal'] },
      { constituency: 'La Dadekotopon', districts: ['La Dade Kotopon Municipal'] },
      { constituency: 'La Nkwantanang Madina', districts: ['La Nkwantanang Madina Municipal'] },
      { constituency: 'Ledzokuku', districts: ['Ledzokuku Municipal'] },
      { constituency: 'Madina', districts: ['La Nkwantanang Madina Municipal'] },
      { constituency: 'Ningo Prampram', districts: ['Ningo Prampram District'] },
      { constituency: 'Odododiodio', districts: ['Accra Metropolitan'] },
      { constituency: 'Okaikwei Central', districts: ['Okaikwei North Municipal'] },
      { constituency: 'Okaikwei North', districts: ['Okaikwei North Municipal'] },
      { constituency: 'Okaikwei South', districts: ['Ablekuma South'] },
      { constituency: 'Shai Osudoku', districts: ['Shai Osudoku District'] },
      { constituency: 'Tema Central', districts: ['Tema Metropolitan'] },
      { constituency: 'Tema East', districts: ['Tema Metropolitan'] },
      { constituency: 'Tema West', districts: ['Tema West Municipal'] },
      { constituency: 'Trobu', districts: ['Ga North Municipal'] },
      { constituency: 'Weija-Gbawe', districts: ['Weija Gbawe Municipal'] }
    ];

    const greaterAccraRegion = await pool.query(`SELECT id FROM ghana_regions WHERE name = 'Greater Accra'`);
    const regionId = greaterAccraRegion.rows[0]?.id;

    if (regionId) {
      for (const item of greaterAccraData) {
        const constResult = await pool.query(`
          INSERT INTO ghana_constituencies (name, region_id) VALUES ($1, $2)
          ON CONFLICT (name, region_id) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `, [item.constituency, regionId]);
        
        const constId = constResult.rows[0]?.id;
        if (constId) {
          for (const district of item.districts) {
            await pool.query(`
              INSERT INTO ghana_districts (name, constituency_id, region_id) VALUES ($1, $2, $3)
              ON CONFLICT (name, region_id) DO NOTHING
            `, [district, constId, regionId]);
          }
        }
      }
    }
    console.log('✅ Inserted Greater Accra constituencies and districts');

    // Insert sample data for Ashanti Region
    const ashantiData = [
      { constituency: 'Kumasi Central', districts: ['Kumasi Metropolitan'] },
      { constituency: 'Manhyia North', districts: ['Kumasi Metropolitan'] },
      { constituency: 'Manhyia South', districts: ['Kumasi Metropolitan'] },
      { constituency: 'Subin', districts: ['Kumasi Metropolitan'] },
      { constituency: 'Bantama', districts: ['Kumasi Metropolitan'] },
      { constituency: 'Nhyiaeso', districts: ['Kumasi Metropolitan'] },
      { constituency: 'Kwadaso', districts: ['Kwadaso Municipal'] },
      { constituency: 'Oforikrom', districts: ['Oforikrom Municipal'] },
      { constituency: 'Asokwa', districts: ['Asokwa Municipal'] },
      { constituency: 'Asawase', districts: ['Asokore Mampong Municipal'] },
      { constituency: 'Ejisu', districts: ['Ejisu Municipal'] },
      { constituency: 'Juaben', districts: ['Ejisu Municipal'] },
      { constituency: 'Bekwai', districts: ['Bekwai Municipal'] },
      { constituency: 'Obuasi East', districts: ['Obuasi Municipal'] },
      { constituency: 'Obuasi West', districts: ['Obuasi Municipal'] }
    ];

    const ashantiRegion = await pool.query(`SELECT id FROM ghana_regions WHERE name = 'Ashanti'`);
    const ashantiRegionId = ashantiRegion.rows[0]?.id;

    if (ashantiRegionId) {
      for (const item of ashantiData) {
        const constResult = await pool.query(`
          INSERT INTO ghana_constituencies (name, region_id) VALUES ($1, $2)
          ON CONFLICT (name, region_id) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `, [item.constituency, ashantiRegionId]);
        
        const constId = constResult.rows[0]?.id;
        if (constId) {
          for (const district of item.districts) {
            await pool.query(`
              INSERT INTO ghana_districts (name, constituency_id, region_id) VALUES ($1, $2, $3)
              ON CONFLICT (name, region_id) DO NOTHING
            `, [district, constId, ashantiRegionId]);
          }
        }
      }
    }
    console.log('✅ Inserted Ashanti constituencies and districts');

    console.log('');
    console.log('✅ Patient fields migration completed!');
    console.log('');
    console.log('New patient fields:');
    console.log('  - photo_url (patient photo)');
    console.log('  - other_names (middle names)');
    console.log('  - country (default: Ghana)');
    console.log('  - region');
    console.log('  - constituency');
    console.log('  - district');
    console.log('  - id_type (Ghana Card, Voters Card, Passport, Drivers License)');
    console.log('  - id_number');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migratePatientFields();
