import { PermissionStatus } from '../types';

const STORAGE_KEY_PERMISSIONS = 'sonic_permissions_v1';

export const DEFAULT_PERMISSIONS: PermissionStatus[] = [
  {
    id: 'mic',
    title: 'Microphone (Awaaz Sunna)',
    description: 'Sonic ko aapki awaaz sunne aur voice biometric recognition ke liye mic darkaar hai.',
    icon: 'mic',
    granted: true,
    required: true,
    actionName: 'Awaaz Record Karna',
  },
  {
    id: 'location',
    title: 'GPS Location (Mausam o Auqat)',
    description: 'Aapke shehar ka sahi mausam aur time batane ke liye location permission chahiye.',
    icon: 'map-pin',
    granted: true,
    required: false,
    actionName: 'Shehar Ka Mausam Check Karna',
  },
  {
    id: 'calls',
    title: 'Phone Calls (Call Dial Karna)',
    description: 'Jab aap kahain "Sonic call Mom", tab dialer initiate karne ke liye.',
    icon: 'phone',
    granted: false,
    required: false,
    actionName: 'Phone Call Milana',
  },
  {
    id: 'sms',
    title: 'SMS Messages (Paighaam Bhejna)',
    description: 'Aapke hukum par dost ya family ko SMS message send karne ke liye.',
    icon: 'message-square',
    granted: false,
    required: false,
    actionName: 'SMS Bhejna',
  },
  {
    id: 'contacts',
    title: 'Contacts Book (Rabtay)',
    description: 'Naam se number talash karne ke liye (maslan "Call Ammi").',
    icon: 'users',
    granted: false,
    required: false,
    actionName: 'Contacts Check Karna',
  },
  {
    id: 'calendar',
    title: 'Calendar & Reminders (Yaaddehani)',
    description: 'Meetings aur zaroori taareekhon ko schedule aur check karne ke liye.',
    icon: 'calendar',
    granted: false,
    required: false,
    actionName: 'Calendar Check Karna',
  },
  {
    id: 'notifications',
    title: 'Push Notifications (Alerts)',
    description: 'Namaz ke auqat, reminders, aur alarms notify karne ke liye.',
    icon: 'bell',
    granted: true,
    required: false,
    actionName: 'Alert Bhejna',
  },
  {
    id: 'storage',
    title: 'Secure Local Storage (Yaaddasht)',
    description: 'Room DB mein encrypted yaaddasht aur voice print mehfooz rakhne ke liye.',
    icon: 'database',
    granted: true,
    required: true,
    actionName: 'Local Memory Store Karna',
  },
];

export class PermissionManager {
  static getPermissions(): PermissionStatus[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PERMISSIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to get permissions:', e);
    }
    return DEFAULT_PERMISSIONS;
  }

  static togglePermission(id: string): PermissionStatus[] {
    const permissions = this.getPermissions().map((p) => {
      if (p.id === id) {
        return { ...p, granted: !p.granted };
      }
      return p;
    });
    try {
      localStorage.setItem(STORAGE_KEY_PERMISSIONS, JSON.stringify(permissions));
    } catch (e) {
      console.warn('Failed to save permissions:', e);
    }
    return permissions;
  }

  static setPermission(id: string, granted: boolean): PermissionStatus[] {
    const permissions = this.getPermissions().map((p) => {
      if (p.id === id) {
        return { ...p, granted };
      }
      return p;
    });
    try {
      localStorage.setItem(STORAGE_KEY_PERMISSIONS, JSON.stringify(permissions));
    } catch (e) {
      console.warn('Failed to save permissions:', e);
    }
    return permissions;
  }

  static checkPermission(id: string): boolean {
    const perm = this.getPermissions().find((p) => p.id === id);
    return perm ? perm.granted : false;
  }
}
