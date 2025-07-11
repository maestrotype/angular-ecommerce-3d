export interface Section {
  id: number;
  type: string; // 'hero', 'about', 'promo', ...
  title: string;
  content?: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  settings?: any;
  model3dUrl?: string;
  show3d?: boolean;
}
