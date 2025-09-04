# 🌸 Iris Brand Colors Guide - Iris

## 🎨 **Brand Color System Overview**

Iris now features a beautiful iris-inspired color palette that reflects the natural elegance and vibrancy of the iris flower. The color system is designed to be both visually appealing and highly functional across all components.

## 🌈 **Iris Brand Color Palette**

### **Primary Colors**

| Color | HSL Value | Usage | Description |
|-------|-----------|-------|-------------|
| **Iris Primary** | `270 85% 65%` | Main brand color, buttons, highlights | Deep Purple - The signature brand color |
| **Iris Secondary** | `240 100% 85%` | Accents, secondary elements | Light Blue - Complementary accent color |
| **Iris Accent** | `300 75% 70%` | Call-to-actions, special highlights | Magenta - Vibrant accent for emphasis |
| **Iris Light** | `270 50% 95%` | Backgrounds, subtle elements | Very Light Purple - Soft backgrounds |
| **Iris Dark** | `270 90% 25%` | Text, contrast elements | Dark Purple - High contrast text |

### **Color Relationships**

- **Primary + Secondary**: Creates beautiful gradients and depth
- **Primary + Accent**: High contrast for important elements
- **Light + Dark**: Perfect for text hierarchy and readability
- **All Colors**: Work harmoniously together for cohesive design

## 🎯 **Usage Guidelines**

### **CSS Custom Properties**

All iris colors are available as CSS custom properties:

```css
:root {
  --iris-primary: 270 85% 65%;        /* Deep Purple */
  --iris-secondary: 240 100% 85%;     /* Light Blue */
  --iris-accent: 300 75% 70%;         /* Magenta */
  --iris-light: 270 50% 95%;          /* Very Light Purple */
  --iris-dark: 270 90% 25%;           /* Dark Purple */
}
```

### **Tailwind CSS Classes**

Use these Tailwind classes for consistent styling:

```tsx
// Text Colors
<span className="text-iris-primary">Primary Text</span>
<span className="text-iris-secondary">Secondary Text</span>
<span className="text-iris-accent">Accent Text</span>
<span className="text-iris-light">Light Text</span>
<span className="text-iris-dark">Dark Text</span>

// Background Colors
<div className="bg-iris-primary">Primary Background</div>
<div className="bg-iris-secondary">Secondary Background</div>
<div className="bg-iris-accent">Accent Background</div>
<div className="bg-iris-light">Light Background</div>
<div className="bg-iris-dark">Dark Background</div>

// Border Colors
<div className="border-iris-primary">Primary Border</div>
<div className="border-iris-secondary">Secondary Border</div>
<div className="border-iris-accent">Accent Border</div>
```

### **Custom CSS Utility Classes**

Additional utility classes are available:

```css
.iris-primary { color: hsl(var(--iris-primary)); }
.iris-secondary { color: hsl(var(--iris-secondary)); }
.iris-accent { color: hsl(var(--iris-accent)); }
.iris-light { color: hsl(var(--iris-light)); }
.iris-dark { color: hsl(var(--iris-dark)); }

.bg-iris-primary { background-color: hsl(var(--iris-primary)); }
.bg-iris-secondary { background-color: hsl(var(--iris-secondary)); }
.bg-iris-accent { background-color: hsl(var(--iris-accent)); }
.bg-iris-light { background-color: hsl(var(--iris-light)); }
.bg-iris-dark { background-color: hsl(var(--iris-dark)); }

.border-iris-primary { border-color: hsl(var(--iris-primary)); }
.border-iris-secondary { border-color: hsl(var(--iris-secondary)); }
.border-iris-accent { border-color: hsl(var(--iris-accent)); }
```

## 🎨 **Component-Specific Usage**

### **Buttons & CTAs**

```tsx
// Primary Button
<Button className="bg-iris-primary hover:bg-iris-primary/80 text-white">
  Primary Action
</Button>

// Secondary Button
<Button variant="outline" className="border-iris-primary text-iris-primary hover:bg-iris-primary/10">
  Secondary Action
</Button>

// Accent Button
<Button className="bg-iris-accent hover:bg-iris-accent/80 text-white">
  Special Action
</Button>
```

### **Cards & Containers**

```tsx
// Primary Card
<Card className="bg-card border-iris-primary/20">
  <CardHeader>
    <CardTitle className="text-iris-primary">Card Title</CardTitle>
  </CardHeader>
</Card>

// Accent Card
<Card className="bg-iris-light border-iris-accent/30">
  <CardContent>
    <p className="text-iris-dark">Card content</p>
  </CardContent>
</Card>
```

### **Text & Typography**

```tsx
// Main Headings
<h1 className="text-iris-primary font-bold">Main Title</h1>

// Subheadings
<h2 className="text-iris-secondary font-semibold">Subtitle</h2>

// Accent Text
<span className="text-iris-accent font-medium">Highlighted Text</span>

// Body Text
<p className="text-iris-dark">Regular content text</p>
```

### **Interactive Elements**

```tsx
// Links
<a className="text-iris-primary hover:text-iris-accent underline">
  Interactive Link
</a>

// Form Elements
<input className="border-iris-primary/30 focus:border-iris-primary" />

// Progress Indicators
<div className="bg-iris-primary/20">
  <div className="bg-iris-primary h-full w-1/2"></div>
</div>
```

## 🌙 **Dark Mode Support**

The iris color system automatically adapts to dark mode:

```css
.dark {
  --iris-primary: 270 85% 65%;        /* Same vibrant purple */
  --iris-secondary: 240 100% 85%;     /* Same light blue */
  --iris-accent: 300 75% 70%;         /* Same magenta */
  --iris-light: 270 20% 15%;          /* Dark purple for backgrounds */
  --iris-dark: 270 30% 90%;           /* Light purple for text */
}
```

## 🎯 **Best Practices**

### **✅ Do:**

- Use `iris-primary` for main brand elements and CTAs
- Use `iris-secondary` for secondary actions and accents
- Use `iris-accent` for special highlights and important elements
- Use `iris-light` for subtle backgrounds and soft elements
- Use `iris-dark` for high-contrast text and important information
- Combine colors thoughtfully for visual hierarchy
- Use opacity variations (e.g., `iris-primary/20`) for subtle effects

### **❌ Don't:**

- Mix iris colors with the old `#F8D12E` yellow color
- Use too many different iris colors in one component
- Use low contrast combinations (e.g., light text on light backgrounds)
- Overuse the accent color - reserve it for special emphasis

## 🎨 **Color Combinations**

### **Recommended Pairings:**

```tsx
// Primary + White (High Contrast)
<div className="bg-iris-primary text-white">Primary + White</div>

// Primary + Light (Soft Contrast)
<div className="bg-iris-primary text-iris-light">Primary + Light</div>

// Secondary + Dark (Readable)
<div className="bg-iris-secondary text-iris-dark">Secondary + Dark</div>

// Accent + White (Bold)
<div className="bg-iris-accent text-white">Accent + White</div>

// Light + Dark (Subtle)
<div className="bg-iris-light text-iris-dark">Light + Dark</div>
```

### **Gradient Combinations:**

```tsx
// Primary to Secondary Gradient
<div className="bg-gradient-to-r from-iris-primary to-iris-secondary">
  Beautiful Gradient
</div>

// Primary to Accent Gradient
<div className="bg-gradient-to-br from-iris-primary to-iris-accent">
  Dynamic Gradient
</div>
```

## 🚀 **Implementation Examples**

### **Navigation Bar:**

```tsx
<nav className="bg-background border-b border-iris-primary/20">
  <div className="flex items-center space-x-4">
    <img src="/iris.jpg" alt="Logo" className="w-8 h-8" />
    <span className="text-iris-primary font-bold">Iris</span>
  </div>
</nav>
```

### **Hero Section:**

```tsx
<section className="bg-gradient-to-br from-iris-light to-background">
  <h1 className="text-iris-primary text-4xl font-bold">
    Welcome to Iris
  </h1>
  <p className="text-iris-dark text-lg">
    The ultimate memecoin hunter
  </p>
  <Button className="bg-iris-primary hover:bg-iris-primary/80">
    Get Started
  </Button>
</section>
```

### **Data Cards:**

```tsx
<Card className="bg-card border-iris-primary/20 hover:border-iris-primary/50">
  <CardHeader>
    <CardTitle className="text-iris-primary">📊 Analytics</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-iris-accent text-2xl font-bold">1,234</div>
    <p className="text-iris-dark text-sm">Total Users</p>
  </CardContent>
</Card>
```

## 🎉 **Result**

The new iris brand color system provides:

- **🌸 Natural Beauty**: Colors inspired by the elegant iris flower
- **🎯 Brand Consistency**: Unified color palette across all components
- **🌙 Dark Mode Ready**: Automatic adaptation for dark themes
- **♿ Accessibility**: High contrast ratios for readability
- **🎨 Visual Hierarchy**: Clear distinction between different element types
- **🚀 Modern Appeal**: Contemporary color choices that appeal to the crypto community

The iris color system creates a distinctive, professional, and visually appealing brand identity that sets Iris apart in the memecoin space! 🌸✨
