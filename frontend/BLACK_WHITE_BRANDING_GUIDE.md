# ⚫⚪ Black & White Branding Guide - Iris

## 🎯 **Brand Transformation Overview**

Iris has been transformed from a colorful iris-inspired theme to a sophisticated black and white color scheme. This creates a clean, modern, and professional aesthetic that emphasizes content and functionality.

## 🎨 **New Color Palette**

### **Light Mode Colors**

| Color | HSL Value | Usage | Description |
|-------|-----------|-------|-------------|
| **Iris Primary** | `0 0% 0%` | Main brand color, buttons, highlights | Pure Black - Primary brand color |
| **Iris Secondary** | `0 0% 50%` | Accents, secondary elements | Medium Gray - Secondary accent |
| **Iris Accent** | `0 0% 20%` | Call-to-actions, special highlights | Dark Gray - Accent color |
| **Iris Light** | `0 0% 95%` | Backgrounds, subtle elements | Very Light Gray - Backgrounds |
| **Iris Dark** | `0 0% 10%` | Text, contrast elements | Very Dark Gray - Text/contrast |

### **Dark Mode Colors**

| Color | HSL Value | Usage | Description |
|-------|-----------|-------|-------------|
| **Iris Primary** | `0 0% 100%` | Main brand color, buttons, highlights | Pure White - Primary brand color |
| **Iris Secondary** | `0 0% 50%` | Accents, secondary elements | Medium Gray - Secondary accent |
| **Iris Accent** | `0 0% 80%` | Call-to-actions, special highlights | Light Gray - Accent color |
| **Iris Light** | `0 0% 5%` | Backgrounds, subtle elements | Very Dark Gray - Dark backgrounds |
| **Iris Dark** | `0 0% 90%` | Text, contrast elements | Light Gray - Text/contrast |

## 🔧 **Technical Implementation**

### **CSS Custom Properties**

All colors are available as CSS custom properties:

```css
:root {
  /* Light Mode */
  --iris-primary: 0 0% 0%;            /* Pure Black */
  --iris-secondary: 0 0% 50%;         /* Medium Gray */
  --iris-accent: 0 0% 20%;            /* Dark Gray */
  --iris-light: 0 0% 95%;             /* Very Light Gray */
  --iris-dark: 0 0% 10%;              /* Very Dark Gray */
}

.dark {
  /* Dark Mode */
  --iris-primary: 0 0% 100%;          /* Pure White */
  --iris-secondary: 0 0% 50%;         /* Medium Gray */
  --iris-accent: 0 0% 80%;            /* Light Gray */
  --iris-light: 0 0% 5%;              /* Very Dark Gray */
  --iris-dark: 0 0% 90%;              /* Light Gray */
}
```

### **System Colors Updated**

The entire system color palette has been updated to use black and white:

```css
:root {
  /* Light Mode System Colors */
  --background: 0 0% 100%;            /* White background */
  --foreground: 0 0% 10%;             /* Dark text */
  --primary: 0 0% 0%;                 /* Black primary */
  --secondary: 0 0% 95%;              /* Light gray secondary */
  --muted: 0 0% 95%;                  /* Light gray muted */
  --accent: 0 0% 20%;                 /* Dark gray accent */
  --border: 0 0% 85%;                 /* Light gray borders */
  --input: 0 0% 90%;                  /* Light gray inputs */
  --ring: 0 0% 0%;                    /* Black focus rings */
}

.dark {
  /* Dark Mode System Colors */
  --background: 0 0% 5%;              /* Very dark background */
  --foreground: 0 0% 90%;             /* Light text */
  --primary: 0 0% 100%;               /* White primary */
  --secondary: 0 0% 15%;              /* Dark gray secondary */
  --muted: 0 0% 15%;                  /* Dark gray muted */
  --accent: 0 0% 80%;                 /* Light gray accent */
  --border: 0 0% 20%;                 /* Dark gray borders */
  --input: 0 0% 20%;                  /* Dark gray inputs */
  --ring: 0 0% 100%;                  /* White focus rings */
}
```

## 🎯 **Usage Guidelines**

### **Tailwind CSS Classes**

Use these Tailwind classes for consistent styling:

```tsx
// Text Colors
<span className="text-iris-primary">Primary Text</span>      // Black (light) / White (dark)
<span className="text-iris-secondary">Secondary Text</span>  // Medium Gray
<span className="text-iris-accent">Accent Text</span>        // Dark Gray (light) / Light Gray (dark)
<span className="text-iris-light">Light Text</span>          // Very Light Gray (light) / Very Dark Gray (dark)
<span className="text-iris-dark">Dark Text</span>            // Very Dark Gray (light) / Light Gray (dark)

// Background Colors
<div className="bg-iris-primary">Primary Background</div>    // Black (light) / White (dark)
<div className="bg-iris-secondary">Secondary Background</div> // Medium Gray
<div className="bg-iris-accent">Accent Background</div>      // Dark Gray (light) / Light Gray (dark)
<div className="bg-iris-light">Light Background</div>        // Very Light Gray (light) / Very Dark Gray (dark)
<div className="bg-iris-dark">Dark Background</div>          // Very Dark Gray (light) / Light Gray (dark)

// Border Colors
<div className="border-iris-primary">Primary Border</div>    // Black (light) / White (dark)
<div className="border-iris-secondary">Secondary Border</div> // Medium Gray
<div className="border-iris-accent">Accent Border</div>      // Dark Gray (light) / Light Gray (dark)
```

### **Component-Specific Usage**

#### **Buttons & CTAs**
```tsx
// Primary Button
<Button className="bg-iris-primary hover:bg-iris-primary/80 text-white dark:text-black">
  Primary Action
</Button>

// Secondary Button
<Button variant="outline" className="border-iris-primary text-iris-primary hover:bg-iris-primary/10">
  Secondary Action
</Button>

// Accent Button
<Button className="bg-iris-accent hover:bg-iris-accent/80 text-white dark:text-black">
  Special Action
</Button>
```

#### **Cards & Containers**
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

#### **Text & Typography**
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

## 🌙 **Dark Mode Support**

The black and white color system automatically adapts to dark mode:

### **Light Mode (Default)**
- **Primary**: Black (`0 0% 0%`)
- **Background**: White (`0 0% 100%`)
- **Text**: Dark Gray (`0 0% 10%`)
- **Accents**: Dark Gray (`0 0% 20%`)

### **Dark Mode**
- **Primary**: White (`0 0% 100%`)
- **Background**: Very Dark Gray (`0 0% 5%`)
- **Text**: Light Gray (`0 0% 90%`)
- **Accents**: Light Gray (`0 0% 80%`)

## 🎨 **Visual Impact**

### **Design Benefits**
- ✅ **Clean & Modern**: Sophisticated black and white aesthetic
- ✅ **High Contrast**: Excellent readability and accessibility
- ✅ **Timeless**: Classic color scheme that won't date
- ✅ **Professional**: Serious, business-like appearance
- ✅ **Focus on Content**: Colors don't distract from information

### **Accessibility**
- ✅ **High Contrast Ratios**: Meets WCAG AA standards
- ✅ **Clear Hierarchy**: Easy to distinguish between elements
- ✅ **Readable Text**: Optimal contrast for all text sizes
- ✅ **Focus Indicators**: Clear focus states for keyboard navigation

## 🚀 **Implementation Examples**

### **Navigation Bar**
```tsx
<nav className="bg-background border-b border-iris-primary/20">
  <div className="flex items-center space-x-4">
    <img src="/iris.jpg" alt="Logo" className="w-8 h-8" />
    <span className="text-iris-primary font-bold">Iris</span>
  </div>
</nav>
```

### **Hero Section**
```tsx
<section className="bg-gradient-to-br from-iris-light to-background">
  <h1 className="text-iris-primary text-4xl font-bold">
    Welcome to Iris
  </h1>
  <p className="text-iris-dark text-lg">
    The ultimate memecoin hunter
  </p>
  <Button className="bg-iris-primary hover:bg-iris-primary/80 text-white dark:text-black">
    Get Started
  </Button>
</section>
```

### **Data Cards**
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

## 🎯 **Best Practices**

### **✅ Do:**
- Use `iris-primary` for main brand elements and CTAs
- Use `iris-secondary` for secondary actions and accents
- Use `iris-accent` for special highlights and important elements
- Use `iris-light` for subtle backgrounds and soft elements
- Use `iris-dark` for high-contrast text and important information
- Maintain consistent contrast ratios
- Test both light and dark modes

### **❌ Don't:**
- Mix black and white theme with old colorful elements
- Use low contrast combinations
- Overuse accent colors - keep it minimal
- Forget to test accessibility

## 🎉 **Result**

The new black and white branding provides:

- **⚫⚪ Sophisticated Aesthetic**: Clean, modern, professional appearance
- **🎯 Content Focus**: Colors don't distract from information
- **♿ Excellent Accessibility**: High contrast ratios for readability
- **🌙 Perfect Dark Mode**: Seamless light/dark mode transitions
- **⏰ Timeless Design**: Classic color scheme that won't date
- **📱 Universal Appeal**: Works across all devices and contexts

The black and white color system creates a sophisticated, professional, and accessible design that emphasizes content and functionality while maintaining the Iris brand identity! ⚫⚪✨
