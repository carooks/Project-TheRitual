# Assets Directory

This folder contains all visual assets for The Ritual game.

## 📁 Folder Structure

```
assets/
├── backgrounds/       # Background images for different game phases
│   ├── lobby.png/jpg
│   ├── choosing.png/jpg
│   ├── offering.png/jpg
│   ├── reveal.png/jpg
│   ├── outcome-success.png/jpg
│   ├── outcome-failure.png/jpg
│   └── council.png/jpg
│
├── ingredients/       # Individual ingredient card illustrations
│   ├── eye_of_newt.png
│   ├── mandrake_root.png
│   ├── tears_of_the_moon.png
│   ├── raven_feather.png
│   ├── bone_dust.png
│   ├── candle_wax.png
│   ├── blood_of_the_innocent.png
│   ├── silver_thread.png
│   ├── shadow_ash.png
│   └── iron_thorn.png
│
└── roles/            # Role/witch icons
    ├── protection.png
    ├── oracle.png
    ├── chronicler.png
    ├── hex.png
    ├── harbinger.png
    └── mimic.png
```

## 🎨 Asset Specifications

### Ingredients (10 images)
- **Format**: PNG with transparency
- **Dimensions**: 512×512px (square) or 512×768px (portrait)
- **Style**: Mystical, dark fantasy
- **Colors**: Match corruption type (green/healing for negative, red/dark for positive corruption)

### Roles (6 images)
- **Format**: PNG with transparency
- **Dimensions**: 256×256px
- **Style**: Icon/symbol-based, clean silhouettes
- **Colors**: Monochrome or limited palette for flexibility

### Backgrounds (7 images)
- **Format**: JPG or PNG
- **Dimensions**: 1920×1080px (can scale down)
- **Style**: Atmospheric, dark, candlelit
- **Usage**: Full-screen or large section backgrounds

## 🔄 How to Add Assets

1. **Place files** in the appropriate folder with exact filenames listed above
2. **Update component** imports to use `/assets/...` paths
3. **Test** that images load correctly in dev mode

### Example Usage

```tsx
// In IngredientCard.tsx
<img 
  src={`/assets/ingredients/${ingredient.id}.png`} 
  alt={ingredient.name}
  className="ingredient-card__image"
/>

// In role display
<img 
  src={`/assets/roles/${roleId}.png`}
  alt={roleName}
/>

// Background usage
<div style={{ backgroundImage: 'url(/assets/backgrounds/lobby.jpg)' }}>
```

## ✨ Current Status

**Placeholders Active**: CSS-based gradients and emoji icons
**When you add real assets**: Components will automatically use them if named correctly

## 🎯 Priority Order

1. **Title/Logo** - Create a custom game logo
2. **Ingredient Cards** - Replace emojis with illustrations
3. **Corruption Meter** - Custom texture/fill graphic
4. **Backgrounds** - Phase-specific atmospheric images
5. **Role Icons** - Witch/role symbols
6. **Particles/Effects** - Magic effects and transitions
