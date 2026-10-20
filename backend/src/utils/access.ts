import prisma from '../config/prisma';

/**
 * A matchmaker may access customers assigned to them, plus unassigned customers
 * (consistent with the dashboard list, which shows both).
 */
export async function canAccessCustomer(customerId: string, matchmakerId?: string): Promise<boolean> {
  if (!matchmakerId) return false;
  const c = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { matchmakerId: true },
  });
  return !!c && (c.matchmakerId === matchmakerId || c.matchmakerId === null);
}
