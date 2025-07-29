import { Theme } from '../theme.model';

export const modernTheme: Theme = {
  id: 'modern',
  name: 'Modern',
  description: 'Modern design with red accents and Rozetka-style layout',
  colors: {
    primary: '#dc2626',
    secondary: '#ef4444',
    accent: '#f97316',
    background: '#f8fafc',
    surface: '#ffffff',
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#dc2626'
    },
    buttons: {
      primary: '#dc2626',
      secondary: '#6b7280',
      glass: 'rgba(220, 38, 38, 0.1)',
      glassHover: 'rgba(220, 38, 38, 0.2)'
    },
    cards: {
      background: '#ffffff',
      border: '#e5e7eb',
      shadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    }
  },
  layout: {
    container: {
      maxWidth: '1200px',
      padding: '0 2rem'
    },
    grid: {
      columns: {
        desktop: 3,
        tablet: 2,
        mobile: 2
      },
      gap: '1.5rem'
    },
    cards: {
      borderRadius: '8px',
      shadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      padding: '1rem'
    }
  },
  components: {
    buttons: {
      borderRadius: '8px',
      fontSize: '0.9rem',
      fontWeight: '600',
      padding: '0.75rem 1.25rem',
      glassOpacity: '0.1'
    },
    productCards: {
      imageHeight: '200px',
      infoPadding: '1rem',
      overlayOpacity: '0.05'
    }
  }
}; 