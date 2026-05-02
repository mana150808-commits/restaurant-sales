"use client"

import { useState } from "react"
import {
  optimizeRoute,
  buildSchedule,
  findNearbyCandidates,
  type TravelMode,
  type RouteRestaurant,
  type ScheduleItem,
} from "@/lib/route-optimizer"

type Props = {
  selectedRestaurants: RouteRestaurant[]
  allRestaurants: RouteRestaurant[]
  selectedIds: Set<string>
}

const MODE_LABELS: Record<TravelMode, string> = {
  walk: "🚶 徒歩",
  bicycle: "🚲 自転車",
  car: "🚗 車",
}

const SITE_STATUS_LABELS: Record<string, string> = {
  none: "サイトなし",
  weak: "弱いサイト",
  fair: "改善余地あり",
  good: "充実",
}

export default function RouteOptimizer({ selectedRestaurants, allRestaurants, selectedIds }: Props) {
  const [mode, setMode] = useState<TravelMode>("walk")
  const [departureTime, setDepartureTime] = useState("09:00")
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [candidates, setCandidates] = useState<RouteRestaurant[]>([])
  const [optimized, setOptimized] = useState(false)

  const handleOptimize = () => {
    const route = optimizeRoute(selectedRestaurants)
    const newSchedule = buildSchedule(route, departureTime, mode)
    const newCandidates = findNearbyCandidates(route, allRestaurants, selectedIds)
    setSchedule(newSchedule)
    setCandidates(newCandidates)
    setOptimized(true)
  }

  const totalDistanceKm = schedule.reduce((sum, item) => sum + item.distanceKm, 0)
  const lastItem = schedule[schedule.length - 1]
  const totalMinutes = lastItem
    ? (() => {
        const [dh, dm] = departureTime.split(":").map(Number)
        const [ah, am] = lastItem.departureTime.split(":").map(Number)
        return (ah * 60 + am) - (dh * 60 + dm)
      })()
    : 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">ルート最適化</h2>

      {selectedRestaurants.length === 0 ? (
        <p className="text-sm text-gray-400">チェックボックスで店舗を選択してください（最大5件）</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <span className="text-sm text-gray-600">{selectedRestaurants.length}件選択中</span>

            <div className="flex gap-1">
              {(["walk", "bicycle", "car"] as TravelMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                    mode === m
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {MODE_LABELS[m]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">出発</span>
              <input
                type="time"
                value={departureTime}
                onChange={e => setDepartureTime(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <button
              onClick={handleOptimize}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              最短ルートを計算
            </button>
          </div>

          {optimized && schedule.length > 0 && (
            <>
              <div className="space-y-2 mb-4">
                {schedule.map((item, i) => (
                  <div key={item.restaurant.id}>
                    {i > 0 && (
                      <div className="flex items-center gap-1 ml-4 my-1 text-xs text-gray-400">
                        <span>↓</span>
                        <span>{MODE_LABELS[mode].split(" ")[1]}</span>
                        <span>{item.travelMinutes}分</span>
                        <span>({item.distanceKm.toFixed(1)}km)</span>
                      </div>
                    )}
                    <div className={`flex items-start gap-2 p-2 rounded-lg ${
                      item.warning === "idle_time" ? "bg-orange-50 border border-orange-200" :
                      item.warning === "outside_hours" ? "bg-yellow-50 border border-yellow-200" :
                      "bg-gray-50"
                    }`}>
                      <span className="text-sm font-bold text-blue-600 w-5 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-900">{item.restaurant.name}</span>
                          <span className="text-xs text-gray-500">{item.arrivalTime}到着</span>
                          {item.warning === "idle_time" && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                              ⚠️ アイドルタイム後に訪問
                            </span>
                          )}
                          {item.warning === "outside_hours" && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                              ⚠️ ランチ営業なし・夕方以降推奨
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 truncate">{item.restaurant.address || ""}</div>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">〜{item.departureTime}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700 flex gap-4 flex-wrap mb-4">
                <span>合計 {schedule.length}件</span>
                <span>総移動距離 {totalDistanceKm.toFixed(1)}km</span>
                <span>所要時間 {Math.floor(totalMinutes / 60)}時間{totalMinutes % 60}分</span>
              </div>

              {candidates.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-600 mb-2">📍 ルート近くの追加候補（1km以内・スコアが低い店舗）</h3>
                  <div className="space-y-1">
                    {candidates.map(r => (
                      <div key={r.id} className="flex items-center gap-2 text-xs text-gray-600 bg-indigo-50 px-2 py-1.5 rounded">
                        <span className="font-medium text-gray-800">{r.name}</span>
                        <span className="text-gray-400">{r.address?.substring(0, 20) || ""}</span>
                        <span className={`ml-auto px-1.5 py-0.5 rounded ${
                          r.siteStatus === "none" ? "bg-red-100 text-red-600" :
                          r.siteStatus === "weak" ? "bg-orange-100 text-orange-600" :
                          "bg-yellow-100 text-yellow-600"
                        }`}>
                          {SITE_STATUS_LABELS[r.siteStatus] || r.siteStatus}
                        </span>
                        <span className="text-gray-400">スコア:{r.siteScore ?? "-"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
