export interface WeddingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  details: string[];
  coords?: [number, number]; // [longitude, latitude]
  url?: string; // place website
}

export const mockData: Record<string, WeddingOption[]> = {
  venues: [
    {
      id: "venue-1",
      name: "Château de Fleurs",
      description: "Elegant French château with manicured gardens and a grand ballroom.",
      price: 8500,
      imageUrl: "https://picsum.photos/seed/chateau-wedding/400/300",
      details: ["Capacity: 150 guests", "Indoor & outdoor spaces", "On-site catering kitchen", "Free parking"],
    },
    {
      id: "venue-2",
      name: "The Rustic Barn",
      description: "Charming converted barn surrounded by rolling countryside.",
      price: 4200,
      imageUrl: "https://picsum.photos/seed/barn-wedding/400/300",
      details: ["Capacity: 120 guests", "Outdoor ceremony area", "Vintage decor included", "Pet friendly"],
    },
    {
      id: "venue-3",
      name: "Skyline Terrace",
      description: "Modern rooftop venue with panoramic city views.",
      price: 6800,
      imageUrl: "https://picsum.photos/seed/rooftop-venue/400/300",
      details: ["Capacity: 100 guests", "360° city views", "Built-in sound system", "Valet parking"],
    },
    {
      id: "venue-4",
      name: "Seaside Garden",
      description: "Beachfront garden with ocean views and a sunset ceremony spot.",
      price: 7200,
      imageUrl: "https://picsum.photos/seed/beach-wedding/400/300",
      details: ["Capacity: 80 guests", "Beach ceremony", "Tiki bar available", "Accommodation nearby"],
    },
  ],
  catering: [
    {
      id: "catering-1",
      name: "Fine Dining Experience",
      description: "Elegant multi-course sit-down dinner with wine pairing.",
      price: 120,
      imageUrl: "https://picsum.photos/seed/fine-dining/400/300",
      details: ["5-course meal", "Wine pairing included", "Dietary accommodations", "Price per person"],
    },
    {
      id: "catering-2",
      name: "Rustic Feast Buffet",
      description: "Farm-to-table buffet with seasonal local ingredients.",
      price: 75,
      imageUrl: "https://picsum.photos/seed/buffet-food/400/300",
      details: ["Unlimited buffet", "Local sourcing", "Live cooking stations", "Price per person"],
    },
    {
      id: "catering-3",
      name: "Food Truck Festival",
      description: "Curated selection of gourmet food trucks for a casual vibe.",
      price: 55,
      imageUrl: "https://picsum.photos/seed/food-truck/400/300",
      details: ["3 food trucks", "Diverse cuisines", "Interactive & fun", "Price per person"],
    },
    {
      id: "catering-4",
      name: "Mediterranean Mezze",
      description: "Family-style Mediterranean sharing platters with fresh flavors.",
      price: 85,
      imageUrl: "https://picsum.photos/seed/mediterranean-food/400/300",
      details: ["Sharing platters", "Mediterranean cuisine", "Vegetarian friendly", "Price per person"],
    },
  ],
  music: [
    {
      id: "music-1",
      name: "Live Jazz Band",
      description: "Sophisticated 5-piece jazz ensemble for an elegant atmosphere.",
      price: 3500,
      imageUrl: "https://picsum.photos/seed/jazz-band/400/300",
      details: ["5-piece band", "4 hours performance", "Cocktail & dinner sets", "Song requests welcome"],
    },
    {
      id: "music-2",
      name: "DJ & Light Show",
      description: "Professional DJ with full sound system and dance floor lighting.",
      price: 2000,
      imageUrl: "https://picsum.photos/seed/dj-party/400/300",
      details: ["Professional DJ", "LED light show", "6 hours", "Custom playlist"],
    },
    {
      id: "music-3",
      name: "String Quartet",
      description: "Classical string quartet for a timeless, romantic feel.",
      price: 2800,
      imageUrl: "https://picsum.photos/seed/string-quartet/400/300",
      details: ["4 musicians", "3 hours performance", "Ceremony & reception", "Classical & modern"],
    },
    {
      id: "music-4",
      name: "Acoustic Duo",
      description: "Intimate acoustic guitar and vocals for a warm, personal touch.",
      price: 1500,
      imageUrl: "https://picsum.photos/seed/acoustic-guitar/400/300",
      details: ["Guitar & vocals", "4 hours", "Indoor/outdoor", "Custom song learning"],
    },
  ],
  flowers: [
    {
      id: "flowers-1",
      name: "Romantic Garden",
      description: "Lush roses, peonies, and greenery for a classic romantic look.",
      price: 3200,
      imageUrl: "https://picsum.photos/seed/roses-bouquet/400/300",
      details: ["Bridal bouquet", "6 table centerpieces", "Ceremony arch flowers", "Boutonnières included"],
    },
    {
      id: "flowers-2",
      name: "Wildflower Meadow",
      description: "Rustic wildflower arrangements with a natural, effortless feel.",
      price: 1800,
      imageUrl: "https://picsum.photos/seed/wildflowers/400/300",
      details: ["Bridal bouquet", "Mason jar centerpieces", "Loose petal aisle", "Seasonal flowers"],
    },
    {
      id: "flowers-3",
      name: "Modern Minimalist",
      description: "Clean lines with white orchids, calla lilies, and geometric vases.",
      price: 2500,
      imageUrl: "https://picsum.photos/seed/white-orchid/400/300",
      details: ["Bridal bouquet", "Geometric centerpieces", "Aisle markers", "Minimalist palette"],
    },
    {
      id: "flowers-4",
      name: "Tropical Paradise",
      description: "Bold tropical blooms with exotic foliage for a vibrant celebration.",
      price: 2800,
      imageUrl: "https://picsum.photos/seed/tropical-flowers/400/300",
      details: ["Bridal bouquet", "Tropical centerpieces", "Statement ceremony arch", "Colorful palette"],
    },
  ],
  photography: [
    {
      id: "photo-1",
      name: "Documentary Style",
      description: "Candid, natural moments captured as they unfold.",
      price: 3500,
      imageUrl: "https://picsum.photos/seed/candid-wedding/400/300",
      details: ["8 hours coverage", "500+ edited photos", "Online gallery", "Engagement shoot included"],
    },
    {
      id: "photo-2",
      name: "Classic Portrait",
      description: "Timeless posed portraits with beautiful lighting and composition.",
      price: 2800,
      imageUrl: "https://picsum.photos/seed/portrait-photo/400/300",
      details: ["6 hours coverage", "300+ edited photos", "Printed album", "Family portraits"],
    },
    {
      id: "photo-3",
      name: "Artistic & Editorial",
      description: "Magazine-quality editorial shots with creative direction.",
      price: 4500,
      imageUrl: "https://picsum.photos/seed/editorial-photo/400/300",
      details: ["10 hours coverage", "700+ edited photos", "Second photographer", "Drone shots included"],
    },
    {
      id: "photo-4",
      name: "Photo & Video Bundle",
      description: "Complete coverage with both photography and cinematic videography.",
      price: 5500,
      imageUrl: "https://picsum.photos/seed/photo-video/400/300",
      details: ["Full day coverage", "Photos + highlight reel", "2 photographers + videographer", "4K video"],
    },
  ],
};

export const categoryOrder = [
  "venues",
  "catering",
  "music",
  "flowers",
  "photography",
] as const;

export const categoryLabels: Record<string, string> = {
  venues: "Venues",
  catering: "Catering & Food",
  music: "Music & Entertainment",
  flowers: "Flowers & Decoration",
  photography: "Photography",
};

export type Category = (typeof categoryOrder)[number];
