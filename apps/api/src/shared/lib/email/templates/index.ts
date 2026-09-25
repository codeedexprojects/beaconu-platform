import { escapeHtml } from "../email.utils";
import { renderLayout } from "./layout";

export interface CollegeSetupInviteData {
  contactName: string;
  collegeName: string;
  setupUrl: string;
  expiresInHours: number;
}

export interface StaffInviteData {
  fullName: string;
  collegeName: string;
  loginUrl: string;
  /** Link that lets the invitee choose their own password. */
  setPasswordUrl: string;
  expiresInHours: number;
}

export interface StaffPasswordResetData {
  fullName: string;
  collegeName: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export interface EmailTemplateData {
  "college-setup-invite": CollegeSetupInviteData;
  "staff-invite": StaffInviteData;
  "staff-password-reset": StaffPasswordResetData;
}

export type EmailTemplateName = keyof EmailTemplateData;

interface TemplateDefinition<T> {
  subject: (data: T) => string;
  html: (data: T) => string;
}

export const EMAIL_TEMPLATES: {
  [K in EmailTemplateName]: TemplateDefinition<EmailTemplateData[K]>;
} = {
  "college-setup-invite": {
    subject: (d) => `Set up ${d.collegeName} on BeaconU`,
    html: (d) =>
      renderLayout({
        preheader: `Your college has been approved. Activate your admin account.`,
        heading: "Your college has been approved",
        bodyHtml: `<p>Hi ${escapeHtml(d.contactName)},</p>
          <p><strong>${escapeHtml(d.collegeName)}</strong> has been approved on BeaconU. Use the button below to create your password and start setting up your college profile.</p>
          <p>This link expires in ${d.expiresInHours} hours.</p>`,
        cta: { label: "Set up your account", url: d.setupUrl },
        footerNote:
          "If you weren't expecting this email, you can safely ignore it.",
      }),
  },
  "staff-invite": {
    subject: (d) => `You've been invited to ${d.collegeName} on BeaconU`,
    html: (d) =>
      renderLayout({
        preheader: `Choose your password to access the ${d.collegeName} admin portal.`,
        heading: `Welcome to ${d.collegeName}`,
        bodyHtml: `<p>Hi ${escapeHtml(d.fullName)},</p>
          <p>You've been added as a staff member of <strong>${escapeHtml(d.collegeName)}</strong> on BeaconU. Choose your password to activate your access.</p>
          <p>This link expires in ${d.expiresInHours} hours. After that, you can sign in at <a href="${escapeHtml(d.loginUrl)}">${escapeHtml(d.loginUrl)}</a> and use "Forgot password" to get a new link.</p>`,
        cta: { label: "Choose your password", url: d.setPasswordUrl },
        footerNote:
          "If you weren't expecting this invitation, you can safely ignore this email.",
      }),
  },
  "staff-password-reset": {
    subject: () => "Reset your BeaconU password",
    html: (d) =>
      renderLayout({
        preheader: "Use this link to choose a new password.",
        heading: "Reset your password",
        bodyHtml: `<p>Hi ${escapeHtml(d.fullName)},</p>
          <p>We received a request to reset your password for <strong>${escapeHtml(d.collegeName)}</strong>. This link expires in ${d.expiresInMinutes} minutes and can be used once.</p>`,
        cta: { label: "Reset password", url: d.resetUrl },
        footerNote:
          "If you didn't request this, you can ignore this email — your password won't change.",
      }),
  },
};
