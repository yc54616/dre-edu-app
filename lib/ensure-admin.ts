import { auth } from '@/lib/auth';

export const ensureAdmin = async () => {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== 'admin') return null;
  return session;
};
