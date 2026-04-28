"use client"

type Props = {
  salesStatus: string
  setSalesStatus: (v: string) => void
  siteStatus: string
  setSiteStatus: (v: string) => void
  search: string
  setSearch: (v: string) => void
}

const SALES_OPTIONS = [
  { value: "all", label: "全ステータス" },
  { value: "new", label: "未アプローチ" },
  { value: "approached", label: "連絡済み" },
  { value: "negotiating", label: "商談中" },
  { value: "contracted", label: "成約" },
  { value: "dismissed", label: "見送り" },
]

const SITE_OPTIONS = [
  { value: "all", label: "全サイト状態" },
  { value: "none", label: "サイトなし" },
  { value: "weak", label: "弱いサイト" },
  { value: "fair", label: "改善余地あり" },
  { value: "good", label: "充実したサイト" },
]

export default function FilterBar({
  salesStatus,
  setSalesStatus,
  siteStatus,
  setSiteStatus,
  search,
  setSearch,
}: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="店名・住所で検索..."
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-40"
      />
      <select
        value={siteStatus}
        onChange={(e) => setSiteStatus(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
      >
        {SITE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <select
        value={salesStatus}
        onChange={(e) => setSalesStatus(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
      >
        {SALES_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
