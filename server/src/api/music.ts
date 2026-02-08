import { mockData, type WeddingOption } from "../data.js";

export async function searchMusic(query: string): Promise<WeddingOption[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_PLACES_API_KEY not set, falling back to mock music");
    return mockData.music;
  }

  try {
    console.log("[searchMusic] Querying Google Places:", query);
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.editorialSummary,places.photos,places.rating,places.userRatingCount,places.websiteUri,places.location",
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 4 }),
    });

    console.log("[searchMusic] Response status:", response.status);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[searchMusic] API error:", response.status, errorBody);
      return mockData.music;
    }

    const data = await response.json();
    console.log("[searchMusic] Results count:", data.places?.length ?? 0);
    if (!data.places?.length) return mockData.music;

    return data.places.map((place: any, i: number) => {
      const photoUrl = place.photos?.[0]
        ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=300&maxWidthPx=400&key=${apiKey}`
        : `https://picsum.photos/seed/music-${i}/400/300`;

      const details: string[] = [];
      if (place.rating) details.push(`${place.rating}★ rating`);
      if (place.userRatingCount) details.push(`${place.userRatingCount} reviews`);
      if (place.formattedAddress) details.push(place.formattedAddress);

      return {
        id: `music-${place.id}`,
        name: place.displayName?.text ?? `Music ${i + 1}`,
        description: place.editorialSummary?.text ?? place.formattedAddress ?? "Wedding music & entertainment",
        price: 0,
        imageUrl: photoUrl,
        details,
        ...(place.location && { coords: [place.location.longitude, place.location.latitude] as [number, number] }),
      };
    });
  } catch (error) {
    console.error("Failed to fetch music from Google Places:", error);
    return mockData.music;
  }
}
