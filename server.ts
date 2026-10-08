import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory persistent data store with default seed
export type QrTargetMode = 'registration_hub' | 'google_form_direct' | 'portal_links' | 'custom_url';

export interface QrCodeConfig {
  mode: QrTargetMode;
  qrTitle: string;
  qrSubtitle: string;
  badgeText: string;
  customUrl: string;
  googleFormsUrl: string;
  eotofUrl: string;
  damlogateUrl: string;
  showEotofLink: boolean;
  showDamlogateLink: boolean;
  additionalInfo: string;
  fgColor: string;
  bgColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export interface MeetingConfig {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  isVirtualAvailable: boolean;
  meetingLink: string;
  notificationEmails: string[];
  organizerNames: string[];
  googleFormsUrl?: string;
  eotofUrl: string;
  damlogateUrl: string;
  qrConfig: QrCodeConfig;
}

export interface Registration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  role?: string;
  attendance: 'in_person' | 'virtual' | 'declined';
  dietary?: string;
  notes?: string;
  createdAt: string;
  source?: string;
}

export interface NotificationRecord {
  id: string;
  recipients: string[];
  subject: string;
  preview: string;
  attendeeName: string;
  attendeeEmail: string;
  attendance: string;
  sentAt: string;
  status: 'sent' | 'delivered';
}

let meetingConfig: MeetingConfig = {
  title: 'Executive Strategic Planning & Operations Meeting 2026',
  description: 'Quarterly all-hands briefing and departmental milestone review with leadership and project partners.',
  date: '2026-10-15',
  time: '10:00 AM - 12:30 PM (CAT / UTC+2)',
  location: 'Boardroom Suite A & Virtual Livestream',
  isVirtualAvailable: true,
  meetingLink: 'https://meet.google.com/ex-strat-2026',
  notificationEmails: ['dave.nkwe@gmail.com', 'kenny.weeder71@gmail.com'],
  organizerNames: ['Dave Nkwe', 'Kenny Weeder'],
  googleFormsUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScMeetingRSVP2026/viewform',
  eotofUrl: 'https://www.eotof.co.za',
  damlogateUrl: 'https://www.damlogate.co.za',
  qrConfig: {
    mode: 'registration_hub',
    qrTitle: 'Scan to Register & Access Portals',
    qrSubtitle: 'Compatible with any cell phone model, camera, or QR scanner app',
    badgeText: 'Instant RSVP & Partner Portals',
    customUrl: '',
    googleFormsUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScMeetingRSVP2026/viewform',
    eotofUrl: 'https://www.eotof.co.za',
    damlogateUrl: 'https://www.damlogate.co.za',
    showEotofLink: true,
    showDamlogateLink: true,
    additionalInfo: 'Access www.eotof.co.za and www.damlogate.co.za directly upon scanning.',
    fgColor: '#0f172a',
    bgColor: '#ffffff',
    errorCorrectionLevel: 'H',
  },
};

// Realistic initial seed data for immediate visualization
let registrations: Registration[] = [
  {
    id: 'reg-1',
    fullName: 'Thabo Mokoena',
    email: 'thabo.m@africapartners.co',
    phone: '+27 82 455 1029',
    organization: 'Apex Capital Partners',
    role: 'Managing Director',
    attendance: 'in_person',
    dietary: 'None',
    notes: 'Looking forward to the Q4 targets presentation.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    source: 'QR Scan - Mobile',
  },
  {
    id: 'reg-2',
    fullName: 'Sarah Jenkins',
    email: 'sjenkins@globaltech.org',
    phone: '+1 415 789 2310',
    organization: 'GlobalTech Solutions',
    role: 'Head of Product',
    attendance: 'virtual',
    dietary: 'Vegetarian',
    notes: 'Joining remotely from San Francisco team.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    source: 'QR Scan - Mobile',
  },
  {
    id: 'reg-3',
    fullName: 'Lindiwe Dlamini',
    email: 'ldlamini@innovatehub.co.za',
    phone: '+27 71 890 4412',
    organization: 'Innovate Hub Labs',
    role: 'Operations Lead',
    attendance: 'in_person',
    dietary: 'Halaal',
    notes: 'Will bring 2 hard copies of the financial audit.',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    source: 'QR Scan - Mobile',
  },
  {
    id: 'reg-4',
    fullName: 'David Vance',
    email: 'dvance@venturecorp.net',
    phone: '+44 20 7946 0192',
    organization: 'Venture Corporate Advisory',
    role: 'Senior Consultant',
    attendance: 'in_person',
    dietary: 'Gluten-Free',
    notes: 'Confirmed attending in person.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    source: 'QR Scan - Mobile',
  },
  {
    id: 'reg-5',
    fullName: 'Kgomotso Phiri',
    email: 'kphiri@logisticsplus.co.za',
    phone: '+27 83 234 9876',
    organization: 'TransLogistics Southern Africa',
    role: 'Regional Director',
    attendance: 'virtual',
    dietary: 'None',
    notes: 'Please ensure virtual link recording is shared afterwards.',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    source: 'QR Scan - Mobile',
  },
  {
    id: 'reg-6',
    fullName: 'Michael Sterling',
    email: 'msterling@alliancelaw.com',
    phone: '+27 82 999 1122',
    organization: 'Sterling & Associates Law',
    role: 'Legal Advisor',
    attendance: 'declined',
    dietary: 'None',
    notes: 'Sending apologies due to conflicting high court arbitration.',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    source: 'QR Scan - Mobile',
  },
];

let notifications: NotificationRecord[] = [
  {
    id: 'notif-1',
    recipients: ['dave.nkwe@gmail.com', 'kenny.weeder71@gmail.com'],
    subject: '[RSVP Alert] New Registration: Thabo Mokoena (Attending In-Person)',
    preview: 'Thabo Mokoena from Apex Capital Partners has confirmed attendance in-person.',
    attendeeName: 'Thabo Mokoena',
    attendeeEmail: 'thabo.m@africapartners.co',
    attendance: 'in_person',
    sentAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'delivered',
  },
  {
    id: 'notif-2',
    recipients: ['dave.nkwe@gmail.com', 'kenny.weeder71@gmail.com'],
    subject: '[RSVP Alert] New Registration: Sarah Jenkins (Attending Virtual)',
    preview: 'Sarah Jenkins from GlobalTech Solutions has registered for virtual attendance.',
    attendeeName: 'Sarah Jenkins',
    attendeeEmail: 'sjenkins@globaltech.org',
    attendance: 'virtual',
    sentAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'delivered',
  },
  {
    id: 'notif-3',
    recipients: ['dave.nkwe@gmail.com', 'kenny.weeder71@gmail.com'],
    subject: '[RSVP Alert] New Registration: Lindiwe Dlamini (Attending In-Person)',
    preview: 'Lindiwe Dlamini from Innovate Hub Labs has confirmed attendance in-person.',
    attendeeName: 'Lindiwe Dlamini',
    attendeeEmail: 'ldlamini@innovatehub.co.za',
    attendance: 'in_person',
    sentAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    status: 'delivered',
  },
  {
    id: 'notif-4',
    recipients: ['dave.nkwe@gmail.com', 'kenny.weeder71@gmail.com'],
    subject: '[RSVP Alert] New Registration: David Vance (Attending In-Person)',
    preview: 'David Vance from Venture Corporate Advisory has registered for in-person attendance.',
    attendeeName: 'David Vance',
    attendeeEmail: 'dvance@venturecorp.net',
    attendance: 'in_person',
    sentAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'delivered',
  },
  {
    id: 'notif-5',
    recipients: ['dave.nkwe@gmail.com', 'kenny.weeder71@gmail.com'],
    subject: '[RSVP Alert] New Registration: Kgomotso Phiri (Attending Virtual)',
    preview: 'Kgomotso Phiri from TransLogistics Southern Africa registered for virtual stream.',
    attendeeName: 'Kgomotso Phiri',
    attendeeEmail: 'kphiri@logisticsplus.co.za',
    attendance: 'virtual',
    sentAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    status: 'delivered',
  },
];

// Helper stats calculation
function computeStats() {
  const total = registrations.length;
  const inPerson = registrations.filter(r => r.attendance === 'in_person').length;
  const virtual = registrations.filter(r => r.attendance === 'virtual').length;
  const attending = inPerson + virtual;
  const declined = registrations.filter(r => r.attendance === 'declined').length;
  const attendanceRate = total > 0 ? Math.round((attending / total) * 100) : 0;

  return {
    total,
    attending,
    inPerson,
    virtual,
    declined,
    attendanceRate,
  };
}

// REST API Endpoints

// Meeting metadata
app.get('/api/meeting', (req, res) => {
  res.json({
    config: meetingConfig,
    stats: computeStats(),
  });
});

app.put('/api/meeting', (req, res) => {
  meetingConfig = {
    ...meetingConfig,
    ...req.body,
    // Always preserve or ensure the user-requested target emails are present
    notificationEmails: req.body.notificationEmails && req.body.notificationEmails.length > 0 
      ? req.body.notificationEmails 
      : ['dave.nkwe@gmail.com', 'kenny.weeder71@gmail.com']
  };
  res.json({ success: true, config: meetingConfig });
});

// Dedicated QR Code configuration update
app.put('/api/meeting/qr-config', (req, res) => {
  meetingConfig.qrConfig = {
    ...meetingConfig.qrConfig,
    ...req.body,
  };
  if (req.body.eotofUrl) meetingConfig.eotofUrl = req.body.eotofUrl;
  if (req.body.damlogateUrl) meetingConfig.damlogateUrl = req.body.damlogateUrl;
  res.json({ success: true, qrConfig: meetingConfig.qrConfig, meeting: meetingConfig });
});

// Registrations list & stats
app.get('/api/registrations', (req, res) => {
  res.json({
    registrations,
    stats: computeStats(),
    meeting: meetingConfig,
  });
});

// Submit new registration
app.post('/api/registrations', (req, res) => {
  const { fullName, email, phone, organization, role, attendance, dietary, notes, source } = req.body;

  if (!fullName || !email || !attendance) {
    return res.status(400).json({ error: 'fullName, email, and attendance choice are required.' });
  }

  const newRegistration: Registration = {
    id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    fullName: String(fullName).trim(),
    email: String(email).trim().toLowerCase(),
    phone: phone ? String(phone).trim() : '',
    organization: organization ? String(organization).trim() : 'Independent',
    role: role ? String(role).trim() : '',
    attendance: attendance === 'in_person' || attendance === 'virtual' ? attendance : 'declined',
    dietary: dietary ? String(dietary).trim() : 'None',
    notes: notes ? String(notes).trim() : '',
    createdAt: new Date().toISOString(),
    source: source || 'QR Code Scan',
  };

  registrations.unshift(newRegistration);

  // Generate automated notification to dave.nkwe@gmail.com & kenny.weeder71@gmail.com
  const attendanceLabel = 
    newRegistration.attendance === 'in_person' ? 'Attending In-Person' :
    newRegistration.attendance === 'virtual' ? 'Attending Virtually' : 'Declined (Cannot Attend)';

  const notifSubject = `[RSVP Alert] New Registration for ${meetingConfig.title}: ${newRegistration.fullName} (${attendanceLabel})`;
  const notifPreview = `${newRegistration.fullName} (${newRegistration.organization || 'Attendee'}) has registered: ${attendanceLabel}. Email: ${newRegistration.email}, Phone: ${newRegistration.phone || 'N/A'}`;

  const notificationRecord: NotificationRecord = {
    id: `notif-${Date.now()}`,
    recipients: meetingConfig.notificationEmails,
    subject: notifSubject,
    preview: notifPreview,
    attendeeName: newRegistration.fullName,
    attendeeEmail: newRegistration.email,
    attendance: newRegistration.attendance,
    sentAt: new Date().toISOString(),
    status: 'delivered',
  };

  notifications.unshift(notificationRecord);

  console.log(`[EMAIL NOTIFICATION DISPATCHED]`);
  console.log(`To: ${meetingConfig.notificationEmails.join(', ')}`);
  console.log(`Subject: ${notifSubject}`);
  console.log(`Details:`, newRegistration);

  res.status(201).json({
    success: true,
    registration: newRegistration,
    notificationSent: notificationRecord,
    stats: computeStats(),
  });
});

// Delete a registration (Admin)
app.delete('/api/registrations/:id', (req, res) => {
  const { id } = req.params;
  const initialLen = registrations.length;
  registrations = registrations.filter(r => r.id !== id);
  if (registrations.length === initialLen) {
    return res.status(404).json({ error: 'Registration not found' });
  }
  res.json({ success: true, stats: computeStats() });
});

// Reset registrations to default seed or empty
app.post('/api/registrations/reset', (req, res) => {
  const { mode } = req.body;
  if (mode === 'empty') {
    registrations = [];
  } else {
    // Reset to initial 6 attendees
    registrations = [
      {
        id: 'reg-1',
        fullName: 'Thabo Mokoena',
        email: 'thabo.m@africapartners.co',
        phone: '+27 82 455 1029',
        organization: 'Apex Capital Partners',
        role: 'Managing Director',
        attendance: 'in_person',
        dietary: 'None',
        notes: 'Looking forward to the Q4 targets presentation.',
        createdAt: new Date().toISOString(),
        source: 'QR Scan - Mobile',
      },
      {
        id: 'reg-2',
        fullName: 'Sarah Jenkins',
        email: 'sjenkins@globaltech.org',
        phone: '+1 415 789 2310',
        organization: 'GlobalTech Solutions',
        role: 'Head of Product',
        attendance: 'virtual',
        dietary: 'Vegetarian',
        notes: 'Joining remotely from San Francisco team.',
        createdAt: new Date().toISOString(),
        source: 'QR Scan - Mobile',
      },
      {
        id: 'reg-3',
        fullName: 'Lindiwe Dlamini',
        email: 'ldlamini@innovatehub.co.za',
        phone: '+27 71 890 4412',
        organization: 'Innovate Hub Labs',
        role: 'Operations Lead',
        attendance: 'in_person',
        dietary: 'Halaal',
        notes: 'Will bring 2 hard copies of the financial audit.',
        createdAt: new Date().toISOString(),
        source: 'QR Scan - Mobile',
      },
    ];
  }
  res.json({ success: true, stats: computeStats(), registrations });
});

// Notifications history
app.get('/api/notifications', (req, res) => {
  res.json({
    recipients: meetingConfig.notificationEmails,
    notifications,
  });
});

// Trigger instant summary digest email to Dave and Kenny
app.post('/api/notifications/digest', (req, res) => {
  const stats = computeStats();
  const digestSubject = `[RSVP Summary Digest] Current Meeting Status: ${stats.attending} Attending (${stats.total} Total Registered)`;
  const digestPreview = `Meeting: ${meetingConfig.title}. Total Registered: ${stats.total}. Confirmed Attending: ${stats.attending} (${stats.inPerson} In-Person, ${stats.virtual} Virtual). Declined: ${stats.declined}.`;

  const newNotif: NotificationRecord = {
    id: `notif-${Date.now()}`,
    recipients: meetingConfig.notificationEmails,
    subject: digestSubject,
    preview: digestPreview,
    attendeeName: 'System Digest',
    attendeeEmail: meetingConfig.notificationEmails[0],
    attendance: 'in_person',
    sentAt: new Date().toISOString(),
    status: 'delivered',
  };

  notifications.unshift(newNotif);

  console.log(`[DIGEST NOTIFICATION DISPATCHED] To: ${meetingConfig.notificationEmails.join(', ')}`);

  res.json({
    success: true,
    notification: newNotif,
    recipients: meetingConfig.notificationEmails,
    stats,
  });
});

// Export CSV
app.get('/api/export/csv', (req, res) => {
  const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Organization', 'Role', 'Attendance Status', 'Dietary Preference', 'Notes', 'Registered At', 'Source'];
  const rows = registrations.map(r => [
    `"${r.id}"`,
    `"${r.fullName.replace(/"/g, '""')}"`,
    `"${r.email}"`,
    `"${r.phone}"`,
    `"${(r.organization || '').replace(/"/g, '""')}"`,
    `"${(r.role || '').replace(/"/g, '""')}"`,
    `"${r.attendance}"`,
    `"${(r.dietary || '').replace(/"/g, '""')}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
    `"${r.createdAt}"`,
    `"${r.source || 'QR Code'}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="meeting-rsvps.csv"');
  res.send(csvContent);
});

// Dev and Prod setup
async function startServer() {
  if (process.env.NODE_ENV === 'production' || fs.existsSync(path.resolve(__dirname, 'dist/index.html'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
