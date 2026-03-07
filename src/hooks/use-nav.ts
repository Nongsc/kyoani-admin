'use client';

import { useMemo } from 'react';
import type { NavItem } from '@/types';

/**
 * Hook to filter navigation items
 * Simplified version without Clerk RBAC
 */
export function useFilteredNavItems(items: NavItem[]) {
  // Return all items since we don't have RBAC
  return useMemo(() => items, [items]);
}
