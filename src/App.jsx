import React, { useState, useEffect, useCallback, useRef } from 'react'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import BookingTable from './components/BookingTable'
import BookingModal from './components/BookingModal'
import VehicleModal from './components/VehicleModal'
import SummaryBar from './components/SummaryBar'
import { VEHICLES, getSeries } from './vehicles'
import { supabase, isConfigured } from './supabase'

dayjs.extend(weekOfYear)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

const LS_KEY = 'vb_bookings_v1'
const LS_VEHICLES_KEY = 'vb_vehicles_v1'

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}

function saveLocal(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list))
}

function loadLocalVehicles() {
  try {
    const stored = JSON.parse(localStorage.getItem(LS_VEHICLES_KEY) || 'null')
    if (stored && Array.isArray(stored) && stored.length > 0)
      return stored.map(v => ({ ...v, series: getSeries(v.id) }))
  } catch {}
  return VEHICLES
}

function saveLocalVehicles(list) {
  localStorage.setItem(LS_VEHICLES_KEY, JSON.stringify(list))
}

let _localId = Date.now()
function nextId() { return 'local_' + (++_localId) }

export default function App() {
  const [weekStart, setWeekStart] = useState(() => {
    const d = dayjs().startOf('week')
    // start on Monday
    return d.day() === 0 ? d.subtract(6, 'day').toDate() : d.add(1 - d.day(), 'day').toDate()
  })

  const [bookings, setBookings] = useState([])
  const [vehicles, setVehicles] = useState(loadLocalVehicles)
  const [modal, setModal] = useState(null)
  const [vehicleModal, setVehicleModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const channelRef = useRef(null)

  // ── load ────────────────────────────────────────────────────
  useEffect(() => {
    if (isConfigured) {
      loadFromSupabase()
      const ch = supabase
        .channel('bookings-rt')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, payload => {
          handleRealtimeEvent(payload)
        })
        .subscribe()
      channelRef.current = ch
      return () => { supabase.removeChannel(ch) }
    } else {
      setBookings(loadLocal())
    }
  }, [])

  async function loadFromSupabase() {
    const { data, error } = await supabase.from('bookings').select('*').order('start_date')
    if (!error && data) setBookings(data)
  }

  function handleRealtimeEvent(payload) {
    const { eventType, new: row, old } = payload
    setBookings(prev => {
      if (eventType === 'INSERT') {
        // Deduplicate: skip if already present (added by handleSave)
        if (prev.some(b => b.id === row.id)) return prev
        return [...prev, row]
      }
      if (eventType === 'UPDATE') return prev.map(b => b.id === row.id ? row : b)
      if (eventType === 'DELETE') return prev.filter(b => b.id !== old.id)
      return prev
    })
  }

  // ── week nav ────────────────────────────────────────────────
  function shiftWeek(n) {
    setWeekStart(d => dayjs(d).add(n * 7, 'day').toDate())
  }

  function goToday() {
    const d = dayjs()
    const mon = d.day() === 0 ? d.subtract(6, 'day') : d.add(1 - d.day(), 'day')
    setWeekStart(mon.toDate())
  }

  const weekLabel = (() => {
    const s = dayjs(weekStart)
    const e = s.add(13, 'day')
    return `${s.format('YYYY年M月D日')} – ${e.format('M月D日')}`
  })()

  // ── modal ───────────────────────────────────────────────────
  function openModal(vehicle, date, booking = null) {
    setModal({ vehicle, date, booking })
  }

  function closeModal() { setModal(null) }

  async function handleSave(formData) {
    setSaving(true)
    try {
      if (isConfigured) {
        if (formData.id) {
          // update
          const { id, ...fields } = formData
          const { data, error } = await supabase.from('bookings').update(fields).eq('id', id).select().single()
          if (!error && data) {
            setBookings(prev => prev.map(b => b.id === id ? data : b))
          }
        } else {
          const { data, error } = await supabase.from('bookings').insert(formData).select().single()
          if (!error && data) {
            setBookings(prev => prev.some(b => b.id === data.id) ? prev : [...prev, data])
          }
        }
      } else {
        if (formData.id) {
          setBookings(prev => {
            const next = prev.map(b => b.id === formData.id ? { ...b, ...formData } : b)
            saveLocal(next)
            return next
          })
        } else {
          const newBooking = { ...formData, id: nextId() }
          setBookings(prev => {
            const next = [...prev, newBooking]
            saveLocal(next)
            return next
          })
        }
      }
    } finally {
      setSaving(false)
      closeModal()
    }
  }

  async function handleDelete(id) {
    setSaving(true)
    try {
      if (isConfigured) {
        await supabase.from('bookings').delete().eq('id', id)
        setBookings(prev => prev.filter(b => b.id !== id))
      } else {
        setBookings(prev => {
          const next = prev.filter(b => b.id !== id)
          saveLocal(next)
          return next
        })
      }
    } finally {
      setSaving(false)
      closeModal()
    }
  }

  function handleVehicleDelete(vehicleId) {
    setVehicles(prev => {
      const next = prev.filter(v => v.id !== vehicleId)
      saveLocalVehicles(next)
      return next
    })
    setBookings(prev => {
      const next = prev.filter(b => b.vehicle_id !== vehicleId)
      saveLocal(next)
      return next
    })
    setVehicleModal(null)
  }

  function handleVehicleSave(updated, oldId) {
    setVehicles(prev => {
      const newVehicle = { ...updated, series: getSeries(updated.id) }
      const next = oldId === null
        ? [...prev, newVehicle]
        : prev.map(v => v.id === oldId ? { ...v, ...newVehicle } : v)
      saveLocalVehicles(next)
      return next
    })
    // if ID changed, migrate bookings
    if (oldId !== null && updated.id !== oldId) {
      setBookings(prev => {
        const next = prev.map(b => b.vehicle_id === oldId ? { ...b, vehicle_id: updated.id } : b)
        saveLocal(next)
        return next
      })
    }
    setVehicleModal(null)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>红旗车辆状态 &amp; 预约管理</h1>
        {isConfigured && <span className="badge-live">实时同步</span>}
        <div className="header-meta">
          {saving && <span>保存中…</span>}
          <span>{bookings.length} 条预约</span>
        </div>
      </header>

      {!isConfigured && (
        <div className="notice-bar">
          ⚠ 未配置 Supabase，数据仅保存在本机浏览器。配置 <code>.env</code> 并重启后可启用多人实时同步。
        </div>
      )}

      <SummaryBar vehicles={vehicles} bookings={bookings} />

      <div className="toolbar">
        <span className="toolbar-label">日期范围：</span>
        <div className="week-nav">
          <button className="btn btn-ghost btn-icon" onClick={() => shiftWeek(-1)}>‹</button>
          <span className="week-label">{weekLabel}</span>
          <button className="btn btn-ghost btn-icon" onClick={() => shiftWeek(1)}>›</button>
        </div>
        <button className="btn btn-primary" onClick={() => setVehicleModal({ id: '', location: '深圳', usage: '', notes: '', plateInfo: '', app: '' })}>+ 新增车辆</button>
        <button className="btn btn-ghost" onClick={goToday}>今天</button>
        <button className="btn btn-ghost" onClick={() => shiftWeek(-2)}>前两周</button>
        <button className="btn btn-ghost" onClick={() => shiftWeek(2)}>后两周</button>
      </div>

      <div className="table-scroll">
        <BookingTable
          weekStart={weekStart}
          bookings={bookings}
          vehicles={vehicles}
          onCellClick={openModal}
          onVehicleEdit={v => setVehicleModal(v)}
        />
      </div>

      {vehicleModal && (
        <VehicleModal
          vehicle={vehicleModal}
          onClose={() => setVehicleModal(null)}
          onSave={handleVehicleSave}
          onDelete={handleVehicleDelete}
        />
      )}

      {modal && (
        <BookingModal
          vehicle={modal.vehicle}
          date={modal.date}
          initialBooking={modal.booking}
          bookings={bookings}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
