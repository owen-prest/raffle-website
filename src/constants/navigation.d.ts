// src/constants/navigation.d.ts
declare module '@/constants/navigation' {
  export interface NavItem {
    label: string;
    icon: string;
    path: string;
    badge?: number;
  }
  export const navLinks: NavItem[];
}
