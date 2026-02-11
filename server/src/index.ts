import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import patientsRoutes from './routes/patients.js';
import appointmentsRoutes from './routes/appointments.js';
import dashboardRoutes from './routes/dashboard.js';
import bedsRoutes from './routes/beds.js';
import alertsRoutes from './routes/alerts.js';
import revenueRoutes from './routes/revenue.js';
import activitiesRoutes from './routes/activities.js';
import laboratoryRoutes from './routes/laboratory.js';
import pharmacyRoutes from './routes/pharmacy.js';
import emrRoutes from './routes/emr.js';
import hrRoutes from './routes/hr.js';
import inventoryRoutes from './routes/inventory.js';
import queueRoutes from './routes/queue.js';
import triageRoutes from './routes/triage.js';
import invoicesRoutes from './routes/invoices.js';
import icd10Routes from './routes/icd10.js';
import locationsRoutes from './routes/locations.js';
import admissionsRoutes from './routes/admissions.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173', 'http://127.0.0.1:8080', 'http://127.0.0.1:8081'],
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/beds', bedsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/laboratory', laboratoryRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/emr', emrRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/icd10', icd10Routes);
app.use('/api/locations', locationsRoutes);
app.use('/api/admissions', admissionsRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
