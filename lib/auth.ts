import { prisma } from '@/lib/prisma';
import { User } from '@/lib/types';

const DEMO_USER_ID = 'demo-user';

export async function getCurrentUser(): Promise<User> {
  // For now, return demo user
  // TODO: Implement proper authentication
  const user = await prisma.user.findUnique({
    where: { id: DEMO_USER_ID },
  });

  if (!user) {
    throw new Error('Demo user not found. Please run database seed.');
  }

  return user;
}

export async function getCurrentUserId(): Promise<string> {
  // For now, return demo user ID
  // TODO: Implement proper authentication
  return DEMO_USER_ID;
}

export async function requireAuth(): Promise<User> {
  try {
    return await getCurrentUser();
  } catch {
    throw new Error('Authentication required');
  }
}