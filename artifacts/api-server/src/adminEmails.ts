export const APPROVED_ADMIN_EMAILS = [
  "kngdavidmi@gmail.com",
  "blessingta2020@gmail.com",
];

export function isApprovedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return APPROVED_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
