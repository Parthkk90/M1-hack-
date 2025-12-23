// Shared theme and colors based on Riga Wallet design
export const Colors = {
  // Primary
  primary: '#6366F1',      // Purple/Blue
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  
  // Accent
  green: '#10B981',        // Success/Long
  red: '#EF4444',          // Error/Short
  orange: '#F59E0B',       // Warning/Medium Risk
  yellow: '#FCD34D',       // Low Risk
  
  // Neutrals
  background: '#FFFFFF',
  surface: '#F9FAFB',
  card: '#FFFFFF',
  border: '#E5E7EB',
  
  // Text
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  
  // Status
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.textLight,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
};
