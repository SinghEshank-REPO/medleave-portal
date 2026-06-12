import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth.routes';
import leaveRoutes from './routes/leave.routes';
import condonationRoutes from './routes/condonation.routes';
import adminRoutes from './routes/admin.routes';
import { authenticateJWT, AuthenticatedRequest } from './middleware/auth.middleware';
import { prisma } from './config/db';

const app = express();

app.use(cors({
  origin: '*', // For local development simplicity
  credentials: true
}));

app.use(express.json());

// Ensure uploads folder exists and serve it statically for local mocks
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Route bindings
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/condonation', condonationRoutes);
app.use('/api/admin', adminRoutes);

// General utility routes
app.get('/api/departments', async (req, res) => {
  try {
    const depts = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(depts);
  } catch (error) {
    console.error('Fetch departments error:', error);
    res.status(500).json({ message: 'Failed to retrieve departments.' });
  }
});

app.get('/api/notifications', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized.' });
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(notifications);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
});

app.post('/api/notifications/:id/read', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized.' });
    const { id } = req.params;
    await prisma.notification.update({
      where: { id, userId: req.user.id },
      data: { isRead: true }
    });
    res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ message: 'Failed to mark notification.' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

export default app;
