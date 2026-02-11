import { Router, Response } from 'express';
import { query, queryOne } from '../db.js';
import { authMiddleware, type AuthRequest } from '../auth.js';

const router = Router();
router.use(authMiddleware);

// Common ICD-10 codes for quick access (subset of full ICD-10 database)
const commonICD10Codes = [
  // Infectious diseases
  { code: 'A09', description: 'Infectious gastroenteritis and colitis, unspecified', category: 'Infectious Diseases' },
  { code: 'A49.9', description: 'Bacterial infection, unspecified', category: 'Infectious Diseases' },
  { code: 'B34.9', description: 'Viral infection, unspecified', category: 'Infectious Diseases' },
  { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', category: 'Respiratory' },
  { code: 'J18.9', description: 'Pneumonia, unspecified organism', category: 'Respiratory' },
  { code: 'J20.9', description: 'Acute bronchitis, unspecified', category: 'Respiratory' },
  { code: 'J45.909', description: 'Unspecified asthma, uncomplicated', category: 'Respiratory' },
  
  // Cardiovascular
  { code: 'I10', description: 'Essential (primary) hypertension', category: 'Cardiovascular' },
  { code: 'I25.10', description: 'Atherosclerotic heart disease of native coronary artery', category: 'Cardiovascular' },
  { code: 'I50.9', description: 'Heart failure, unspecified', category: 'Cardiovascular' },
  { code: 'I63.9', description: 'Cerebral infarction, unspecified', category: 'Cardiovascular' },
  
  // Endocrine/Metabolic
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Endocrine' },
  { code: 'E10.9', description: 'Type 1 diabetes mellitus without complications', category: 'Endocrine' },
  { code: 'E03.9', description: 'Hypothyroidism, unspecified', category: 'Endocrine' },
  { code: 'E05.90', description: 'Thyrotoxicosis, unspecified without thyrotoxic crisis', category: 'Endocrine' },
  { code: 'E78.5', description: 'Hyperlipidemia, unspecified', category: 'Endocrine' },
  
  // Gastrointestinal
  { code: 'K21.0', description: 'Gastro-esophageal reflux disease with esophagitis', category: 'Gastrointestinal' },
  { code: 'K29.70', description: 'Gastritis, unspecified, without bleeding', category: 'Gastrointestinal' },
  { code: 'K58.9', description: 'Irritable bowel syndrome without diarrhea', category: 'Gastrointestinal' },
  { code: 'K80.20', description: 'Calculus of gallbladder without cholecystitis', category: 'Gastrointestinal' },
  
  // Musculoskeletal
  { code: 'M54.5', description: 'Low back pain', category: 'Musculoskeletal' },
  { code: 'M25.50', description: 'Pain in unspecified joint', category: 'Musculoskeletal' },
  { code: 'M79.3', description: 'Panniculitis, unspecified', category: 'Musculoskeletal' },
  { code: 'M17.9', description: 'Osteoarthritis of knee, unspecified', category: 'Musculoskeletal' },
  
  // Mental Health
  { code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified', category: 'Mental Health' },
  { code: 'F41.9', description: 'Anxiety disorder, unspecified', category: 'Mental Health' },
  { code: 'F10.20', description: 'Alcohol dependence, uncomplicated', category: 'Mental Health' },
  
  // Genitourinary
  { code: 'N39.0', description: 'Urinary tract infection, site not specified', category: 'Genitourinary' },
  { code: 'N40.0', description: 'Benign prostatic hyperplasia without lower urinary tract symptoms', category: 'Genitourinary' },
  { code: 'N18.9', description: 'Chronic kidney disease, unspecified', category: 'Genitourinary' },
  
  // Skin
  { code: 'L30.9', description: 'Dermatitis, unspecified', category: 'Skin' },
  { code: 'L03.90', description: 'Cellulitis, unspecified', category: 'Skin' },
  { code: 'B35.9', description: 'Dermatophytosis, unspecified', category: 'Skin' },
  
  // Neurological
  { code: 'G43.909', description: 'Migraine, unspecified, not intractable', category: 'Neurological' },
  { code: 'G40.909', description: 'Epilepsy, unspecified, not intractable', category: 'Neurological' },
  { code: 'R51', description: 'Headache', category: 'Neurological' },
  
  // Symptoms/Signs
  { code: 'R50.9', description: 'Fever, unspecified', category: 'Symptoms' },
  { code: 'R05', description: 'Cough', category: 'Symptoms' },
  { code: 'R10.9', description: 'Unspecified abdominal pain', category: 'Symptoms' },
  { code: 'R53.83', description: 'Other fatigue', category: 'Symptoms' },
  { code: 'R42', description: 'Dizziness and giddiness', category: 'Symptoms' },
  
  // Pandemic/Notifiable diseases
  { code: 'U07.1', description: 'COVID-19, virus identified', category: 'Pandemic' },
  { code: 'U07.2', description: 'COVID-19, virus not identified', category: 'Pandemic' },
  { code: 'A01.0', description: 'Typhoid fever', category: 'Notifiable' },
  { code: 'A00.9', description: 'Cholera, unspecified', category: 'Notifiable' },
  { code: 'A37.90', description: 'Whooping cough, unspecified species', category: 'Notifiable' },
  { code: 'B05.9', description: 'Measles without complication', category: 'Notifiable' },
  { code: 'A80.9', description: 'Acute poliomyelitis, unspecified', category: 'Notifiable' },
  { code: 'A33', description: 'Tetanus neonatorum', category: 'Notifiable' },
  { code: 'B15.9', description: 'Hepatitis A without hepatic coma', category: 'Notifiable' },
  { code: 'B16.9', description: 'Acute hepatitis B without delta-agent', category: 'Notifiable' },
  { code: 'A15.0', description: 'Tuberculosis of lung', category: 'Notifiable' },
  { code: 'B20', description: 'Human immunodeficiency virus [HIV] disease', category: 'Notifiable' },
  { code: 'A90', description: 'Dengue fever [classical dengue]', category: 'Notifiable' },
  { code: 'A92.0', description: 'Chikungunya virus disease', category: 'Notifiable' },
  { code: 'B50.9', description: 'Plasmodium falciparum malaria, unspecified', category: 'Notifiable' }
];

// Notifiable disease codes for pandemic tracking
const notifiableDiseases = [
  'U07.1', 'U07.2', // COVID-19
  'A01.0', // Typhoid
  'A00.9', // Cholera
  'A37.90', // Whooping cough
  'B05.9', // Measles
  'A80.9', // Polio
  'A33', // Tetanus
  'B15.9', 'B16.9', // Hepatitis
  'A15.0', // TB
  'B20', // HIV
  'A90', // Dengue
  'A92.0', // Chikungunya
  'B50.9' // Malaria
];

// Search ICD-10 codes
router.get('/search', async (req: AuthRequest, res: Response) => {
  try {
    const { q, category, limit = '50' } = req.query;
    
    let results = commonICD10Codes;
    
    if (q) {
      const searchTerm = (q as string).toLowerCase();
      results = results.filter(code => 
        code.code.toLowerCase().includes(searchTerm) ||
        code.description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (category) {
      results = results.filter(code => code.category === category);
    }
    
    res.json(results.slice(0, parseInt(limit as string)));
  } catch (error) {
    console.error('ICD-10 search error:', error);
    res.status(500).json({ error: 'Failed to search ICD-10 codes' });
  }
});

// Get all categories
router.get('/categories', async (req: AuthRequest, res: Response) => {
  try {
    const categories = [...new Set(commonICD10Codes.map(code => code.category))];
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Get notifiable diseases (for pandemic tracking)
router.get('/notifiable', async (req: AuthRequest, res: Response) => {
  try {
    const notifiable = commonICD10Codes.filter(code => 
      notifiableDiseases.includes(code.code)
    );
    res.json(notifiable);
  } catch (error) {
    console.error('Get notifiable diseases error:', error);
    res.status(500).json({ error: 'Failed to get notifiable diseases' });
  }
});

// Check if a diagnosis is notifiable
router.get('/check-notifiable/:code', async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params;
    const isNotifiable = notifiableDiseases.includes(code);
    const diseaseInfo = commonICD10Codes.find(c => c.code === code);
    
    res.json({
      code,
      isNotifiable,
      disease: diseaseInfo || null,
      message: isNotifiable 
        ? 'This is a notifiable disease. Please report to public health authorities.'
        : null
    });
  } catch (error) {
    console.error('Check notifiable error:', error);
    res.status(500).json({ error: 'Failed to check notifiable status' });
  }
});

// Get diagnosis statistics for pandemic monitoring
router.get('/statistics', async (req: AuthRequest, res: Response) => {
  try {
    const { start_date, end_date } = req.query;
    
    // Query diagnosis counts from medical records
    const stats = await query(`
      SELECT 
        diagnosis_code,
        diagnosis,
        COUNT(*) as count,
        DATE(visit_date) as date
      FROM medical_records
      WHERE diagnosis_code IS NOT NULL
      ${start_date ? `AND visit_date >= $1` : ''}
      ${end_date ? `AND visit_date <= $${start_date ? '2' : '1'}` : ''}
      GROUP BY diagnosis_code, diagnosis, DATE(visit_date)
      ORDER BY count DESC
      LIMIT 50
    `, [start_date, end_date].filter(Boolean));
    
    // Flag notifiable diseases
    const statsWithFlags = stats.map((stat: any) => ({
      ...stat,
      isNotifiable: notifiableDiseases.includes(stat.diagnosis_code)
    }));
    
    res.json(statsWithFlags);
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Failed to get diagnosis statistics' });
  }
});

export default router;
