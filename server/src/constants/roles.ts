export const USER_ROLES = ['admin','manager','director','rep'] as const;
export type UserRole = typeof USER_ROLES[number];
export const ADMIN_ROLES: UserRole[] = ['admin','manager'];





