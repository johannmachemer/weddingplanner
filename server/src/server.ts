import { McpServer } from "skybridge/server";
import { z } from "zod";
import { mockData, categoryLabels, categoryOrder } from "./data.js";
import { searchVenues } from "./api/venues.js";
import { searchCatering } from "./api/catering.js";
import { searchMusic } from "./api/music.js";
import { searchFlowers } from "./api/flowers.js";
import { searchPhotography } from "./api/photography.js";

const categoryIntros: Record<string, string> = {
  venues: "Where your love story will unfold — the venue sets the tone for everything.",
  catering: "Great food makes great memories! Pick a style that matches your vibe.",
  music: "The soundtrack to your celebration — from ceremony to last dance.",
  flowers: "Natural beauty that brings your theme to life.",
  photography: "Capture these moments forever with the right artistic eye.",
  attire: "What you'll wear on the big day — feel absolutely incredible.",
  invitations: "Your guests' first glimpse of the magic to come.",
};

const server = new McpServer(
  {
    name: "wedding-planner",
    version: "0.0.1",
  },
  { capabilities: {} },
)
  .registerTool(
    "start-planning",
    {
      description:
        "Start the wedding planning session. ALWAYS call this tool first when a user wants to plan a wedding. " +
        "This returns your persona and interview guide. Do NOT skip this step.",
      inputSchema: {},
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async () => {
      return {
        structuredContent: {
          persona: {
            name: "Enchanted Wedding Planner",
            tone: "Warm, encouraging, and professional. Like a trusted friend who happens to be an expert.",
            style: [
              "Use gentle enthusiasm — celebrate their choices without being over-the-top.",
              "Sprinkle in brief expert insights, e.g. 'A spring wedding gives you the most gorgeous natural lighting for photos!'",
              "Keep responses concise but heartfelt. No walls of text.",
            ],
          },
          discoveryInterview: {
            instructions:
              "Guide the conversation naturally through the questions below. Just ask one question at a time — weave them into a warm conversation, 1 at a time. React to their answers with genuine interest before asking the next question.",
            opening: "Warmly greet them and ask what brought them here. Are they newly engaged? Starting to plan?",
            questions: [
              { topic: "planning status", ask: "What is the status of your wedding planning?", react: "If they already have some questions of the following answered, you can skip them. So just ask the next one that hasn't been answered yet. You can also skip the questions if they are all answered." },
              { topic: "date", ask: "When are you thinking for the big day?", react: "Comment on what makes that season special." },
              { topic: "location", ask: "Do you have a location or region in mind?", react: "Share something nice about the area if you can." },
              { topic: "guestCount", ask: "How many loved ones will be celebrating with you?", react: "React warmly — 'Intimate gatherings have such a special energy!' or 'A big celebration — I love it!'" },
              { topic: "budget", ask: "Let's talk budget — what range are you comfortable with?", react: "Be reassuring: 'We can create something magical at any budget.'" },
              { topic: "style", ask: "What's the overall vibe you're dreaming of?", react: "Offer examples if they're unsure: rustic, elegant, modern, bohemian, garden party." },
              { topic: "mustHaves", ask: "Any absolute must-haves or deal-breakers?", react: "Take note and acknowledge their priorities." },
            ],
            afterDiscovery:
              "Summarize what you've learned: 'So we're looking at a [style] wedding for [count] guests in [season], with a budget around $[amount]. I love this vision!' " +
              "Then say: 'Let's start bringing this to life!' " +
              "Then call the plan-wedding widget with the user's preferences.",
          },
          rules: [
            "NEVER skip the discovery phase. Always have a conversation first.",
            "Ask 1 questions at a time, not all at once.",
            "React to their answers with genuine interest before asking the next question.",
            "Remember all their preferences and reference them throughout the planning.",
          ],
        },
        content: [],
      };
    },
  )
  .registerWidget(
    "plan-wedding",
    {
      description: "Full-screen wedding planning experience",
      _meta: {
        ui: {
          csp: {
            connectDomains: [
              "https://api.mapbox.com",
              "https://*.tiles.mapbox.com",
              "https://events.mapbox.com",
            ],
            resourceDomains: [
              "https://picsum.photos",
              "https://fastly.picsum.photos",
              "https://places.googleapis.com",
              "https://lh3.googleusercontent.com",
              "https://api.mapbox.com",
              "https://*.tiles.mapbox.com",
              "https://fonts.googleapis.com",
            ],
          },
        },
      },
    },
    {
      description:
        "Open the full-screen wedding planner. Call this ONCE after discovery is complete. " +
        "The widget handles all category browsing, selection, and summary internally. " +
        "Do NOT call this multiple times. After calling it, let the user interact with the widget. " +
        "If the user asks questions about options while using the widget, answer helpfully based on your wedding expertise. " +
        "When the user shares their final plan via the widget, celebrate their choices and highlight how they complement each other. " +
        "IMPORTANT: Always provide the 'queries' parameter with tailored Google Places search queries for each category based on what you learned during the discovery conversation. " +
        "Craft specific queries that reflect the couple's style, location, and preferences (e.g. 'rustic barn wedding venue near Provence' instead of generic 'wedding venue')."+
        "When the users asks for changes or is not satisfied with the options, recall the tool with a new query for this category that is more specific based on their feedback. For example, if they want more elegant venues, update the query to 'elegant wedding venues in [location]'. ",
      inputSchema: {
        guestCount: z.number().optional().describe("Expected number of guests"),
        queries: z.object({
          venues: z.string().describe("Google Places search query for wedding venues"),
          catering: z.string().describe("Google Places search query for catering"),
          music: z.string().describe("Google Places search query for music & entertainment"),
          flowers: z.string().describe("Google Places search query for florists & decoration"),
          photography: z.string().describe("Google Places search query for photographers"),
        }).describe("Search queries for each category, tailored to the couple's preferences."),
      },
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async ({ guestCount, queries }) => {
      console.log("[plan-wedding] queries:", queries, "| API key set:", !!process.env.GOOGLE_PLACES_API_KEY);

      const [venueOptions, cateringOptions, musicOptions, flowerOptions, photoOptions] = await Promise.all([
        searchVenues(queries.venues),
        searchCatering(queries.catering),
        searchMusic(queries.music),
        searchFlowers(queries.flowers),
        searchPhotography(queries.photography),
      ]);

      const liveData: Record<string, typeof venueOptions> = {
        venues: venueOptions,
        catering: cateringOptions,
        music: musicOptions,
        flowers: flowerOptions,
        photography: photoOptions,
      };

      const categories = categoryOrder.map((key) => ({
        key,
        label: categoryLabels[key],
        intro: categoryIntros[key],
        isPerPerson: key === "catering",
        options: (liveData[key] ?? mockData[key]).map(
          ({ id, name, description, price, details, imageUrl, coords }) => ({
            id,
            name,
            description,
            price,
            details,
            imageUrl,
            ...(coords && { coords }),
          }),
        ),
      }));

      const structuredContent = {
        categories,
        guestCount: guestCount || 100,
        llmBehavior: [
          "The fullscreen widget is now open. The user will browse and select options for each category inside the widget.",
          "Keep your message very brief — just say something warm like 'Here we go! Browse through each category and pick what speaks to you.'",
          "Do NOT list categories or options — the widget handles everything visually.",
          "If the user asks for advice on a specific option, provide expert insight.",
        ],
      };

      return {
        structuredContent,
        content: [],
      };
    },
  );

export default server;
export type AppType = typeof server;
