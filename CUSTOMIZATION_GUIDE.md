# 🛠️ Customization Guide - ZK-Verify Dashboard

## Quick Customization Examples

### 1. Change Color Scheme

To replace the cyan/purple/green theme with your own colors:

#### Update Tailwind Classes in App.tsx

**Before** (Cyan primary):
```tsx
<button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500">
```

**After** (Custom: Rose to Pink):
```tsx
<button className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500">
```

#### Update All Gradient References

```tsx
// Step 1 - Upload (was cyan)
from-cyan-600 to-blue-600        → from-rose-600 to-pink-600

// Step 2 - Proving (was purple)
from-purple-600 to-indigo-600    → from-amber-600 to-orange-600

// Step 3 - Submit (was emerald)
from-emerald-600 to-teal-600     → from-green-600 to-lime-600

// Accents (were cyan)
cyan-400, cyan-500, cyan-600      → rose-400, rose-500, rose-600
```

#### Update Glow Effects

```tsx
// Before
shadow-cyan-500/20 hover:shadow-cyan-500/40

// After
shadow-rose-500/20 hover:shadow-rose-500/40
```

### 2. Modify Typography

#### Change Font Family

In `src/index.css`:

```css
/* Add different font import */
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&display=swap');

/* Update monospace references */
code, pre, .font-mono {
    font-family: 'IBM Plex Mono', monospace;  /* was JetBrains Mono */
}
```

#### Adjust Font Sizes

In `App.tsx`:

```tsx
// Make title larger
<h1 className="text-4xl font-black">     → text-5xl font-black

// Make labels smaller
<label className="text-sm font-semibold"> → text-xs font-semibold
```

### 3. Customize Step Colors

Replace the numbered badge colors:

```tsx
// Before: Step 1 = blue, Step 2 = purple, Step 3 = green
<div className="w-10 h-10 rounded-full bg-blue-600">1</div>
<div className="w-10 h-10 rounded-full bg-purple-600">2</div>
<div className="w-10 h-10 rounded-full bg-green-600">3</div>

// After: Step 1 = indigo, Step 2 = fuchsia, Step 3 = violet
<div className="w-10 h-10 rounded-full bg-indigo-600">1</div>
<div className="w-10 h-10 rounded-full bg-fuchsia-600">2</div>
<div className="w-10 h-10 rounded-full bg-violet-600">3</div>
```

### 4. Adjust Background Gradients

#### Change Main Background

In `App.tsx`:

```tsx
// Before: Slate dark gradient
<div className="bg-slate-950">   → <div className="bg-gray-950">
<div className="bg-slate-900">   → <div className="bg-gray-900">

// Before: Animated background
<div className="absolute top-0 left-1/3 w-96 h-96 bg-cyan-500/10">
// After: Different colors
<div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-500/10">
```

#### Adjust Animation Speed

In `src/index.css`:

```css
/* Before: 2 second animation */
@keyframes glow-pulse {
    animation: glow-pulse 2s ease-in-out infinite;
}

/* After: 3 second animation (slower) */
@keyframes glow-pulse {
    animation: glow-pulse 3s ease-in-out infinite;
}
```

### 5. Modify Card Styling

#### Increase Border Radius

```tsx
// Before: Rounded large
className="rounded-2xl"  → className="rounded-3xl"

// Before: Slightly rounded
className="rounded-lg"   → className="rounded-xl"
```

#### Change Glass Effect

```tsx
// Before: Light glass
bg-slate-800/40 backdrop-blur-xl

// After: More opaque glass
bg-slate-800/60 backdrop-blur-2xl
```

### 6. Customize Job Card Layout

To show more information in the verified jobs feed:

```tsx
// Before: Only transaction and trust score
<button className="w-full p-3 bg-slate-900/50">
    <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-mono text-cyan-300">{job.txHash.slice(0, 12)}...</p>
        <TrustBadge score={job.trustScore} />
    </div>
    <p className="text-sm text-slate-300">Output: {job.prediction.toFixed(4)}</p>
</button>

// After: Add timestamp and model info
<button className="w-full p-3 bg-slate-900/50">
    <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-mono text-cyan-300">{job.txHash.slice(0, 12)}...</p>
        <TrustBadge score={job.trustScore} />
    </div>
    <p className="text-xs text-slate-400 mb-1">
        {new Date(job.timestamp).toLocaleTimeString()}
    </p>
    <p className="text-sm text-slate-300">Output: {job.prediction.toFixed(4)}</p>
    <p className="text-xs text-slate-400 mt-1">Model: {job.modelCID.slice(0, 8)}...</p>
</button>
```

### 7. Add Dark/Light Theme Toggle

Add this to your App.tsx state:

```tsx
const [isDarkMode, setIsDarkMode] = useState(true);

// In header
<button 
    onClick={() => setIsDarkMode(!isDarkMode)}
    className="px-4 py-2 bg-slate-700 rounded-lg"
>
    {isDarkMode ? '☀️ Light' : '🌙 Dark'}
</button>

// Apply theme
<div className={isDarkMode ? 'dark' : 'light'}>
```

Then in `tailwind.config.js`:

```js
export default {
  darkMode: 'class',
  theme: {
    extend: {},
  },
}
```

### 8. Customize Modal Style

```tsx
// Before: Standard modal
<div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full p-8">

// After: Glassmorphic modal with backdrop
<div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl max-w-3xl w-full p-10 shadow-2xl">
```

### 9. Adjust Spacing & Padding

```tsx
// Increase outer padding
<div className="px-6 py-8">  → <div className="px-8 py-12">

// Increase card padding
<div className="p-8">        → <div className="p-10">

// Increase gaps between elements
<div className="space-y-6">   → <div className="space-y-8">
```

### 10. Customize Trust Score Badges

```tsx
const getTrustScoreColor = (score: number) => {
    // Before
    if (score >= 95) return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
    if (score >= 80) return 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300';
    return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
    
    // After: Different thresholds and colors
    if (score >= 98) return 'bg-green-500/20 border-green-500/50 text-green-300';
    if (score >= 90) return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
    if (score >= 80) return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
    return 'bg-red-500/20 border-red-500/50 text-red-300';
};
```

### 11. Add New Status Message Types

```tsx
// Before
type StatusType = 'idle' | 'loading' | 'success' | 'error';

// After: Add warning status
type StatusType = 'idle' | 'loading' | 'success' | 'error' | 'warning';

// Then add to getStatusColor()
const getStatusColor = () => {
    switch (statusType) {
        case 'warning': return 'bg-amber-950/80 border-amber-500/50 text-amber-200';
        // ... rest of cases
    }
};
```

### 12. Customize Animations

```tsx
// Slow down pulsing step indicator
// Before
className="animate-pulse"
// After: Custom slower pulse
className="animate-pulse" style={{animationDuration: '3s'}}

// Or define in CSS
@keyframes slow-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
.animate-slow-pulse {
    animation: slow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### 13. Adjust Responsive Breakpoints

```tsx
// Make layout 4-column on ultra-wide screens
<div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">

// Custom breakpoint in tailwind.config.js
export default {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',  // Add custom
    },
  },
}
```

### 14. Update CID Display Format

```tsx
// Before: Show first 12 chars and ellipsis
modelCID.slice(0, 12)

// After: Show more characters
modelCID.slice(0, 20)  // or .slice(0, -8) for last 8 chars

// Or create abbreviation function
const abbreviateCID = (cid: string, start = 6, end = 4) => 
    `${cid.slice(0, start)}...${cid.slice(-end)}`;
```

### 15. Customize Modal Appearance

```tsx
// Before
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm">

// After: Less dark overlay
<div className="fixed inset-0 bg-black/30 backdrop-blur-md">

// Before: Standard rounded corners
className="rounded-2xl"

// After: Pill-shaped modal
className="rounded-3xl"
```

---

## Common Customization Patterns

### Pattern 1: Add New Status Type

```typescript
type StatusType = 'idle' | 'loading' | 'success' | 'error' | 'processing';

const getStatusColor = () => {
    switch (statusType) {
        case 'processing': 
            return 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200';
        // ... other cases
    }
};
```

### Pattern 2: Persist Jobs to LocalStorage

```typescript
// Load from localStorage on mount
useEffect(() => {
    const saved = localStorage.getItem('verifiedJobs');
    if (saved) setVerifiedJobs(JSON.parse(saved));
}, []);

// Save on update
useEffect(() => {
    localStorage.setItem('verifiedJobs', JSON.stringify(verifiedJobs));
}, [verifiedJobs]);
```

### Pattern 3: Add Analytics Tracking

```typescript
const trackEvent = (event: string, data?: any) => {
    console.log(`[Analytics] ${event}`, data);
    // Send to analytics service (Mixpanel, Segment, etc)
};

// In handleUpload
trackEvent('file_upload', { modelFile: modelFile?.name });

// In handleSubmit
trackEvent('proof_submitted', { txHash });
```

### Pattern 4: Add Toast Notifications

```typescript
// Create simple toast (instead of status bar)
const showToast = (message: string, type: StatusType) => {
    setStatus(message);
    setStatusType(type);
    setTimeout(() => setStatus(''), 5000); // Auto-dismiss
};

// Usage
showToast('✓ Files uploaded!', 'success');
```

---

## Environment-Based Customization

In `.env.production`:

```env
VITE_BACKEND_URL=https://api.zkverify.com
VITE_CONTRACT_ADDRESS=0x...production...
VITE_NETWORK=ethereum-mainnet
VITE_THEME=production  # Control theme per environment
```

Then in App.tsx:

```tsx
const theme = import.meta.env.VITE_THEME || 'default';

<div className={theme === 'production' ? 'corporate-theme' : 'default-theme'}>
```

---

## Testing Your Customizations

1. **Color Changes**: Ensure sufficient contrast for accessibility
2. **Animation Speed**: Keep under 300ms for responsive feel
3. **Responsive**: Test on mobile, tablet, and desktop
4. **Performance**: Monitor page load time after changes
5. **Browser Compatibility**: Test in Chrome, Firefox, Safari

---

**Need more customization help?** Each component is self-contained and can be modified independently. Check the [COMPONENT_ARCHITECTURE.md](COMPONENT_ARCHITECTURE.md) for detailed component documentation.
