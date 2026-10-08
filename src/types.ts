export type AttendanceStatus = 'in_person' | 'virtual' | 'declined';

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
  attendance: AttendanceStatus;
  dietary?: string;
  notes?: string;
  createdAt: string;
  source?: string;
}

export interface RegistrationStats {
  total: number;
  attending: number;
  inPerson: number;
  virtual: number;
  declined: number;
  attendanceRate: number;
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
