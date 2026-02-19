# Customization Guide

This guide explains how to tailor the platform to your specific business needs.

## 🎨 Themes and Branding

The platform supports 4 premium themes out of the box. You can switch them in the Admin Panel or customize them in the code.

### Modifying Colors
Global styles and theme variables are located in:
`src/styles/`
- `main.scss`: Entry point for styles.
- `themes/`: CSS variables for each theme (Light, Dark, Glass, Dark Glass).

## 🎮 3D Product Viewer

### Uploading Your Own Models
1. Convert your models to **.GLB** or **.GLTF** format (GLB is recommended for performance).
2. Go to **Admin Panel > Products > Add/Edit**.
3. Upload the 3D file.
4. The interactive viewer will automatically handle the rendering, lighting, and rotation.

### Viewer Configuration
The viewer logic is encapsulated in `ThreeDViewerComponent`. You can adjust lighting, rotation speed, and camera controls there.

## 🌐 Localization (i18n)

The project uses `@ngx-translate`.
- Translation files: `src/assets/i18n/`
- Add new languages by creating a new `.json` file (e.g., `de.json`) and registering it in `AppModule`.

## 💳 Payment Options

To change supported currencies or payment gateways:
1. Update `backend/.env` with your provider keys.
2. The frontend dynamic components in `PaymentComponent` will reflect the changes.
