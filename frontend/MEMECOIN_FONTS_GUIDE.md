# 🎨 Memecoin Fonts Guide - Iris

## 🚀 **New Font System Overview**

We've upgraded Iris with a comprehensive set of memecoin-appropriate fonts that give the platform a fun, playful, and crypto-native feel while maintaining professionalism.

## 📝 **Available Font Classes**

### **🎯 Primary Memecoin Fonts**

| Class | Font Family | Usage | Style |
|-------|-------------|-------|-------|
| `.meme-title` | **Fredoka** | Main headings, hero text | Bold, playful, rounded |
| `.meme-subtitle` | **Comic Neue** | Subheadings, descriptions | Casual, friendly |
| `.meme-body` | **Quicksand** | Body text, descriptions | Clean, modern, readable |
| `.meme-playful` | **Fredoka** | Buttons, call-to-actions | Fun, engaging |
| `.meme-comic` | **Comic Neue** | Error messages, alerts | Bold, attention-grabbing |

### **🔮 Crypto-Tech Fonts**

| Class | Font Family | Usage | Style |
|-------|-------------|-------|-------|
| `.crypto-tech` | **Space Grotesk** | Technical data, stats | Modern, geometric |
| `.crypto-futuristic` | **Orbitron** | Brand name, logos | Futuristic, sci-fi |
| `.crypto-bold` | **Rajdhani** | Numbers, metrics | Strong, industrial |

### **🎨 Legacy Fonts (Still Available)**

| Class | Font Family | Usage | Style |
|-------|-------------|-------|-------|
| `.nouns` | **Londrina Solid** | Special headings | Bold, serif |
| `.sen` | **Sen** | General text | Clean, sans-serif |

## 🎯 **Usage Guidelines**

### **For Different Content Types:**

#### **🏠 Homepage & Landing Pages**
```tsx
// Main hero title
<h1 className="meme-title text-4xl font-bold text-iris-primary">
  The Ultimate Memecoin Hunter
</h1>

// Subtitle/description
<p className="meme-subtitle text-muted-foreground">
  Hunt the next moonshot 🚀
</p>

// Body text
<p className="meme-body text-sm">
  Real-time analytics for memecoins
</p>
```

#### **📊 Dashboard & Data Display**
```tsx
// Section headers
<h2 className="meme-title text-2xl font-bold">
  📱 Real-Time TikTok Feed
</h2>

// Data labels
<span className="crypto-tech text-sm font-medium">
  Total Messages: 1,234
</span>

// Numbers/metrics
<div className="crypto-bold text-3xl font-bold text-green-500">
  $1,234.56
</div>
```

#### **🔧 Technical Components**
```tsx
// Brand/logo
<span className="crypto-futuristic text-xl font-bold">
  Iris
</span>

// Error messages
<h3 className="meme-comic text-lg font-semibold text-red-500">
  No Data Found
</h3>

// Buttons
<button className="meme-playful font-semibold">
  Connect Wallet
</button>
```

## 🎨 **Font Combinations**

### **Perfect Pairings:**

1. **Hero Sections**: `meme-title` + `meme-subtitle`
2. **Data Cards**: `crypto-tech` + `crypto-bold`
3. **Error States**: `meme-comic` + `meme-body`
4. **Navigation**: `crypto-futuristic` + `meme-playful`

## 🚀 **Tailwind Integration**

All fonts are available as Tailwind classes:

```tsx
// Using Tailwind font-family utilities
<h1 className="font-meme-title text-4xl">
  Memecoin Title
</h1>

<p className="font-crypto-tech text-sm">
  Technical data
</p>
```

## 📱 **Responsive Considerations**

### **Font Sizes by Screen Size:**

```tsx
// Responsive font sizing
<h1 className="meme-title text-2xl md:text-3xl lg:text-4xl">
  Responsive Title
</h1>

<p className="meme-body text-xs sm:text-sm md:text-base">
  Responsive body text
</p>
```

## 🎯 **Best Practices**

### **✅ Do:**
- Use `meme-title` for main headings
- Use `meme-body` for readable content
- Use `crypto-futuristic` for brand elements
- Use `crypto-bold` for numbers and metrics
- Combine fonts thoughtfully for hierarchy

### **❌ Don't:**
- Mix too many different fonts in one section
- Use `meme-comic` for important information
- Use `crypto-futuristic` for body text (hard to read)
- Overuse decorative fonts

## 🎨 **Color Combinations**

### **Recommended Color + Font Pairings:**

```tsx
// Primary brand
<span className="meme-title text-iris-primary">Iris</span>

// Success states
<div className="crypto-bold text-green-500">+25.6%</div>

// Error states
<h3 className="meme-comic text-red-500">Error!</h3>

// Muted information
<p className="meme-body text-muted-foreground">Last updated</p>
```

## 🔧 **Implementation Examples**

### **Card Headers:**
```tsx
<CardHeader>
  <h3 className="meme-title text-lg font-bold">
    💬 Telegram Channels
  </h3>
  <p className="meme-body text-sm text-muted-foreground">
    Monitor memecoin activity
  </p>
</CardHeader>
```

### **Data Display:**
```tsx
<div className="grid grid-cols-3 gap-4">
  <div className="text-center">
    <div className="crypto-bold text-2xl font-bold text-iris-primary">
      1,234
    </div>
    <div className="crypto-tech text-xs text-muted-foreground">
      Total Channels
    </div>
  </div>
</div>
```

### **Button Styles:**
```tsx
<Button className="meme-playful font-semibold bg-iris-primary text-black">
  🚀 Hunt Memecoins
</Button>
```

## 🎯 **Font Loading**

All fonts are loaded via Google Fonts in `globals.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Fredoka:wght@300..600&family=Comic+Neue:wght@300;400;700&family=Quicksand:wght@300..700&family=Space+Grotesk:wght@300..700&family=Orbitron:wght@400..900&family=Rajdhani:wght@300..700&display=swap");
```

## 🚀 **Performance Notes**

- All fonts use `display=swap` for optimal loading
- Font weights are optimized for web performance
- Fallback fonts are specified for each family
- CSS classes are cached and optimized

---

## 🎉 **Result**

The new font system gives Iris a distinctive memecoin personality that's:
- **Fun & Playful** - Appeals to the memecoin community
- **Professional** - Maintains credibility for trading
- **Readable** - Ensures good UX across all devices
- **Branded** - Creates a unique visual identity

Use these fonts consistently across the platform to create a cohesive, engaging experience that resonates with the memecoin community! 🚀
