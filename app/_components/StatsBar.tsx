import type { Restaurant } from "../page"

type Props = {
  restaurants: Restaurant[]
}

export default function StatsBar({ restaurants }: Props) {
  const total = restaurants.length
  const noSite = restaurants.filter((r) => r.siteStatus === "none").length
  const weakSite = restaurants.filter((r) => r.siteStatus === "weak").length
  const fairSite = restaurants.filter((r) => r.siteStatus === "fair").length
  const approached = restaurants.filter((r) => r.salesStatus === "approached").length
  const contracted = restaurants.filter((r) => r.salesStatus === "contracted").length

  const stats = [
    { label: "合計", value: total, color: "text-gray-700" },
    { label: "サイトなし", value: noSite, color: "text-red-600" },
    { label: "弱いサイト", value: weakSite, color: "text-orange-500" },
    { label: "改善余地あり", value: fairSite, color: "text-yellow-600" },
    { label: "アプローチ済み", value: approached, color: "text-blue-600" },
    { label: "成約", value: contracted, color: "text-green-600" },
  ]

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          <div className="text-xs text-gray-500 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  )
}
