import { mockData, type WeddingOption } from "../data.js";

export async function searchVenues(query: string): Promise<WeddingOption[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_PLACES_API_KEY not set, falling back to mock venues");
    return mockData.venues;
  }

  try {
    console.log("[searchVenues] Querying Google Places:", query);
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

    console.log("[searchVenues] Response status:", response.status);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[searchVenues] API error:", response.status, errorBody);
      return mockData.venues;
    }

    const data = await response.json();
    console.log("[searchVenues] Results count:", data.places?.length ?? 0);
    if (!data.places?.length) return mockData.venues;

    return data.places.map((place: any, i: number) => {
      const photoUrl = place.photos?.[0]
        ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxHeightPx=300&maxWidthPx=400&key=${apiKey}`
        : `https://picsum.photos/seed/venue-${i}/400/300`;

      const details: string[] = [];
      if (place.rating) details.push(`${place.rating}★ rating`);
      if (place.userRatingCount) details.push(`${place.userRatingCount} reviews`);
      if (place.formattedAddress) details.push(place.formattedAddress);

      return {
        id: `venue-${place.id}`,
        name: place.displayName?.text ?? `Venue ${i + 1}`,
        description: place.editorialSummary?.text ?? place.formattedAddress ?? "Wedding venue",
        price: 0,
        imageUrl: photoUrl,
        details,
        ...(place.location && { coords: [place.location.longitude, place.location.latitude] as [number, number] }),
        ...(place.websiteUri && { url: place.websiteUri }),
      };
    });
  } catch (error) {
    console.error("Failed to fetch venues from Google Places:", error);
    return mockData.venues;
  }
}
