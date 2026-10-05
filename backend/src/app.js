const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

const env = require('./config/env');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const { checkInfrastructure } = require('./infra');

const portfolioRoutes = require('./modules/portfolio/portfolio.routes');
const coursesRoutes = require('./modules/courses/courses.routes');
const blogRoutes = require('./modules/blog/blog.routes');
const servicesRoutes = require('./modules/services/services.routes');
const contactRoutes = require('./modules/contact/contact.routes');
const teamRoutes = require('./modules/team/team.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const adminAuthRoutes = require('./modules/admin/auth.routes');
const authRoutes = require('./modules/auth/auth.routes');
const learningRoutes = require('./modules/learning/learning.routes');
const lessonRoutes = require('./modules/learning/lessons.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const subscriptionsRoutes = require('./modules/subscriptions/subscriptions.routes');
const employeeRoutes = require('./modules/employee/employee.routes');
const siteSettingsRoutes = require('./modules/siteSettings/siteSettings.routes');
const mediaRoutes = require('./modules/media/media.routes');
const crmRoutes = require('./modules/crm/crm.routes');
const ticketRoutes = require('./modules/tickets/tickets.routes');
const userTicketRoutes = require('./modules/tickets/user.routes');
const contractRoutes = require('./modules/crm/contracts.routes');
const notificationUserRoutes = require('./modules/notifications/user.routes');
const uploadsRoutes = require('./modules/uploads/uploads.routes');
const adminUploadsRoutes = require('./modules/uploads/admin.routes');

const app = express();

app.set('trust proxy', env.trustProxy);
app.use((req,res,next)=>{const id=crypto.randomUUID();req.id=id;res.setHeader('X-Request-Id',id);next()});
app.use(cors({ origin: env.corsOrigin, credentials: true, methods: ['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization','X-Request-Id'] }));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(express.json({ limit: env.jsonLimit }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(rateLimit({ windowMs: 60 * 1000, limit: env.rateLimit, standardHeaders: 'draft-7', legacyHeaders: false, skip: req => req.path === '/api/health' }));
const authLimiter=rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:'draft-7',legacyHeaders:false,message:{success:false,message:'تعداد تلاش‌های ورود زیاد است؛ کمی بعد دوباره تلاش کنید.'}});
app.use('/api/auth/login',authLimiter);
app.use('/api/auth/register',authLimiter);
app.use('/api/admin/auth/login',authLimiter);
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/api/content-integrity', async (req,res,next) => {
  try {
    const {getPool}=require('./infra/database'); const p=getPool();
    const types=['courses','portfolio','services','team','blog'];
    const counts={}; for(const type of types){const r=await p.query('SELECT COUNT(*)::int AS count FROM content_items WHERE content_type=$1',[type]);counts[type]=r.rows[0].count;}
    const users=await p.query('SELECT COUNT(*)::int AS count FROM users');
    const roles=await p.query('SELECT COUNT(*)::int AS count FROM roles');
    const plans=await p.query('SELECT COUNT(*)::int AS count FROM plans WHERE active=TRUE');
    const lessons=await p.query('SELECT COUNT(*)::int AS count FROM lessons');
    const enrollments=await p.query('SELECT COUNT(*)::int AS count FROM enrollments');
    const notifications=await p.query('SELECT COUNT(*)::int AS count FROM notification_jobs');
    const loyalty=await p.query('SELECT COUNT(*)::int AS count FROM loyalty_accounts');
    res.json({success:true,source:'postgresql',data:{...counts,users:users.rows[0].count,roles:roles.rows[0].count,plans:plans.rows[0].count,lessons:lessons.rows[0].count,enrollments:enrollments.rows[0].count,notifications:notifications.rows[0].count,loyalty:loyalty.rows[0].count}});
  } catch(e){next(e)}
});

app.get('/api/ready', async (req, res) => {
  try { const infrastructure=await checkInfrastructure(); const ready=infrastructure.database&&infrastructure.cache&&infrastructure.storage; res.status(ready?200:503).json({success:ready,status:ready?'ready':'not_ready',requestId:req.id}); } catch(e){res.status(503).json({success:false,status:'not_ready',requestId:req.id})}
});

app.get('/api/health', async (req, res) => {
  try {
    const infrastructure = await checkInfrastructure();
    const healthy = infrastructure.database && infrastructure.cache && infrastructure.storage;
    res.status(healthy ? 200 : 503).json({
      success: healthy,
      service: 'codesazan-backend',
      status: healthy ? 'up' : 'degraded',
      infrastructure,
    });
  } catch (error) {
    res.status(503).json({ success: false, service: 'codesazan-backend', status: 'degraded', requestId: req.id });
  }
});

// Each business domain is a self-contained module: routes -> controller -> service -> data
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/learning', lessonRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/media', mediaRoutes);
app.use('/uploads', uploadsRoutes);
app.use('/api/admin/uploads', adminUploadsRoutes);
app.use('/api/admin/crm', crmRoutes);
app.use('/api/tickets', userTicketRoutes);
app.use('/api/notifications', notificationUserRoutes);
app.use('/api/admin/tickets', ticketRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
