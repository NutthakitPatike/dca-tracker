# Design System: DCAport

## Project
- **Name:** DCAport
- **Stack:** Next.js + Tailwind CSS
- **Product type:** Personal finance dashboard with expense/income tracking and DCA investing

## Pattern
- **Name:** Portfolio Grid
- **Focus:** clear financial summary, fast access to key metrics, clean data cards
- **CTA placement:** prominent on hero/dashboard actions and form buttons
- **Color strategy:** neutral backgrounds, dark text, blue accent for actions
- **Sections:** hero / summary cards, transaction management, portfolio management, charts

## Style
- **Name:** Motion-Driven
- **Keywords:** smooth transitions, subtle hover feedback, modern financial UI, minimal visual noise
- **Best for:** fintech, investment dashboards, personal finance tools
- **Performance:** good
- **Accessibility:** respect prefers-reduced-motion

## Colors
| Role | Hex |
|------|-----|
| Primary | #18181B |
| Secondary | #3F3F46 |
| CTA | #2563EB |
| Background | #FAFAFA |
| Surface | #FFFFFF |
| Text | #09090B |
| Muted | #475569 |

## Typography
- **Heading:** IBM Plex Sans
- **Body:** IBM Plex Sans
- **Mood:** trustworthy, professional, modern
- **Google Fonts:** https://fonts.google.com/share?selection.family=IBM+Plex+Sans:wght@300;400;500;600;700

### CSS Import
```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
```

## Key Effects
- scroll animation for section reveal
- hover states with 200–300ms ease
- entrance animation for cards and buttons
- subtle shadows and elevated surfaces
- respect reduced motion preference

## Avoid
- corporate generic templates
- overly saturated color schemes
- emoji icons
- cluttered data panels

## Pre-Delivery Checklist
- [ ] No emoji icons; use SVG icon system
- [ ] `cursor-pointer` on interactive elements
- [ ] Smooth hover states and transitions
- [ ] Light mode contrast meets accessibility
- [ ] Visible focus states for keyboard navigation
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] Prefer reduced motion when requested
