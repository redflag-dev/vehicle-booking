import React, { useMemo } from 'react'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { SERIES_COLORS, parsePlateExpiry } from '../vehicles'

function formatPlateInfo(plateInfo) {
  if (!plateInfo) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(plateInfo)) {
    const [, y, m, d] = plateInfo.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    const expiry = new Date(+y, +m - 1, +d)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const diff = Math.ceil((expiry - now) / 86400000)
    if (diff < 0) return `${+m}/${+d}`
    if (diff === 0) return `${+m}/${+d} 今天到期`
    if (diff <= 7) return `${+m}/${+d} 剩${diff}天`
    if (diff <= 30) return `${+m}/${+d} 剩${diff}天`
    return `${+m}/${+d}`
  }
  // legacy: strip "临牌" prefix and "过期"/"到期" suffix, keep only the date part
  return plateInfo.replace(/^临牌/, '').replace(/[过到]期$/, '')
}

dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

const SERIES_ORDER = ['E202', 'E001', 'E009', 'E007', 'P301', 'P201', 'P567', 'E202-10']

// 调休工作日（周末需上班，不标灰）
const MAKEUP_WORKDAYS = new Set([
  '2026-02-08', '2026-02-28',           // 春节调休
  '2026-04-26', '2026-05-10',           // 劳动节调休
])

// 节假日中的工作日（平日被设为法定假日，需标灰）
const HOLIDAY_WEEKDAYS = new Set([
  '2026-02-16','2026-02-17','2026-02-18','2026-02-19','2026-02-20', // 春节
  '2026-04-03',                                                       // 清明
  '2026-05-01','2026-05-04','2026-05-05',                            // 劳动节
])

function isGrayDay(d) {
  const s = d.format('YYYY-MM-DD')
  const wknd = d.day() === 0 || d.day() === 6
  return (wknd && !MAKEUP_WORKDAYS.has(s)) || HOLIDAY_WEEKDAYS.has(s)
}

function locClass(loc) {
  if (loc === '深圳') return 'loc-sz'
  if (loc === '长春') return 'loc-cc'
  return 'loc-tj'
}

export default function BookingTable({ weekStart, bookings, vehicles, testTypes, onCellClick, onVehicleEdit }) {
  const days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => dayjs(weekStart).add(i, 'day'))
  }, [weekStart])

  const today = dayjs().startOf('day')

  const groups = useMemo(() => {
    const map = {}
    vehicles.forEach(v => {
      if (!map[v.series]) map[v.series] = []
      map[v.series].push(v)
    })
    const known = SERIES_ORDER.filter(s => map[s]).map(s => ({ series: s, vehicles: map[s] }))
    const extra = Object.keys(map)
      .filter(s => !SERIES_ORDER.includes(s))
      .map(s => ({ series: s, vehicles: map[s] }))
    return [...known, ...extra]
  }, [vehicles])

  // index bookings by vehicle_id for quick lookup
  const byVehicle = useMemo(() => {
    const m = {}
    bookings.forEach(b => {
      if (!m[b.vehicle_id]) m[b.vehicle_id] = []
      m[b.vehicle_id].push(b)
    })
    return m
  }, [bookings])

  // conflict map: "date|location|test_type" -> count (daytime only)
  const conflictMap = useMemo(() => {
    const map = {}
    days.forEach(d => {
      const dateStr = d.format('YYYY-MM-DD')
      vehicles.forEach(v => {
        ;(byVehicle[v.id] || []).forEach(b => {
          if (b.shift === '夜班') return
          if (!d.isSameOrAfter(dayjs(b.start_date), 'day') || !d.isSameOrBefore(dayjs(b.end_date), 'day')) return
          const key = `${dateStr}|${v.location}|${b.test_type}`
          map[key] = (map[key] || 0) + 1
        })
      })
    })
    return map
  }, [days, vehicles, byVehicle])

  function bookingsOnDay(vehicleId, day) {
    const list = byVehicle[vehicleId] || []
    return list.filter(b =>
      day.isSameOrAfter(dayjs(b.start_date), 'day') &&
      day.isSameOrBefore(dayjs(b.end_date), 'day')
    )
  }

  return (
    <table className="booking-table">
      <thead>
        <tr>
          <th className="col-sticky col-idx" style={{ zIndex: 30 }}>#</th>
          <th className="col-sticky col-id"  style={{ zIndex: 30 }}>车辆编号</th>
          <th className="col-sticky col-plate" style={{ zIndex: 30 }}>临牌信息</th>
          <th className="col-sticky col-loc" style={{ zIndex: 30 }}>位置</th>
          <th className="col-sticky col-usage" style={{ zIndex: 30 }}>用途 / 说明</th>
          <th className="col-sticky col-notes" style={{ zIndex: 30 }}>注意事项</th>
          {days.map(d => {
            const isGray = isGrayDay(d)
            const isToday = d.isSame(today, 'day')
            return (
              <th
                key={d.format('YYYY-MM-DD')}
                className={`col-date ${isGray ? 'col-date-weekend' : ''} ${isToday ? 'col-date-today' : ''}`}
              >
                <div className="date-header">
                  <span className="date-weekday">{d.format('ddd')}</span>
                  <span className="date-day">{d.format('D')}</span>
                  <span className="date-month">{d.format('M/D')}</span>
                </div>
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {groups.map(({ series, vehicles }) => {
          const color = SERIES_COLORS[series] || '#607D8B'
          return (
            <React.Fragment key={series}>
              {/* group header */}
              <tr className="row-group-header">
                <td
                  colSpan={6 + days.length}
                  style={{ background: color, left: 0 }}
                >
                  {series}
                </td>
              </tr>
              {/* vehicle rows */}
              {vehicles.map((v, idx) => {
                const plateClass = (() => {
                  const expiry = parsePlateExpiry(v.plateInfo)
                  if (!expiry) return null
                  const diff = (expiry - new Date()) / 86400000
                  if (diff < 0)  return 'plate-expired'
                  if (diff < 15) return 'plate-soon'
                  return 'plate-ok'
                })()

                return (
                  <tr key={v.id} className="row-vehicle">
                    <td className="col-sticky col-idx" style={{ background: '#fff', color: '#94A3B8', fontSize: 11 }}>
                      {idx + 1}
                    </td>
                    <td className="col-sticky col-id cell-id" style={{ background: '#fff' }}>
                      <div className="vehicle-id-row">
                        <span>{v.id}</span>
                        <button
                          className="vehicle-edit-btn"
                          title="编辑车辆信息"
                          onClick={e => { e.stopPropagation(); onVehicleEdit(v) }}
                        >✎</button>
                      </div>
                    </td>
                    <td className="col-sticky col-plate" style={{ background: '#fff' }}>
                      {v.plateInfo
                        ? <span className={`plate-badge ${plateClass || 'plate-none'}`}>{formatPlateInfo(v.plateInfo)}</span>
                        : <span style={{ color: '#CBD5E1' }}>—</span>
                      }
                    </td>
                    <td className="col-sticky col-loc cell-loc" style={{ background: '#fff' }}>
                      <span className={`loc-badge ${locClass(v.location)}`}>{v.location}</span>
                    </td>
                    <td className="col-sticky col-usage cell-usage" style={{ background: '#fff' }}
                        title={v.usage}>
                      {v.usage}
                    </td>
                    <td className="col-sticky col-notes cell-notes" style={{ background: '#fff' }}
                        title={v.notes}>
                      {v.notes}
                    </td>
                    {days.map(d => {
                      const key = d.format('YYYY-MM-DD')
                      const isGray = isGrayDay(d)
                      const isToday = d.isSame(today, 'day')
                      const chips = bookingsOnDay(v.id, d)
                      return (
                        <td
                          key={key}
                          className={`cell-day ${isGray ? 'cell-day-weekend' : ''} ${isToday ? 'cell-day-today' : ''}`}
                          onClick={() => onCellClick(v, d.toDate())}
                        >
                          <span className="cell-day-add-hint">+</span>
                          <div className="cell-day-content">
                            {[...chips].sort((a, b) => (a.shift === '夜班') - (b.shift === '夜班')).map(bk => {
                              const ttMap = Object.fromEntries(testTypes.map(t => [t.label, t]))
                              const tt = ttMap[bk.test_type] || ttMap['其他'] || { bg: '#EFEBE9', color: '#5D4037' }
                              const isConflict = bk.shift === '白班' &&
                                (conflictMap[`${key}|${v.location}|${bk.test_type}`] || 0) >= 2
                              return (
                                <div
                                  key={bk.id}
                                  className={`booking-chip${isConflict ? ' booking-chip-conflict' : ''}`}
                                  style={{ background: tt.bg, color: tt.color }}
                                  onClick={e => { e.stopPropagation(); onCellClick(v, d.toDate(), bk) }}
                                >
                                  <span className={`chip-shift ${bk.shift === '夜班' ? 'chip-shift-night' : 'chip-shift-day'}`}>
                                    {bk.shift === '夜班' ? '夜' : '白'}
                                  </span>
                                  {isConflict && <span className="chip-conflict-icon">⚠</span>}
                                  <span className="chip-label">{bk.test_type}</span>
                                </div>
                              )
                            })}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </React.Fragment>
          )
        })}
      </tbody>
    </table>
  )
}
