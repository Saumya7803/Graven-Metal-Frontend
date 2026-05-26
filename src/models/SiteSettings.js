import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'GRAVEN METAL' },
    supportEmail: { type: String, default: 'info@gravenmetal.com' },
    logoUrl: { type: String, default: '' },
    footerText: {
      type: String,
      default:
        'Graven Metals delivers premium industrial metals with trusted sourcing, superior quality, and innovative solutions powering industries worldwide.',
    },
    contactDetails: {
      phone: { type: String, default: '+91 79053 50134' },
      email: { type: String, default: 'trade@gravenmetal.com' },
      whatsapp: { type: String, default: '+91 79053 50134' },
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    officeAddresses: [
      {
        label: { type: String, default: '' },
        address: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
      },
    ],
    paymentMethods: [
      {
        name: { type: String, default: '' },
        enabled: { type: Boolean, default: true },
      },
    ],
    maintenanceMode: { type: Boolean, default: false },
    seo: {
      metaTitle: { type: String, default: 'GRAVEN METAL' },
      metaDescription: { type: String, default: 'Premium dark luxury metal trading platform.' },
      keywords: [{ type: String }],
      ogImage: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
