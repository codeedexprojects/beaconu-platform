import { escapeHtml } from "../email.utils";

const BRAND_COLOR = "#1d4ed8";

interface LayoutOptions {
  /** Hidden inbox preview text. */
  preheader: string;
  heading: string;
  /** Already-safe HTML; escape any interpolated user data with `escapeHtml`. */
  bodyHtml: string;
  cta?: { label: string; url: string };
  footerNote?: string;
}

/** Shared branded wrapper. Table layout + inline styles for email-client support. */
export function renderLayout(options: LayoutOptions): string {
  const { preheader, heading, bodyHtml, cta, footerNote } = options;
  const button = cta
    ? `<p style="margin:28px 0;"><a href="${escapeHtml(cta.url)}" style="background:${BRAND_COLOR};color:#ffffff;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:6px;display:inline-block;">${escapeHtml(cta.label)}</a></p>
       <p style="font-size:12px;color:#6b7280;margin:0 0 8px;">If the button doesn't work, copy this link into your browser:<br><a href="${escapeHtml(cta.url)}" style="color:${BRAND_COLOR};word-break:break-all;">${escapeHtml(cta.url)}</a></p>`
    : "";

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px;"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px;padding:32px;">
    <tr><td>
      <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:${BRAND_COLOR};">BeaconU</p>
      <h1 style="margin:0 0 16px;font-size:20px;color:#111827;">${escapeHtml(heading)}</h1>
      <div style="font-size:15px;line-height:1.6;color:#374151;">${bodyHtml}</div>
      ${button}
      ${footerNote ? `<p style="font-size:12px;color:#6b7280;margin:16px 0 0;">${escapeHtml(footerNote)}</p>` : ""}
    </td></tr>
  </table>
  <p style="font-size:11px;color:#9ca3af;margin:16px 0 0;">This is an automated message from BeaconU. Please do not reply.</p>
</td></tr></table>
</body></html>`;
}
