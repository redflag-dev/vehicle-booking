import React, { useMemo } from 'react'
import dayjs from 'dayjs'
import { SERIES_COLORS, parsePlateExpiry } from '../vehicles'

const SERIES_ORDER = ['E202', 'E001', 'E009', 'E007', 'P301', 'P201', 'P567', 'E202-10']

export default function SummaryBar({ vehicles, bookings }) {
  const { total, bookedCount, expiredCount, seriesRows } = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    const now = new Date()

    const bookedIds = new Set()
    bookings.forEach(b => {
      if (b.start_date <= today && b.end_date >= today) bookedIds.add(b.vehicle_id)
    })

    let expiredCount = 0
    const map = {}
    vehicles.forEach(v => {
      if (!map[v.series]) map[v.series] = { total: 0, booked: 0, color: SERIES_COLORS[v.series] || '#607D8B' }
      map[v.series].total++
      if (bookedIds.has(v.id)) map[v.series].booked++
      const expiry = parsePlateExpiry(v.plateInfo)
      if (expiry && expiry < now) expiredCount++
    })

    const knownRows = SERIES_ORDER.filter(s => map[s]).map(s => ({ series: s, ...map[s] }))
    const extraRows = Object.keys(map).filter(s => !SERIES_ORDER.includes(s)).map(s => ({ series: s, ...map[s] }))

    return { total: vehicles.length, bookedCount: bookedIds.size, expiredCount, seriesRows: [...knownRows, ...extraRows] }
  }, [vehicles, bookings])

  const stats = [
    { label: '总车辆',   value: total,               color: '#3B82F6', bg: '#EFF6FF' },
    { label: '当天已预约', value: bookedCount,          color: '#10B981', bg: '#ECFDF5' },
    { label: '未预约',   value: total - bookedCount,  color: '#64748B', bg: '#F8FAFC' },
    { label: '临牌过期', value: expiredCount,          color: '#EF4444', bg: '#FEF2F2' },
  ]

  return (
    <div className="summary-bar">
      <div className="summary-cards">
        {stats.map(s => (
          <div key={s.label} className="summary-card" style={{ '--card-color': s.color, '--card-bg': s.bg }}>
            <span className="summary-card-value">{s.value}</span>
            <span className="summary-card-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="summary-divider" />

      <div className="summary-series-list">
        {seriesRows.map(({ series, total: st, booked: sb, color }) => (
          <div key={series} className="summary-series-chip">
            <span className="summary-series-dot" style={{ background: color }} />
            <span className="summary-series-name">{series}</span>
            <span className="summary-series-nums">
              <span className="sns-total">{st}</span>
              <span className="sns-sep">/</span>
              <span className="sns-booked" title="已预约">{sb}</span>
              <span className="sns-sep">/</span>
              <span className="sns-free"  title="未预约">{st - sb}</span>
            </span>
          </div>
        ))}
        <span className="summary-series-legend">总/已约/未约</span>
      </div>
    </div>
  )
}
