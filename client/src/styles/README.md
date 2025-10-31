# Modular CSS Architecture

This project uses a modular CSS structure with Tailwind CSS for efficient styling.

## Structure

```
src/
├── index.css          # Main entry point - imports all modules
└── styles/
    ├── base.css       # Base styles and resets
    ├── components.css # Reusable component classes
    ├── utilities.css  # Custom utility classes
    └── animations.css # Animation definitions
```

## File Descriptions

### `index.css`
- Main CSS entry point
- Imports Tailwind CSS
- Imports all modular CSS files
- Defines theme variables

### `base.css`
- Global resets and base styles
- Font family definitions
- Focus styles for accessibility
- Basic element styling

### `components.css`
Reusable component classes:
- `.card` - Card component with shadow and hover
- `.btn` - Button variants (primary, secondary, danger, success, outline)
- `.form-*` - Form element classes
- `.badge` - Badge component with variants
- `.alert` - Alert component with variants
- `.status-*` - Status badge classes
- `.container-custom` - Container utility

### `utilities.css`
Custom utility classes:
- `.text-gradient` - Gradient text effect
- `.hover-lift` - Hover lift animation
- `.hover-scale` - Hover scale effect
- `.line-clamp-*` - Text truncation
- `.flex-center`, `.flex-between` - Flexbox utilities
- `.scrollbar-thin` - Custom scrollbar styling

### `animations.css`
- Custom keyframe animations
- Animation utility classes
- Animation delay utilities
- Animation duration utilities

## Usage Examples

### Components
```jsx
// Card
<div className="card">
  <div className="card-body">Content</div>
</div>

// Buttons
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary btn-sm">Small</button>

// Forms
<div className="form-group">
  <label className="form-label">Email</label>
  <input className="form-input" />
</div>

// Badges
<span className="badge badge-primary">Category</span>
<span className="badge badge-success">Matched</span>
```

### Utilities
```jsx
// Flexbox
<div className="flex-center">Centered</div>
<div className="flex-between">Space between</div>

// Animations
<div className="animate-fade-in-up">Fade in</div>
<div className="hover-lift">Lift on hover</div>

// Text
<h1 className="text-gradient">Gradient Text</h1>
<p className="line-clamp-2">Truncated text</p>
```

## Best Practices

1. **Use component classes** for reusable UI elements
2. **Use utility classes** for one-off styling needs
3. **Combine with Tailwind** utilities when needed
4. **Keep modular** - add new components to `components.css`
5. **Document** any new utility classes you add

## Extending

To add a new component class:
1. Add it to `components.css`
2. Use semantic naming (`.btn-*`, `.card-*`, etc.)
3. Follow existing patterns
4. Update this README

To add a new utility:
1. Add it to `utilities.css`
2. Keep it generic and reusable
3. Document its purpose

