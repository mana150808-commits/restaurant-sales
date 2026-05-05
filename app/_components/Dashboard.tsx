"use client"

import { useState } from "react"
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts"
import type { Restaurant } from "../page"

type Props = {
  restaurants: Restaurant[]
}

const SALES_STATUS_LABELS: Record<string, string> = {
  new: "未アプローチ",
  approached: "連絡済み",
  negotiating: "商談中",
  contracted: "成約",
  dismissed: "見送り",
}

const SALES_STATUS_COLORS: Record<string, string> = {
  new: "#94A3B8",
  approached: "#3B82F6",
  negotiating: "#8B5CF6",
  contracted: "#16A34A",
  dismissed: "#D1D5DB",
}

const SITE_STATUS_LABELS: Record<string, string> = {
  none: "サイトなし",
  weak: "弱いサイト",
  fair: "改善余地あり",
  good: "充実",
}

const SITE_STATUS_COLORS: Record<string, string> = {
  none: "#EF4444",
  weak: "#F97316",
  fair: "#EAB308",
  good: "#22C55E",
}

export default function Dashboard({ restaurants }: Props) {
  const [open, setOpen] = useState(false)

  if (restaurants.length === 0) return null

  // 営業ステータス集計
  const salesData = Object.entries(SALES_STATUS_LABELS).map(([key, label]) => ({
    name: label,
    value: restaurants.filter(r => r.salesStatus === key).length,
    color: SALES_STATUS_COLORS[key],
    key,
  })).filter(d => d.value > 0 && d.key !== "new")

  // サイト状態集計
  const siteData = Object.entries(SITE_STATUS_LABELS).map(([key, label]) => ({
    name: label,
    件数: restaurants.filter(r => r.siteStatus === key).length,
    color: SITE_STATUS_COLORS[key],
  })).filter(d => d.件数 > 0)

  // スコア分布（0-200を20点刻み）
  const scoreRanges = [
    "0-40", "41-80", "81-120", "121-160", "161-200"
  ]
  const scoreData = scoreRanges.map(range => {
    const [min, max] = range.split("-").map(Number)
    return {
      name: range,
      件数: restaurants.filter(r => {
        const s = r.siteScore ?? 0
        return s >= min && s <= max
      }).length,
    }
  })

  // サマリー数値
  const contracted = restaurants.filter(r => r.salesStatus === "contracted").length
  const negotiating = restaurants.filter(r => r.salesStatus === "negotiating").length
  const approached = restaurants.filter(r => r.salesStatus === "approached").length
  const highPriority = restaurants.filter(r =>
    (r.siteStatus === "none" || r.siteStatus === "weak") && r.salesStatus === "new"
  ).length

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
      >
        <span>📊 営業進捗ダッシュボード</span>
        <span className="text-gray-400 text-xs">{open ? "▲ 閉じる" : "▼ 開く"}</span>
      </button>

      {open && (
        <div className="p-4 border-t border-gray-100">

          {/* サマリーカード */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "総件数", value: restaurants.length, color: "bg-blue-50 text-blue-700 border-blue-200" },
              { label: "商談中", value: `${negotiating}件`, color: "bg-purple-50 text-purple-700 border-purple-200" },
              { label: "成約", value: `${contracted}件`, color: "bg-green-50 text-green-700 border-green-200" },
            ].map((card, i) => (
              <div key={i} className={`rounded-lg border p-3 ${card.color}`}>
                <div className="text-xs mb-1">{card.label}</div>
                <div className="text-2xl font-bold">{card.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 営業ステータス円グラフ */}
            <div>
              <h3 className="text-xs font-semibold text-gray-600 mb-2">営業ステータス分布</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={salesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}`}
                    labelLine={false}
                  >
                    {salesData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}件`]} />
                </PieChart>
              </ResponsiveContainer>
              {/* 凡例 */}
              <div className="flex flex-wrap gap-2 justify-center mt-1">
                {salesData.map((d, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color }} />
                    {d.name}({d.value})
                  </span>
                ))}
              </div>
            </div>

            {/* サイト状態棒グラフ */}
            <div>
              <h3 className="text-xs font-semibold text-gray-600 mb-2">サイト状態分布</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={siteData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => [`${v}件`]} />
                  <Bar dataKey="件数" radius={[4, 4, 0, 0]}>
                    {siteData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* スコア分布棒グラフ */}
            <div>
              <h3 className="text-xs font-semibold text-gray-600 mb-2">スコア分布（200点満点）</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={scoreData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => [`${v}件`]} />
                  <Bar dataKey="件数" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>


        </div>
      )}
    </div>
  )
}
