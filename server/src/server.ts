import "dotenv/config";
import { McpServer } from "skybridge/server";
import { z } from "zod";
import { mockData, categoryLabels, categoryOrder, type Category } from "./data.js";

const googlePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY;
const fallbackImageDomain = "https://picsum.photos";

type VendorOption = {
  id: string;
  name: string;
  description: string;
  price?: number;
  details: string[];
  imageUrl: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  priceLevel?: number;
};

const categoryQueries: Record<Category, string> = {
  venues: "wedding venue",
  catering: "wedding caterer",
  music: "wedding DJ or live band",
  flowers: "wedding florist",
  photography: "wedding photographer",
  attire: "bridal shop",
  invitations: "wedding invitations",
};

const formatPriceLevel = (priceLevel: number) => "$".repeat(Math.min(Math.max(priceLevel + 1, 1), 5));

const buildQuery = (category: Category, location: string, style?: string) => {
  const stylePrefix = style ? `${style} ` : "";
  return `${stylePrefix}${categoryQueries[category]} in ${location}`;
};

const buildFallbackImage = (seed: string) =>
  `${fallbackImageDomain}/seed/${encodeURIComponent(seed)}/400/300`;

const toMockOptions = (category: Category): VendorOption[] =>
  (mockData[category] || []).map((option) => ({
    id: option.id,
    name: option.name,
    description: option.description,
    price: option.price,
    details: option.details,
    imageUrl: option.imageUrl,
  }));

const toGoogleImageUrl = (photoReference: string) =>
  `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${encodeURIComponent(
    photoReference,
  )}&key=${encodeURIComponent(googlePlacesApiKey || "")}`;

const fetchGooglePlaces = async ({
  category,
  location,
  style,
  maxResults,
}: {
  category: Category;
  location: string;
  style?: string;
  maxResults: number;
}): Promise<VendorOption[] | null> => {
  if (!googlePlacesApiKey || !location) {
    return null;
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", buildQuery(category, location, style));
  url.searchParams.set("key", googlePlacesApiKey);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      console.warn("Google Places request failed:", response.status, response.statusText);
      return null;
    }

    const data = (await response.json()) as {
      status: string;
      results?: Array<{
        place_id: string;
        name: string;
        formatted_address?: string;
        rating?: number;
        user_ratings_total?: number;
        price_level?: number;
        photos?: Array<{ photo_reference: string }>;
      }>;
    };

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.warn("Google Places response status:", data.status);
      return null;
    }

    const results = data.results || [];

    return results.slice(0, maxResults).map((result) => {
      const address = result.formatted_address;
      const rating = result.rating;
      const reviewCount = result.user_ratings_total;
      const priceLevel = result.price_level;
      const photoReference = result.photos?.[0]?.photo_reference;

      const details: string[] = [];
      if (address) details.push(address);
      if (rating !== undefined) {
        const reviewLabel = reviewCount ? ` (${reviewCount} reviews)` : "";
        details.push(`Rating: ${rating.toFixed(1)}${reviewLabel}`);
      }
      if (priceLevel !== undefined) {
        details.push(`Price level: ${formatPriceLevel(priceLevel)}`);
      }

      return {
        id: result.place_id,
        name: result.name,
        description: address || "Popular local vendor",
        details,
        imageUrl: photoReference
          ? toGoogleImageUrl(photoReference)
          : buildFallbackImage(`${category}-${result.place_id}`),
        address,
        rating,
        reviewCount,
        priceLevel,
      };
    });
  } catch (error) {
    console.warn("Google Places request error:", error);
    return null;
  }
};

const categoryIntros: Record<string, string> = {
  venues:
    "Now for the most exciting part — choosing where your love story will unfold! " +
    "I've curated venues that match your style. Take your time browsing — the venue sets the tone for everything else.",
  catering:
    "With your venue locked in, let's talk about the food — because great food makes great memories! " +
    "Based on your venue choice, here are catering styles that would work beautifully.",
  music:
    "Time to set the soundtrack for your celebration! " +
    "Music creates the atmosphere — from the ceremony entrance to the last dance. Here are options that match your vibe.",
  flowers:
    "Now let's add some natural beauty! Flowers and decoration bring your theme to life. " +
    "I've picked arrangements that complement your venue and style perfectly.",
  photography:
    "These moments deserve to be captured forever! " +
    "Let's find the right photography style to tell your story. Each photographer brings a unique artistic eye.",
  attire:
    "Now for what you'll be wearing on the big day! " +
    "Your attire should make you feel absolutely incredible. Here are styles that match your wedding's aesthetic.",
  invitations:
    "Almost there! The invitation is your guests' first glimpse of the magic to come. " +
    "Let's pick a design that sets the perfect tone and gets everyone excited.",
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
              { topic: "date", ask: "When are you thinking for the big day?", react: "Comment on what makes that season special."},
              { topic: "location", ask: "Do you have a location or region in mind?", react: "Share something nice about the area if you can." },
              { topic: "guestCount", ask: "How many loved ones will be celebrating with you?", react: "React warmly — 'Intimate gatherings have such a special energy!' or 'A big celebration — I love it!'" },
              { topic: "budget", ask: "Let's talk budget — what range are you comfortable with?", react: "Be reassuring: 'We can create something magical at any budget.'" },
              { topic: "style", ask: "What's the overall vibe you're dreaming of?", react: "Offer examples if they're unsure: rustic, elegant, modern, bohemian, garden party." }, 
              { topic: "mustHaves", ask: "Any absolute must-haves or deal-breakers?", react: "Take note and acknowledge their priorities." },
            ],
            afterDiscovery:
              "Summarize what you've learned: 'So we're looking at a [style] wedding for [count] guests in [season], with a budget around $[amount]. I love this vision!' " +
              "Then say: 'Let's start bringing this to life! First up — finding your perfect venue.' " +
              "Then call browse-options with category='venues'.",
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
    "browse-options",
    {
      description: "Browse wedding options for a category",
      _meta: {
        ui: {
          csp: {
            resourceDomains: [
              "https://picsum.photos",
              "https://fastly.picsum.photos",
              "https://maps.googleapis.com",
            ],
          },
        },
      },
    },
    {
      description:
        "Show wedding options for a specific category. Only call this AFTER the start-planning tool has been called and the discovery conversation is complete. " +
        "Available categories: venues, catering, music, flowers, photography, attire, invitations. " +
        "Follow the category order. If the user provided a location, pass it to enable live vendor results. " +
        "After the user selects an option, acknowledge their choice with enthusiasm and a brief expert comment, then move to the next category. " +
        "If the user wants to change a previous choice, re-call this tool with that category.",
      inputSchema: {
        category: z
          .enum(["venues", "catering", "music", "flowers", "photography", "attire", "invitations"])
          .describe("The wedding planning category to browse"),
        location: z.string().optional().describe("City/region to search vendors in (used for live vendor lookup)"),
        style: z.string().optional().describe("The user's preferred wedding style (e.g. rustic, elegant, modern, bohemian)"),
        guestCount: z.number().optional().describe("Expected number of guests"),
        budget: z.number().optional().describe("Total wedding budget"),
        maxResults: z.number().min(1).max(8).optional().describe("Maximum number of vendors to return"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true, destructiveHint: false },
    },
    async ({ category, location, style, maxResults }) => {
      const fallbackOptions = toMockOptions(category);
      const liveOptions =
        location && googlePlacesApiKey
          ? await fetchGooglePlaces({
              category,
              location,
              style,
              maxResults: maxResults ?? 4,
            })
          : null;

      const options = liveOptions && liveOptions.length > 0 ? liveOptions : fallbackOptions;
      const dataSource = liveOptions && liveOptions.length > 0 ? "google-places" : "mock";

      if (!options || options.length === 0) {
        return {
          content: [{ type: "text" as const, text: `Unknown category: ${category}` }],
          isError: true,
        };
      }

      const categoryLabel = categoryLabels[category] || category;
      const categoryIndex = categoryOrder.indexOf(category as Category);
      const nextCategory = categoryIndex < categoryOrder.length - 1 ? categoryOrder[categoryIndex + 1] : null;
      const nextCategoryLabel = nextCategory ? categoryLabels[nextCategory] : null;
      const isPerPerson = category === "catering";
      const intro = categoryIntros[category] || "";

      const structuredContent = {
        category,
        categoryLabel,
        step: categoryIndex + 1,
        totalSteps: categoryOrder.length,
        nextCategory,
        nextCategoryLabel,
        isPerPerson,
        dataSource,
        llmIntro: intro,
        llmBehavior: [
          "Present the widget with a brief, warm introduction adapted from llmIntro.",
          "Do NOT list the options in text — the widget shows them visually.",
          "Keep your message short (2-3 sentences max). Let the widget do the heavy lifting.",
          "If the user asks about a specific option, provide helpful expert commentary.",
          "If dataSource is google-places, avoid asserting exact pricing since it may not be provided.",
        ],
        options: options.map(({ id, name, description, price, details, address, rating, reviewCount, priceLevel }) => ({
          id,
          name,
          description,
          price,
          details,
          address,
          rating,
          reviewCount,
          priceLevel,
        })),
      };

      const _meta = {
        images: options.map((o) => o.imageUrl),
      };

      return {
        structuredContent,
        content: [],
        _meta,
      };
    },
  )
  .registerWidget(
    "view-wedding-plan",
    {
      description: "View the complete wedding plan summary",
      _meta: {
        ui: {
          csp: {
            resourceDomains: ["https://picsum.photos", "https://fastly.picsum.photos"],
          },
        },
      },
    },
    {
      description:
        "Show the complete wedding plan with all selections and budget summary. " +
        "Call this after the user has made selections across categories, or when they ask to see their current plan. " +
        "Pass all selections made so far. After showing the plan, celebrate their choices and offer to make changes if anything doesn't feel right.",
      inputSchema: {
        selections: z
          .record(
            z.string(),
            z.object({
              id: z.string(),
              name: z.string(),
              price: z.number(),
            }),
          )
          .describe("Map of category to selected option (e.g. { venues: { id, name, price }, catering: { id, name, price } })"),
        guestCount: z.number().optional().describe("Number of guests, needed to calculate catering total"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    async ({ selections, guestCount }) => {
      const guests = guestCount || 100;
      let totalBudget = 0;

      const planItems = categoryOrder
        .filter((cat) => selections[cat])
        .map((cat) => {
          const sel = selections[cat];
          const isPerPerson = cat === "catering";
          const totalPrice = isPerPerson ? sel.price * guests : sel.price;
          totalBudget += totalPrice;

          const option = mockData[cat]?.find((o) => o.id === sel.id);

          return {
            category: cat,
            categoryLabel: categoryLabels[cat],
            name: sel.name,
            price: sel.price,
            totalPrice,
            isPerPerson,
            imageUrl: option?.imageUrl || "",
          };
        });

      const isComplete = planItems.length === categoryOrder.length;

      const structuredContent = {
        planItems,
        guestCount: guests,
        totalBudget,
        categoriesCompleted: planItems.length,
        totalCategories: categoryOrder.length,
        llmBehavior: isComplete
          ? [
              "Celebrate! Their wedding plan is coming together beautifully.",
              "Highlight how their choices complement each other (e.g. 'The rustic barn with wildflower arrangements — that's going to be absolutely stunning!').",
              "Offer to make changes to any category if something doesn't feel quite right.",
              "End with an encouraging, heartfelt note about their upcoming day.",
            ]
          : [
              `There are still ${categoryOrder.length - planItems.length} categories to choose.`,
              "Acknowledge their progress so far and offer to continue with the remaining categories.",
            ],
      };

      const _meta = {
        images: planItems.map((item) => item.imageUrl),
      };

      return {
        structuredContent,
        content: [],
        _meta,
      };
    },
  );

export default server;
export type AppType = typeof server;
