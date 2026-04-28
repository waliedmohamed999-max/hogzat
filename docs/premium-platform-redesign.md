# Labayh Platform Redesign

## 1. Current State

The current platform is a Laravel + Blade application with legacy frontend layers, mixed inline styles, old carousel-driven sections, and an inconsistent visual language. It does not currently run on Next.js, Tailwind, Framer Motion, or shadcn.

This means the redesign should be treated as:

1. A complete design system reset.
2. A frontend architecture migration plan.
3. A phased UI rebuild to avoid breaking production behavior.

## 2. Product Direction

The platform should feel like a premium global booking and experiences product, combining:

- Airbnb listing clarity
- Apple spacing and restraint
- Stripe polish
- Notion simplicity
- Vercel precision

Core visual principles:

- clean whitespace
- large surfaces
- soft contrast
- rounded geometry
- premium editorial imagery
- strong hierarchy
- minimal noise

## 3. Brand and Visual System

### Color palette

- Primary: `#FF385C`
- Primary hover: `#E23050`
- Ink: `#111827`
- Ink soft: `#4B5563`
- Surface: `#FFFFFF`
- Surface muted: `#FAFAFA`
- Border: `#E5E7EB`
- Accent blue: `#2563EB`
- Success: `#16A34A`
- Warning: `#F59E0B`

### Typography

Arabic:

- `IBM Plex Sans Arabic` for product UI
- `Poppins` for secondary Latin UI when needed

Hierarchy:

- Display XL: 56/64, 700
- Display L: 44/52, 700
- Section title: 32/40, 700
- Card title: 20/30, 700
- Body: 16/28, 400-500
- Caption: 13/20, 500

### Radius

- Large surfaces: `32px`
- Cards: `24px`
- Inputs: `18px`
- Pills: `999px`

### Shadows

- Card default: `0 8px 30px rgba(17, 24, 39, 0.06)`
- Card hover: `0 18px 40px rgba(17, 24, 39, 0.12)`
- Floating search: `0 24px 60px rgba(17, 24, 39, 0.14)`

## 4. Layout System

### Max widths

- Page container: `1280px`
- Wide hero container: `1360px`
- Content gutters desktop: `32px`
- Tablet gutters: `24px`
- Mobile gutters: `16px`

### Breakpoints

- `sm`: 640
- `md`: 768
- `lg`: 1024
- `xl`: 1280
- `2xl`: 1440

## 5. Homepage Layout

### Navbar

- Sticky
- Transparent over hero, solid after scroll
- Logo right in RTL
- Menu centered
- Profile, language, notifications left
- Mobile version becomes drawer + bottom quick actions if needed

### Hero

- Full-bleed media
- Dark overlay for readability
- Clear editorial heading
- Subheading limited to 2 lines
- Floating glass search shell centered near lower hero edge

### Search Bar

Fields:

- Location
- Date range
- Guests
- Price range

Behavior:

- segmented advanced search
- compact desktop layout
- stacked mobile layout
- optional “Map view” and “Instant booking” toggles

### Destinations

- Labayh editorial cards
- 3-up or 4-up responsive
- large image
- destination title
- availability counters in pill chips

### Categories

- horizontal filter-style categories
- circular imagery or icon led
- scroll on mobile
- active state pill underline

### Featured Listings

- best-in-class listing cards
- image-first
- save button
- rating
- amenities chips
- clear price stack

### Urgent Deals

- listing cards with countdown ribbon
- stronger urgency color treatment
- limited quantity or time-left signal

### App Promotion

- soft floating phones
- compact CTA copy
- app buttons

### Features

- 2-column layout on desktop:
  - map / trust illustration
  - feature grid

### Footer

- 4-column structure
- support
- navigation
- product
- newsletter or app-link CTA

## 6. Core Reusable Components

### Navigation

- `Navbar`
- `MobileNavDrawer`
- `NavLink`
- `LanguageSwitcher`
- `ProfileMenu`

### Search

- `HeroSearchBar`
- `SearchFieldLocation`
- `SearchFieldDate`
- `SearchFieldGuests`
- `SearchFieldPrice`
- `FilterPanel`

### Cards

- `ListingCard`
- `ListingCardCompact`
- `DestinationCard`
- `CategoryChipCard`
- `DealCard`
- `FeatureCard`

### Utility Components

- `SectionHeader`
- `PillBadge`
- `RatingStars`
- `PriceStack`
- `AmenityChip`
- `CountdownBadge`
- `WishlistButton`
- `SkeletonCard`

## 7. Listing Card Standard

Every listing card should follow this hierarchy:

1. Image
2. Save button
3. Status badge if featured or urgent
4. Title
5. Location
6. Meta chips
7. Rating + reviews
8. Price + unit

Rules:

- title max 2 lines
- location max 2 lines
- chips should never wrap awkwardly
- price block always aligned consistently
- rating should not compete with price

## 8. Interaction Model

Micro-interactions:

- card hover lift
- image scale on hover
- button press feedback
- subtle fade and slide-in on reveal
- navbar backdrop transition on scroll
- skeleton loaders while data loads

Animation guidance:

- duration 180ms to 280ms
- ease-out for hover
- spring only for large transforms

## 9. Accessibility

- all controls keyboard reachable
- visible focus ring
- proper ARIA for menus, filters, datepickers, sliders
- contrast minimum AA
- body text never below 14px
- touch target minimum 44px

## 10. Frontend Architecture

### Ideal target stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Headless UI or Radix
- shadcn/ui

### Recommended app structure

```text
src/
  app/
    (marketing)/
      page.tsx
    listings/
      page.tsx
    listing/[slug]/
      page.tsx
    experiences/
      page.tsx
    experience/[slug]/
      page.tsx
  components/
    layout/
    cards/
    search/
    filters/
    sections/
    ui/
  lib/
    api/
    formatters/
    analytics/
  styles/
    globals.css
    tokens.css
```

## 11. Migration Strategy

Because the current platform is Laravel Blade, use one of these paths:

### Path A: Full frontend migration

- keep Laravel as API/backend
- build a new Next.js frontend
- gradually route traffic to the new frontend

Best for long-term product quality.

### Path B: Transitional redesign inside Laravel

- create a strict design system CSS layer
- rebuild Blade sections incrementally
- replace fragile legacy UI pieces one by one

Best if speed and low-risk rollout matter.

## 12. Recommended Rollout Order

1. Design tokens and typography
2. Navbar and hero search
3. Listing cards
4. Destination and category sections
5. Filters and results page
6. Listing details page
7. Experience details page
8. Footer and support surfaces
9. Motion and loading states

## 13. Immediate Next Build Scope

To start implementation safely, the first milestone should include:

- new design token layer
- new navbar
- new homepage hero
- new search shell
- new destination cards
- new listing cards
- new features section

This gives a visible premium jump without rewriting the entire platform at once.

## 14. Decision

Recommended path:

- Keep backend in Laravel.
- Build the Labayh frontend layer progressively.
- If budget and timeline allow, migrate to Next.js after UI system stabilization.

This is the cleanest route to a world-class UX without introducing product instability.
