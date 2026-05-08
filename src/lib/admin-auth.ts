import { cookies } from 'next/headers';

export function isAdminVerified(): boolean {
  const cookieStore = cookies();
  const adminCookie = cookieStore.get('admin_verified');
  return adminCookie?.value === 'true';
}

export async function clearAdminVerification() {
  const cookieStore = cookies();
  cookieStore.delete('admin_verified');
}
