"use client"

import { useState } from "react"
import type { Restaurant } from "../page"

type Props = {
  restaurants: Restaurant[]
  onStatusUpdate: (id: string, salesStatus: string, memo?: string) => void
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
}

const SITE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  none: { label: "サイトなし", color: "bg-red-100 text-red-700" },
  weak: { label: "弱いサイト", color: "bg-orange-100 text-orange-700" },
  fair: { label: "改善余地あり", color: "bg-yellow-100 text-yellow-700" },
  good: { label: "充実", color: "bg-green-100 text-green-700" },
  unknown: { label: "未チェック", color: "bg-gray-100 text-gray-500" },
}

const SALES_STATUS_OPTIONS = [
  { value: "new", label: "未アプローチ" },
  { value: "approached", label: "連絡済み" },
  { value: "negotiating", label: "商談中" },
  { value: "contracted", label: "成約" },
  { value: "dismissed", label: "見送り" },
]

const SALES_STATUS_COLORS: Record<string, string> = {
  new: "bg-gray-100 text-gray-600",
  approached: "bg-blue-100 text-blue-700",
  negotiating: "bg-purple-100 text-purple-700",
  contracted: "bg-green-100 text-green-700",
  dismissed: "bg-gray-200 text-gray-400",
}

export default function RestaurantTable({ restaurants, onStatusUpdate, selectedIds, onToggleSelect }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [memoText, setMemoText] = useState("")

  const handleMemoEdit = (r: Restaurant) => {
    setEditingId(r.id)
    setMemoText(r.memo || "")
  }

  const handleMemoSave = (id: string, currentStatus: string) => {
    onStatusUpdate(id, currentStatus, memoText)
    setEditingId(null)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
            <th className="pb-2 pr-3 font-medium w-8">
              <span className="text-gray-400 text-xs">最大5件</span>
            </th>
            <th className="pb-2 pr-3 font-medium">店名</th>
            <th className="pb-2 pr-3 font-medium">住所</th>
            <th className="pb-2 pr-3 font-medium">電話</th>
            <th className="pb-2 pr-3 font-medium">サイト状態</th>
            <th className="pb-2 pr-3 font-medium">スコア</th>
            <th className="pb-2 pr-3 font-medium">特徴</th>
            <th className="pb-2 pr-3 font-medium">評価</th>
            <th className="pb-2 pr-3 font-medium">周辺施設</th>
            <th className="pb-2 pr-3 font-medium">営業ステータス</th>
            <th className="pb-2 font-medium">メモ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {restaurants.map((r) => (
            <tr key={r.id} className={`hover:bg-gray-50 transition ${selectedIds.has(r.id) ? "bg-blue-50" : ""}`}>
              <td className="py-2 pr-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(r.id)}
                  onChange={() => onToggleSelect(r.id)}
                  disabled={!selectedIds.has(r.id) && selectedIds.size >= 5}
                  className="w-4 h-4 cursor-pointer accent-blue-600 disabled:cursor-not-allowed"
                />
              </td>
              <td className="py-2 pr-3">
                <div className="font-medium text-gray-900">{r.name}</div>
                {r.website ? (
                  <a
                    href={r.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline truncate max-w-36 block"
                  >
                    {r.website.replace(/^https?:\/\//, "").substring(0, 30)}
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">サイトなし</span>
                )}
              </td>
              <td className="py-2 pr-3 text-xs text-gray-600 max-w-40">
                {r.address || "-"}
              </td>
              <td className="py-2 pr-3 text-xs text-gray-600 whitespace-nowrap">
                {r.phone || "-"}
              </td>
              <td className="py-2 pr-3">
                <span
                  className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                    SITE_STATUS_LABELS[r.siteStatus]?.color || "bg-gray-100 text-gray-500"
                  }`}
                >
                  {SITE_STATUS_LABELS[r.siteStatus]?.label || r.siteStatus}
                </span>
              </td>
              <td className="py-2 pr-3 text-center">
                {r.siteScore !== null ? (
                  <span className="text-xs font-mono">{r.siteScore}</span>
                ) : (
                  <span className="text-xs text-gray-300">-</span>
                )}
              </td>
              <td className="py-2 pr-3">
                <div className="flex flex-wrap gap-1">
                  {r.hasMobileSupport && (
                    <span title="モバイル対応" className="text-xs bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">SP</span>
                  )}
                  {r.hasContactForm && (
                    <span title="問い合わせフォーム" className="text-xs bg-green-50 text-green-500 px-1.5 py-0.5 rounded">問</span>
                  )}
                  {r.hasReservation && (
                    <span title="予約機能" className="text-xs bg-purple-50 text-purple-500 px-1.5 py-0.5 rounded">予</span>
                  )}
                  {r.hasInstagram && (
                    <span title="Instagram運用中" className="text-xs bg-pink-50 text-pink-500 px-1.5 py-0.5 rounded">📸</span>
                  )}
                  {r.hasSNS && !r.hasInstagram && (
                    <span title="SNSあり" className="text-xs bg-sky-50 text-sky-500 px-1.5 py-0.5 rounded">SNS</span>
                  )}
                  {r.hasMultipleLocations && (
                    <span title="複数店舗展開" className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">多店舗</span>
                  )}
                  {r.priceLevel === "PRICE_LEVEL_EXPENSIVE" && (
                    <span title="高価格帯" className="text-xs bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded">¥¥¥</span>
                  )}
                  {r.priceLevel === "PRICE_LEVEL_VERY_EXPENSIVE" && (
                    <span title="最高価格帯" className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">¥¥¥¥</span>
                  )}
                </div>
              </td>
              <td className="py-2 pr-3 text-xs text-gray-600">
                {r.rating ? `★ ${r.rating}` : "-"}
              </td>
              <td className="py-2 pr-3">
                {(() => {
                  const places = JSON.parse(r.nearbyPlaces || "[]") as { name: string; label: string; type: string }[]
                  if (places.length === 0) return <span className="text-xs text-gray-300">-</span>
                  const ICONS: Record<string, string> = {
                    university: "🎓", shopping_mall: "🏬", department_store: "🏬",
                    train_station: "🚉", tourist_attraction: "🏛", stadium: "🏟",
                    amusement_park: "🎡", hospital: "🏥", office_building: "🏢", park: "🌳",
                  }
                  return (
                    <div className="flex flex-col gap-0.5">
                      {places.slice(0, 3).map((p, i) => (
                        <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded whitespace-nowrap" title={p.name}>
                          {ICONS[p.type] || "📍"} {p.label}
                        </span>
                      ))}
                      {places.length > 3 && (
                        <span className="text-xs text-gray-400">他{places.length - 3}件</span>
                      )}
                    </div>
                  )
                })()}
              </td>
              <td className="py-2 pr-3">
                <select
                  value={r.salesStatus}
                  onChange={(e) => onStatusUpdate(r.id, e.target.value, r.memo || undefined)}
                  className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    SALES_STATUS_COLORS[r.salesStatus] || "bg-gray-100"
                  }`}
                >
                  {SALES_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </td>
              <td className="py-2">
                {editingId === r.id ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={memoText}
                      onChange={(e) => setMemoText(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-0.5 text-xs w-32 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleMemoSave(r.id, r.salesStatus)
                        if (e.key === "Escape") setEditingId(null)
                      }}
                    />
                    <button
                      onClick={() => handleMemoSave(r.id, r.salesStatus)}
                      className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      保存
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleMemoEdit(r)}
                    className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer text-left max-w-32 truncate block"
                  >
                    {r.memo || <span className="text-gray-300">メモ追加...</span>}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
