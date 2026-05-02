const NEARBY_SEARCH_URL = "https://places.googleapis.com/v1/places:searchNearby"

const PLACE_TYPE_LABELS: Record<string, string> = {
  university: "大学",
  shopping_mall: "ショッピングモール",
  department_store: "デパート",
  train_station: "駅",
  tourist_attraction: "観光地",
  stadium: "競技場・スタジアム",
  amusement_park: "テーマパーク",
  hospital: "病院",
  office_building: "オフィスビル",
  park: "大型公園",
}

const TARGET_TYPES = Object.keys(PLACE_TYPE_LABELS)

export type NearbyPlace = {
  name: string
  type: string
  label: string
}

export async function checkNearbyPlaces(
  lat: number,
  lng: number,
  apiKey: string,
  radiusMeters = 1000
): Promise<NearbyPlace[]> {
  try {
    const res = await fetch(NEARBY_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.displayName,places.types",
      },
      body: JSON.stringify({
        includedTypes: TARGET_TYPES,
        maxResultCount: 10,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radiusMeters,
          },
        },
      }),
    })

    if (!res.ok) return []

    const data = await res.json()
    const places = data.places || []

    return places.map((place: Record<string, unknown>) => {
      const types = (place.types as string[]) || []
      const matchedType = types.find(t => TARGET_TYPES.includes(t)) || types[0] || "unknown"
      return {
        name: (place.displayName as { text?: string })?.text || "不明",
        type: matchedType,
        label: PLACE_TYPE_LABELS[matchedType] || matchedType,
      }
    })
  } catch {
    return []
  }
}
