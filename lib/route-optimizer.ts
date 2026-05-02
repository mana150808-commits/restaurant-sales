export type TravelMode = "walk" | "bicycle" | "car"

export type RouteRestaurant = {
  id: string
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  siteScore: number | null
  siteStatus: string
  hasLunch: boolean | null
}

export type ScheduleItem = {
  restaurant: RouteRestaurant
  arrivalTime: string
  departureTime: string
  travelMinutes: number
  distanceKm: number
  warning?: "idle_time" | "outside_hours"
}

const SPEED_KMH: Record<TravelMode, number> = {
  walk: 5,
  bicycle: 15,
  car: 30,
}

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function travelMinutes(distKm: number, mode: TravelMode): number {
  return Math.ceil((distKm / SPEED_KMH[mode]) * 60)
}

function totalRouteDistance(route: RouteRestaurant[]): number {
  let total = 0
  for (let i = 0; i < route.length - 1; i++) {
    const a = route[i]
    const b = route[i + 1]
    if (a.latitude && a.longitude && b.latitude && b.longitude) {
      total += haversineDistance(a.latitude, a.longitude, b.latitude, b.longitude)
    }
  }
  return total
}

function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr]
  return arr.flatMap((item, i) =>
    permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map(p => [item, ...p])
  )
}

export function optimizeRoute(restaurants: RouteRestaurant[]): RouteRestaurant[] {
  const withLocation = restaurants.filter(r => r.latitude && r.longitude)
  const withoutLocation = restaurants.filter(r => !r.latitude || !r.longitude)

  if (withLocation.length <= 1) return restaurants

  const perms = permutations(withLocation)
  let best = perms[0]
  let bestDist = totalRouteDistance(perms[0])

  for (const perm of perms) {
    const dist = totalRouteDistance(perm)
    if (dist < bestDist) {
      bestDist = dist
      best = perm
    }
  }

  return [...best, ...withoutLocation]
}

function minsToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
}

export function buildSchedule(
  route: RouteRestaurant[],
  departureTimeStr: string,
  mode: TravelMode,
  visitDuration = 15
): ScheduleItem[] {
  const [h, m] = departureTimeStr.split(":").map(Number)
  let currentMinutes = h * 60 + (m || 0)

  const IDLE_START = 14 * 60
  const IDLE_END = 17 * 60

  return route.map((r, i) => {
    let travelMins = 0
    let distKm = 0

    if (i > 0) {
      const prev = route[i - 1]
      if (prev.latitude && prev.longitude && r.latitude && r.longitude) {
        distKm = haversineDistance(prev.latitude, prev.longitude, r.latitude, r.longitude)
        travelMins = travelMinutes(distKm, mode)
      }
    }

    let arrivalMins = currentMinutes + travelMins
    let warning: ScheduleItem["warning"] = undefined

    if (arrivalMins >= IDLE_START && arrivalMins < IDLE_END) {
      arrivalMins = IDLE_END
      warning = "idle_time"
    }

    if (!r.hasLunch && arrivalMins < IDLE_END && !warning) {
      warning = "outside_hours"
    }

    const departureMins = arrivalMins + visitDuration
    currentMinutes = departureMins

    return {
      restaurant: r,
      arrivalTime: minsToTime(arrivalMins),
      departureTime: minsToTime(departureMins),
      travelMinutes: travelMins,
      distanceKm: Math.round(distKm * 100) / 100,
      warning,
    }
  })
}

export function findNearbyCandidates(
  route: RouteRestaurant[],
  allRestaurants: RouteRestaurant[],
  selectedIds: Set<string>,
  thresholdKm = 1.0
): RouteRestaurant[] {
  return allRestaurants
    .filter(r => !selectedIds.has(r.id) && r.latitude && r.longitude)
    .filter(r =>
      route.some(
        stop =>
          stop.latitude &&
          stop.longitude &&
          haversineDistance(stop.latitude, stop.longitude, r.latitude!, r.longitude!) <= thresholdKm
      )
    )
    .sort((a, b) => (a.siteScore ?? 999) - (b.siteScore ?? 999))
    .slice(0, 5)
}
