import nodemailer from 'nodemailer';

let transporter;

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_FROM || !process.env.LEAD_NOTIFICATION_EMAIL) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
  return transporter;
}

export async function notifyAdminOfNewLead(lead) {
  const mailer = getTransporter();
  if (!mailer) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('Lead notification email skipped: SMTP configuration is incomplete.');
    }
    return { skipped: true };
  }

  const contactDetails = `${lead.phone}${lead.whatsappNumber ? ` | WhatsApp: ${lead.whatsappNumber}` : ''} | ${lead.email}`;
  const lines = [
    `Lead ID: ${lead.leadId}`,
    `Customer Name: ${lead.fullName}`,
    `Company Name: ${lead.companyName}`,
    `Product: ${lead.product}`,
    `Quantity: ${lead.quantity} ${lead.unit}`,
    `Contact Details: ${contactDetails}`,
    `Timeline: ${lead.purchaseTimeline}`,
    `Priority: ${lead.priority} (${lead.priorityScore})`,
  ];

  await mailer.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.LEAD_NOTIFICATION_EMAIL,
    subject: 'New Website Inquiry Received',
    text: lines.join('\n'),
    html: `<h2>New Website Inquiry Received</h2><ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>`,
  });

  return { skipped: false };
}
