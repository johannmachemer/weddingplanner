# Wedding Planner

## Value Proposition

Guide couples through the entire wedding planning process in one place. Target: couples who are overwhelmed by having to gather information from dozens of different sources. Pain: planning a wedding currently means visiting countless websites for venues, catering, music, flowers, photography, and more — with no unified guidance.

**Core actions**: Discover preferences through conversation, browse and choose options step-by-step via visual widgets, build a complete wedding plan.

## Why LLM?

**Conversational win**: Instead of filling forms on 10 websites, the user describes their dream wedding naturally — "rustic outdoor wedding for 80 guests, budget 20k" — and gets guided through everything.
**LLM adds**: Understands natural language preferences, reasons about what fits together (outdoor venue → outdoor-friendly catering), adapts the planning flow to the user's pace and decisions.
**What LLM lacks**: Venue/vendor data, visual presentation of options, ability to capture structured selections — provided by tools and widgets.

## UI Overview

### Step 1: Discovery (Conversation only)
ChatGPT interviews the user to understand their wedding vision:
- Date and season
- Location / region
- Guest count
- Style and theme (rustic, elegant, modern, bohemian, etc.)
- Budget range
- Any must-haves or deal-breakers

### Step 2: Venue Selection (Widget — cards with images)
Tool presents 3-4 venue options as visual cards (photo, name, capacity, price, short description). User selects one. LLM confirms and moves to next step.

### Step 3: Catering & Food (Widget — cards with images)
Based on venue choice, presents menu styles (buffet, sit-down, food truck, family-style) with example menus and pricing. User selects.

### Step 4: Music & Entertainment (Widget — cards with images)
Options like DJ, live band, string quartet, acoustic duo — matched to the chosen style. User selects.

### Step 5: Flowers & Decoration (Widget — cards with images)
Theme-matched floral and decoration packages with visuals. User selects.

### Step 6: Photography (Widget — cards with images)
Photography styles and packages (documentary, classic, artistic). User selects.

### Step 7: Attire (Widget — cards with images)
Dress and suit style inspiration matched to the wedding theme. User selects.

### Step 8: Invitations (Widget — cards with images)
Invitation design styles that match the overall theme. User selects.

### Step 9: Wedding Plan Summary (Widget)
Final overview showing all selections, estimated total cost vs. budget, and a suggested planning timeline.

### Navigation
Users can revisit and change any previous selection at any point. When a choice changes, downstream suggestions may adapt accordingly.

## UX Flows

Plan a wedding:
1. ChatGPT discovers preferences through conversation (style, budget, guest count, location)
2. Browse venues → select one
3. Browse catering → select one
4. Browse music → select one
5. Browse flowers → select one
6. Browse photography → select one
7. Browse attire → select one
8. Browse invitations → select one
9. View complete wedding plan summary

User can revisit any category at any time by asking.

## Tools and Widgets

**Widget: browse-options**
- **Input**: `{ category, style?, guestCount?, budget? }`
- **Output**: `{ category, categoryLabel, step, totalSteps, nextCategory, isPerPerson, options[] }`
- **Views**: Card grid with image, name, description, price, details
- **State**: `selectedId` — persisted, visible to LLM via `useWidgetState`
- **Behavior**: User selects a card, clicks "Continue" to trigger LLM to proceed to next category

**Widget: view-wedding-plan**
- **Input**: `{ selections, guestCount? }`
- **Output**: `{ planItems[], guestCount, totalBudget }`
- **Views**: List of all selections with images, prices, and budget total

## Product Context

- **Existing products**: None — greenfield project
- **API/Data**: Mock data with realistic fake venues, caterers, musicians, etc.
- **Auth**: None required
- **Constraints**:
  - Widget space is limited — show 3-4 cards per category
  - Images use placeholder/stock URLs
  - No real bookings or payments
