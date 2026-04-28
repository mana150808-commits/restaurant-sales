"use client"

import { useState } from "react"

type Props = {
  onSearch: (area: string, keyword: string) => void
  loading: boolean
}

export default function SearchForm({ onSearch, loading }: Props) {
  const [area, setArea] = useState("")
  const [keyword, setKeyword] = useState("レストラン")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!area.trim()) return
    onSearch(area.trim(), keyword.trim() || "レストラン")
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">レストラン自動収集</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
        <input
          type="text"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="エリア（例: 渋谷区、長崎市)"
          className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="キーワード（例: 居酒屋、寿司）"
          className="flex-1 min-w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
        >
          {loading ? "収集中..." : "収集開始"}
        </button>
      </form>
      <p className="text-xs text-gray-400 mt-2">
        Google Places APIを使って最大60件のレストラン情報を自動収集します
      </p>
    </div>
  )
}
