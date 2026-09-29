import { detectPlatform } from '@tanstack/react-hotkeys';

export const MOD_AS_THE_APP_READS_IT = detectPlatform() === 'mac' ? 'Meta' : 'Control';
