export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  buttons: {
    primary: string;
    secondary: string;
    glass: string;
    glassHover: string;
  };
  cards: {
    background: string;
    border: string;
    shadow: string;
  };
}

export interface ThemeLayout {
  container: {
    maxWidth: string;
    padding: string;
  };
  grid: {
    columns: {
      desktop: number;
      tablet: number;
      mobile: number;
    };
    gap: string;
  };
  cards: {
    borderRadius: string;
    shadow: string;
    padding: string;
  };
}

export interface ThemeComponents {
  buttons: {
    borderRadius: string;
    fontSize: string;
    fontWeight: string;
    padding: string;
    glassOpacity: string;
  };
  productCards: {
    imageHeight: string;
    infoPadding: string;
    overlayOpacity: string;
  };
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  layout: ThemeLayout;
  components: ThemeComponents;
} 