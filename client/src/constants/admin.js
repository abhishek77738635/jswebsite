/** Only this user can access /admin and the Admin button in the header. */
export const ADMIN_EMAIL = 'abhishek.samari1211@gmail.com';

export function isAdminUser(user) {
  if (!user?.email) return false;
  return user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
