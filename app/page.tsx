"use client"

import { useEffect, useState, useCallback } from "react"
import SearchForm from "./_components/SearchForm"
import RestaurantTable from "./_components/RestaurantTable"
import FilterBar from "./_components/FilterBar"
import StatsBar from "./_components/StatsBar"
import RouteOptimizer from "./_components/RouteOptimizer"
import Dashboard from "./_components/Dashboard"
import ProposalHelper from "./_components/ProposalHelper"

export type Restaurant = {
  id: string
  placeId: string
  name: string
  address: string | null
  phone: string | null
  website: string | null
  googleMapsUrl: string | null
  rating: number | null
  userRatingsTotal: number | null
  siteStatus: string
  siteScore: number | null
  hasMobileSupport: boolean | null
  hasContactForm: boolean | null
  hasReservation: boolean | null
  salesStatus: string
  memo: string | null
  siteCheckedAt: string | null
  updatedAt: string
  nearbyPlaces: string | null
  latitude: number | null
  longitude: number | null
  hasInstagram: boolean | null
  hasSNS: boolean | null
  hasMultipleLocations: boolean | null
  hasLunch: boolean | null
  hasEnglish: boolean | null
  priceLevel: string | null
}

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [salesStatus, setSalesStatus] = useState("all")
  const [siteStatus, setSiteStatus] = useState("all")
  const [search, setSearch] = useState("")
  const [message, setMessage] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchRestaurants = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (salesStatus !== "all") params.set("salesStatus", salesStatus)
    if (siteStatus !== "all") params.set("siteStatus", siteStatus)
    if (search) params.set("search", search)

    const res = await fetch(`/api/restaurants?${params}`)
    const data = await res.json()
    setRestaurants(data)
    setLoading(false)
  }, [salesStatus, siteStatus, search])

  useEffect(() => {
    fetchRestaurants()
  }, [fetchRestaurants])

  const handleSearch = async (area: string, keyword: string) => {
    setSearchLoading(true)
    setMessage("")
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area, keyword }),
      })
      const data = await res.json()
      if (data.error) {
        setMessage(`エラー: ${data.error}`)
      } else {
        setMessage(`${data.collected}件のレストランを収集しました`)
        fetchRestaurants()
      }
    } catch {
      setMessage("収集中にエラーが発生しました")
    } finally {
      setSearchLoading(false)
    }
  }

  const handleUpdateSites = async () => {
    setMessage("サイト品質を再チェック中...")
    try {
      const res = await fetch("/api/update-sites", { method: "POST" })
      const data = await res.json()
      setMessage(`${data.updated}件のサイトを更新しました`)
      fetchRestaurants()
    } catch {
      setMessage("更新中にエラーが発生しました")
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 5) {
        next.add(id)
      }
      return next
    })
  }

  const handleStatusUpdate = async (id: string, salesStatus: string, memo?: string) => {
    await fetch(`/api/restaurants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salesStatus, memo }),
    })
    fetchRestaurants()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-800">レストラン営業リスト</h1>
        <p className="text-sm text-gray-500 mt-1">ホームページ制作の営業先自動管理ツール</p>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <SearchForm onSearch={handleSearch} loading={searchLoading} />

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
            {message}
          </div>
        )}

        <StatsBar restaurants={restaurants} />
        <Dashboard restaurants={restaurants} />

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <FilterBar
              salesStatus={salesStatus}
              setSalesStatus={setSalesStatus}
              siteStatus={siteStatus}
              setSiteStatus={setSiteStatus}
              search={search}
              setSearch={setSearch}
            />
            <button
              onClick={handleUpdateSites}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition cursor-pointer"
            >
              サイト再チェック
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">読み込み中...</div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">データがありません</p>
              <p className="text-sm mt-1">上のフォームからエリアを検索してください</p>
            </div>
          ) : (
            <RestaurantTable
              restaurants={restaurants}
              onStatusUpdate={handleStatusUpdate}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
            />
          )}
        </div>
        <RouteOptimizer
          selectedRestaurants={restaurants.filter(r => selectedIds.has(r.id))}
          allRestaurants={restaurants}
          selectedIds={selectedIds}
        />
        <ProposalHelper
          selectedRestaurants={restaurants.filter(r => selectedIds.has(r.id))}
          allRestaurants={restaurants}
        />
      </main>
    </div>
  )
}
