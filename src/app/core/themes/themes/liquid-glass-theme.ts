import { Theme } from '../theme.model';

export const liquidGlassTheme: Theme = {
  id: 'liquid-glass',
  name: 'Liquid Glass',
  description: 'Modern glassmorphism design with subtle transparency effects',
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#ff6b6b',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    surface: 'rgba(255, 255, 255, 0.7)',
    text: {
      primary: '#333',
      secondary: '#666',
      accent: '#667eea'
    },
    buttons: {
      primary: '#667eea',
      secondary: '#6c757d',
      glass: 'rgba(255, 255, 255, 0.7)',
      glassHover: 'rgba(255, 255, 255, 0.9)'
    },
    cards: {
      background: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(102, 126, 234, 0.1)',
      shadow: '0 8px 32px rgba(31, 38, 135, 0.08)'
    }
  },
  layout: {
    container: {
      maxWidth: '1200px',
      padding: '0 2rem'
    },
    grid: {
      columns: {
        desktop: 4,
        tablet: 3,
        mobile: 1
      },
      gap: '2rem'
    },
    cards: {
      borderRadius: '18px',
      shadow: '0 8px 32px rgba(31, 38, 135, 0.08)',
      padding: '1.5rem'
    }
  },
  components: {
    buttons: {
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      padding: '0.75rem 1.5rem',
      glassOpacity: '0.7'
    },
    productCards: {
      imageHeight: '250px',
      infoPadding: '1.5rem',
      overlayOpacity: '0.1'
    }
  }
}; 