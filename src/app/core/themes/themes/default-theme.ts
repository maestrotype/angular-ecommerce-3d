import { Theme } from '../theme.model';

export const defaultTheme: Theme = {
  id: 'default',
  name: 'Default',
  description: 'Clean white design with simple colors',
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    accent: '#28a745',
    background: '#ffffff',
    surface: '#ffffff',
    text: {
      primary: '#333333',
      secondary: '#666666',
      accent: '#007bff'
    },
    buttons: {
      primary: '#007bff',
      secondary: '#6c757d',
      glass: '#f8f9fa',
      glassHover: '#e9ecef'
    },
    cards: {
      background: '#ffffff',
      border: '#dee2e6',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
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
      borderRadius: '12px',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem'
    }
  },
  components: {
    buttons: {
      borderRadius: '6px',
      fontSize: '1rem',
      fontWeight: '500',
      padding: '0.75rem 1.5rem',
      glassOpacity: '1'
    },
    productCards: {
      imageHeight: '250px',
      infoPadding: '1.5rem',
      overlayOpacity: '0.1'
    }
  }
}; 