# KeepLeads Design Guidelines

## Design Approach

**Selected Framework**: Hybrid approach drawing from Stripe's payment excellence + Linear's clean B2B aesthetic + Material Design principles

**Core Philosophy**: Professional healthcare marketplace requiring trust through clarity, simplicity, and precision. Every interaction should feel secure and transparent.

## Typography System

**Primary Font**: Inter (via Google Fonts CDN)
- Headings: 600-700 weight, sizes from 2xl to 4xl
- Body: 400-500 weight, base to lg sizes
- Labels/Meta: 500 weight, sm to base sizes

**Hierarchy**:
- Page titles: text-3xl font-semibold
- Section headers: text-xl font-semibold
- Card titles: text-lg font-medium
- Body text: text-base font-normal
- Helper text: text-sm text-gray-600

## Layout & Spacing System

**Tailwind Units**: Consistently use 4, 6, 8, 12, 16, 20, 24, 32 units
- Component internal padding: p-6 to p-8
- Section spacing: py-12 to py-20
- Card gaps: gap-6 to gap-8
- Modal padding: p-8 to p-10

**Container Strategy**:
- Dashboard content: max-w-7xl mx-auto
- Modal content: max-w-2xl
- Forms: max-w-xl

## Component Library

### Navigation & Structure
**Top Navigation Bar**:
- Height h-16, sticky positioning
- Logo left, user menu right, credit balance display (pill badge showing credits with icon)
- Navigation links center-aligned
- Subtle bottom border for depth

**Sidebar** (if dashboard layout):
- Width w-64 fixed
- Vertical navigation with icons + labels
- Active state: slightly emphasized background with accent border-left indicator

### Cards & Containers
**Lead Cards**:
- Rounded corners (rounded-lg)
- Subtle shadow (shadow-sm hover:shadow-md transition)
- Padding p-6
- Header with lead type badge, meta info row (date, location), pricing display prominent
- Action button bottom-right

**Stats/Metrics Cards**:
- Grid layout (grid-cols-1 md:grid-cols-3 lg:grid-cols-4)
- Large number display (text-3xl font-bold)
- Descriptive label below (text-sm)
- Icon top-left corner

### Forms & Inputs
**Input Fields**:
- Height h-12
- Rounded corners rounded-md
- Border states: border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200
- Padding px-4
- Label above with text-sm font-medium mb-2
- Helper text below with text-xs text-gray-500

**Credit Card Form Specific**:
- Card number: Full width with spacing formatter (automatic)
- Expiry + CVV: Two-column grid (grid-cols-2 gap-4)
- Card brand icon: Positioned absolute right-3 within input
- Security badges: Display Visa/Mastercard/etc icons below form

### Payment Modal Design
**Modal Container**:
- Width max-w-2xl
- Background with backdrop blur (backdrop-blur-sm bg-black/50)
- Modal content: bg-white rounded-xl shadow-2xl
- Padding p-10
- Close button top-right (X icon)

**Checkout Flow Structure**:
1. **Header Section**: Title "Comprar Créditos" + close button
2. **Credit Package Selection**: Radio cards showing different credit bundles with pricing
3. **Payment Method Tabs**: Horizontal tab navigation (Cartão de Crédito / PIX)
4. **Payment Form Area**: 
   - Card tab: Credit card form fields
   - PIX tab: QR Code display (centered, w-64 h-64) + copy code button + instructions
5. **Summary Sidebar** (right column in 2-col grid): Order summary, credit amount, total, security badges
6. **Action Footer**: Primary CTA button full-width at bottom

**Tab Navigation**:
- Horizontal layout with border-bottom
- Active tab: border-b-2 border-blue-600 font-medium
- Inactive: text-gray-600 hover:text-gray-900

**QR Code Display**:
- Center-aligned container
- QR code placeholder: border-2 border-dashed border-gray-300 rounded-lg p-6
- Below: Dotted code text in monospace font with copy button
- Countdown timer showing expiration (text-sm text-gray-600)

### Buttons
**Primary Action**:
- Height h-12, full rounded (rounded-lg)
- Font medium weight, text-base
- Padding px-8
- Disabled state with opacity-50 cursor-not-allowed

**Secondary Action**:
- Same dimensions, border variant with transparent background

**Button on Images** (Hero sections):
- Backdrop blur: backdrop-blur-md bg-white/20
- Text white with drop shadow
- Border: border border-white/30

## Data Display Components

**Lead Listing Table**:
- Alternating row backgrounds (even:bg-gray-50)
- Column headers: font-medium text-sm text-gray-700 uppercase tracking-wide
- Row padding py-4
- Status badges: pill shape, colored backgrounds (green for active, yellow for pending)

**Transaction History**:
- Timeline layout with connecting lines
- Each entry: date left, icon center, details right
- Amount display emphasized with font-semibold

## Images

**Hero Section**: Large hero image showcasing healthcare professionals or modern clinic environment
- Height: 60vh on desktop, 40vh mobile
- Overlay: gradient from transparent to dark at bottom (bg-gradient-to-t from-black/60 to-transparent)
- Content positioned bottom-left with z-10
- CTA buttons use backdrop-blur treatment described above

**Supporting Images**:
- Feature sections: 2-column layout with image alternating left/right
- Testimonial avatars: rounded-full w-12 h-12
- Partner logos: grayscale filter with hover:grayscale-0

## Accessibility & Interactions

**Focus States**: All interactive elements have visible focus rings (ring-2 ring-offset-2 ring-blue-500)

**Loading States**: 
- Skeleton screens for data loading (animate-pulse bg-gray-200 rounded)
- Spinner for button actions (inline with text)

**Transitions**: Use transition-all duration-200 for smooth state changes on cards, buttons, tabs

**Error States**: Red border (border-red-500) + error message below input (text-red-600 text-sm)

## Spacing Rhythm

Vertical section spacing follows 12-unit increments:
- Between major sections: py-20
- Between cards in grid: gap-6
- Between form groups: space-y-6
- Modal internal sections: space-y-8

This creates consistent visual rhythm throughout the platform while maintaining professional density appropriate for B2B healthcare marketplace.