# Wedding Planner

An AI-powered wedding planning assistant that guides couples through the entire planning process — from discovering their dream wedding vision to selecting venues, catering, music, flowers, and photography — all through natural conversation paired with interactive visual widgets.

Built with [Skybridge](https://docs.skybridge.tech/home) and the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/), deployable as a ChatGPT App or any MCP-compatible client.

---

## Try It Out

**Website:** [https://your-ai-wedding-pal.lovable.app](https://your-ai-wedding-pal.lovable.app)

**In ChatGPT:** [https://weddingplanner-2f049859.alpic.live/](https://weddingplanner-2f049859.alpic.live/)

**Directly in Alpic:** [https://weddingplanner-2f049859.alpic.live/try](https://weddingplanner-2f049859.alpic.live/try)

---

## The Problem

Planning a wedding means visiting dozens of websites for venues, caterers, florists, photographers, and more — with no unified guidance. Couples feel overwhelmed juggling options across scattered sources while trying to stay within budget.

## The Solution

Wedding Planner combines conversational AI with interactive visual widgets. Instead of filling out forms on 10 different websites, you describe your dream wedding naturally — *"rustic outdoor wedding for 80 guests, budget $20k"* — and get guided through everything step by step.

The AI understands your preferences, reasons about what fits together (outdoor venue = outdoor-friendly catering), and adapts to your pace. The interactive widget lets you browse real venues and vendors, compare prices, view locations on a map, and build a complete wedding plan.

## Features

- **Conversational Discovery** — Natural language interview to understand your wedding vision (date, location, guest count, budget, style, must-haves)
- **Real Vendor Data** — Searches Google Places API for actual venues, caterers, musicians, florists, and photographers in your area
- **Interactive Maps** — Mapbox-powered maps for browsing venue and florist locations
- **Step-by-Step Planning** — Guided flow through 5 categories: Venues, Catering, Music, Flowers, Photography
- **Budget Tracking** — Live running total across all selections vs. your stated budget
- **Full-Screen Widget** — Elegant sidebar navigation with category cards, image previews, and selection state

## How It Works

1. **Start a conversation** — Tell the AI about your dream wedding
2. **Discovery interview** — The AI asks about your date, location, guest count, budget, and style preferences
3. **Widget opens** — A full-screen interactive planner appears with vendor options tailored to your preferences
4. **Browse & select** — Navigate through venues (with map), catering, music, flowers, and photography
5. **Review your plan** — See a summary of all selections

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Skybridge](https://docs.skybridge.tech/home) (MCP App framework) |
| **Backend** | TypeScript, Node.js 24+, Express 5 |
| **Frontend** | React 19, Vite 7 |
| **Maps** | Mapbox GL |
| **Vendor Data** | Google Places API |
| **Validation** | Zod |
| **Deployment** | [Alpic](https://alpic.ai/) |

## Project Structure

```
weddingplanner/
├── server/
│   └── src/
│       ├── index.ts          # Express server entry point (port 3000)
│       ├── server.ts         # MCP server, tool & widget registration
│       ├── middleware.ts     # MCP HTTP middleware
│       ├── data.ts           # Fallback mock data for all categories
│       └── api/
│           ├── venues.ts         # Google Places search — venues
│           ├── catering.ts       # Google Places search — catering
│           ├── music.ts          # Google Places search — music
│           ├── flowers.ts        # Google Places search — flowers
│           └── photography.ts    # Google Places search — photography
├── web/
│   └── src/
│       ├── widgets/
│       │   └── plan-wedding.tsx  # Full-screen React wedding planner widget
│       ├── helpers.ts            # Skybridge hook generators
│       └── index.css             # Global styles & design tokens
├── alpic.json                    # Alpic deployment config
├── nodemon.json                  # Dev server file watching
├── package.json
└── tsconfig.json
```

## Setup & Installation

### Prerequisites

- **Node.js 24+** ([download](https://nodejs.org/))
- **pnpm** (recommended), npm, yarn, or bun

### 1. Clone the repository

```bash
git clone <repo-url>
cd weddingplanner
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

> The app works without a Google Places API key — it falls back to built-in mock data. With the key, it fetches real venues and vendors from Google Places.

### 4. Start the development server

```bash
pnpm dev
```

This starts:
- **MCP server** at `http://localhost:3000/mcp`
- **Skybridge DevTools UI** at `http://localhost:3000/`
- **Hot Module Replacement** for instant widget updates

### 5. Test your app

- **Locally**: Open `http://localhost:3000` to use the Skybridge DevTools UI
- **With ChatGPT / Claude**: Use an HTTP tunnel like [ngrok](https://ngrok.com/download) to expose your local server, then connect via the MCP endpoint. See [Testing Your App](https://docs.skybridge.tech/quickstart/test-your-app).

## Build & Deploy

### Build for production

```bash
pnpm build
```

Compiles the TypeScript server and Vite frontend into the `dist/` directory.

### Start production server

```bash
pnpm start
```

### Deploy to Alpic

```bash
pnpm deploy
```

Deploys to [Alpic](https://alpic.ai/) — create an account at [app.alpic.ai](https://app.alpic.ai/) first.

## Resources

- [Skybridge Documentation](https://docs.skybridge.tech/)
- [OpenAI Apps SDK Documentation](https://developers.openai.com/apps-sdk)
- [MCP Apps Documentation](https://github.com/modelcontextprotocol/ext-apps/tree/main)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Alpic Documentation](https://docs.alpic.ai/)
