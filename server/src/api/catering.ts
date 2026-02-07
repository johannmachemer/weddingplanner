import { mockData, type WeddingOption } from "../data.js";

export async function searchCatering(location: string, style?: string): Promise<WeddingOption[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_PLACES_API_KEY not set, falling back to mock catering");
    return mockData.catering;
  }

  const query = style
    ? `${style} wedding catering in ${location}`
    : `wedding catering service in ${location}`;

  try {
    console.log("[searchCatering] Querying Google Places:", query);
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.editorialSummary,places.photos,places.rating,places.userRatingCount,places.websiteUri",
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 6 }),
    });

    console.log("[searchCatering] Response status:", response.status);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[searchCatering] API error:", response.status, errorBody);
      return mockData.catering;
    }

    const data = await response.json();
    console.log("[searchCatering] Results count:", data.places?.length ?? 0);
    if (!data.places?.length) return mockData.catering;

    return data.places.map((place: any, i: number) => {
      const photoUrl = place.photos?.[0]
        ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=300&maxWidthPx=400&key=${apiKey}`
        : `https://picsum.photos/seed/catering-${i}/400/300`;

      const details: string[] = [];
      if (place.rating) details.push(`${place.rating}★ rating`);
      if (place.userRatingCount) details.push(`${place.userRatingCount} reviews`);
      if (place.formattedAddress) details.push(place.formattedAddress);

      return {
        id: `catering-${place.id}`,
        name: place.displayName?.text ?? `Caterer ${i + 1}`,
        description: place.editorialSummary?.text ?? place.formattedAddress ?? "Wedding catering service",
        price: 0,
        imageUrl: photoUrl,
        details,
      };
    });
  } catch (error) {
    console.error("Failed to fetch catering from Google Places:", error);
    return mockData.catering;
  }
}
