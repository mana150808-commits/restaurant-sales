"use client"

import { useState } from "react"
import {
  analyzeWeaknesses,
  getProposalTypes,
  matchCaseStudies,
  findCompetitors,
  type RestaurantForProposal,
} from "@/lib/proposal-helper"

type Props = {
  selectedRestaurants: RestaurantForProposal[]
  allRestaurants: RestaurantForProposal[]
}

export default function ProposalHelper({ selectedRestaurants, allRestaurants }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)

  if (selectedRestaurants.length === 0) return null

  const activeRestaurant = selectedRestaurants.find(r => r.id === activeId) ?? selectedRestaurants[0]
  const weaknesses = analyzeWeaknesses(activeRestaurant)
  const proposalTypes = getProposalTypes(activeRestaurant)
  const caseStudies = matchCaseStudies(activeRestaurant)
  const competitors = findCompetitors(activeRestaurant, allRestaurants)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">仮説立て支援</h2>

      {/* タブ */}
      <div className="flex flex-wrap gap-1 mb-4">
        {selectedRestaurants.map(r => (
          <button
            key={r.id}
            onClick={() => setActiveId(r.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition cursor-pointer ${
              (activeId === r.id || (!activeId && r.id === selectedRestaurants[0].id))
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* 弱み分析 */}
        <div className="bg-red-50 rounded-lg p-3">
          <h3 className="text-xs font-semibold text-red-700 mb-2">🔍 弱み分析</h3>
          {weaknesses.length === 0 ? (
            <p className="text-xs text-gray-400">明確な弱みは検出されませんでした</p>
          ) : (
            <ul className="space-y-1">
              {weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs">
                  <span className={w.level === "critical" ? "text-red-500" : "text-yellow-500"}>
                    {w.level === "critical" ? "❌" : "⚠️"}
                  </span>
                  <span className={w.level === "critical" ? "text-red-700" : "text-yellow-700"}>
                    {w.text}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 提案の切り口 */}
        <div className="bg-blue-50 rounded-lg p-3">
          <h3 className="text-xs font-semibold text-blue-700 mb-2">💡 提案の切り口</h3>
          {proposalTypes.length === 0 ? (
            <p className="text-xs text-gray-400">データ不足のため提案を生成できませんでした</p>
          ) : (
            <ul className="space-y-2">
              {proposalTypes.map((p, i) => (
                <li key={i} className="text-xs">
                  <div className="font-semibold text-blue-800">{p.icon} {p.label}</div>
                  <div className="text-blue-600 mt-0.5">{p.description}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 参考制作事例 */}
        <div className="bg-green-50 rounded-lg p-3">
          <h3 className="text-xs font-semibold text-green-700 mb-2">📋 参考制作事例</h3>
          {caseStudies.length === 0 ? (
            <p className="text-xs text-gray-400">マッチする事例が見つかりませんでした</p>
          ) : (
            <ul className="space-y-3">
              {caseStudies.map((cs, i) => (
                <li key={i} className="text-xs border-l-2 border-green-400 pl-2">
                  <div className="font-semibold text-green-800">{cs.title}</div>
                  <div className="text-green-600 mt-0.5">{cs.summary}</div>
                  <div className="flex gap-3 mt-1 text-green-700">
                    <span>📈 {cs.result}</span>
                    <span>💰 {cs.budget}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 競合店（同エリアでサイトが充実している店） */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">🏪 同エリアの競合（サイトあり・2km以内）</h3>
          {competitors.length === 0 ? (
            <p className="text-xs text-gray-400">近くに競合店が見つかりませんでした</p>
          ) : (
            <ul className="space-y-2">
              {competitors.map((c, i) => (
                <li key={i} className="text-xs">
                  <div className="font-medium text-gray-800">{c.name}</div>
                  <div className="text-gray-500 truncate">{c.address || ""}</div>
                  {c.website && (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline truncate block max-w-full"
                    >
                      {c.website.replace(/^https?:\/\//, "").substring(0, 40)}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  )
}
