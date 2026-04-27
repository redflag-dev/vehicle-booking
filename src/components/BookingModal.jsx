import React, { useState, useEffect } from 'react'
import { TEST_TYPES, TEST_TYPE_MAP } from '../vehicles'
import dayjs from 'dayjs'

export default function BookingModal({ vehicle, date, initialBooking, bookings, onClose, onSave, onDelete }) {
  const dayBookings = bookings.filter(b =>
    b.vehicle_id === vehicle.id &&
    dayjs(b.start_date).isSameOrBefore(date, 'day') &&
    dayjs(b.end_date).isSameOrAfter(date, 'day')
  )

  // If a chip was clicked, start directly in edit mode for that booking
  const [mode, setMode] = useState(() => {
    if (initialBooking) return 'edit'
    return dayBookings.length === 0 ? 'new' : 'list'
  })
  const [editing, setEditing] = useState(initialBooking || null)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const emptyForm = {
    test_type:  TEST_TYPES[0].label,
    shift:      '白班',
    tester:     '',
    start_date: dayjs(date).format('YYYY-MM-DD'),
    end_date:   dayjs(date).format('YYYY-MM-DD'),
    notes:      '',
  }

  const [form, setForm] = useState(() => {
    if (initialBooking) return {
      test_type:  initialBooking.test_type,
      shift:      initialBooking.shift || '白班',
      tester:     initialBooking.tester || '',
      start_date: initialBooking.start_date,
      end_date:   initialBooking.end_date,
      notes:      initialBooking.notes || '',
    }
    return emptyForm
  })

  useEffect(() => {
    if (editing && mode === 'edit') {
      setForm({
        test_type:  editing.test_type,
        shift:      editing.shift || '白班',
        tester:     editing.tester || '',
        start_date: editing.start_date,
        end_date:   editing.end_date,
        notes:      editing.notes || '',
      })
    }
  }, [editing])

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  // Check if another booking for the same vehicle+shift overlaps the selected date range
  const conflict = bookings.find(b =>
    b.vehicle_id === vehicle.id &&
    b.shift === form.shift &&
    b.id !== editing?.id &&
    b.start_date <= form.end_date &&
    b.end_date >= form.start_date
  ) || null

  function handleSave() {
    setSubmitAttempted(true)
    if (!form.tester.trim() || conflict) return
    onSave({
      ...(editing ? { id: editing.id } : {}),
      vehicle_id: vehicle.id,
      ...form,
    })
  }

  function startNew() {
    setEditing(null)
    setForm(emptyForm)
    setSubmitAttempted(false)
    setMode('new')
  }

  function startEdit(bk) {
    setEditing(bk)
    setMode('edit')
  }

  const dateLabel = dayjs(date).format('YYYY-MM-DD (ddd)')

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <div style={{ flex: 1 }}>
            <h2 className="modal-title">{vehicle.id}</h2>
            <div className="modal-subtitle">{dateLabel} · {vehicle.location}</div>
            {vehicle.usage && (
              <div className="modal-subtitle" style={{ color: '#475569', marginTop: 2 }}>{vehicle.usage}</div>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {mode === 'list' && (
          <div className="modal-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                当日已有 {dayBookings.length} 条预约
              </span>
              <button className="btn btn-primary" onClick={startNew}>+ 新增</button>
            </div>
            <div className="existing-bookings">
              {dayBookings.map(bk => {
                const tt = TEST_TYPE_MAP[bk.test_type] || TEST_TYPE_MAP['其他']
                return (
                  <div key={bk.id} className="existing-booking-item">
                    <div className="ebi-color" style={{ background: tt.color }} />
                    <div className="ebi-info" onClick={() => startEdit(bk)} style={{ cursor: 'pointer', flex: 1 }}>
                      <div className="ebi-type" style={{ color: tt.color }}>
                        {bk.test_type}
                        <span className={`ebi-shift ${bk.shift === '夜班' ? 'ebi-shift-night' : 'ebi-shift-day'}`}>
                          {bk.shift || '白班'}
                        </span>
                      </div>
                      <div className="ebi-meta">{bk.tester}{bk.notes ? ' · ' + bk.notes : ''}</div>
                    </div>
                    <div className="ebi-dates">{bk.start_date}<br />{bk.end_date !== bk.start_date ? '→ ' + bk.end_date : ''}</div>
                    <button
                      className="ebi-delete-btn"
                      title="删除"
                      onClick={e => { e.stopPropagation(); onDelete(bk.id) }}
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {(mode === 'new' || mode === 'edit') && (
          <div className="modal-body">
            {dayBookings.length > 0 && (
              <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', marginBottom: -4 }}
                onClick={() => { setEditing(null); setMode('list') }}>
                ← 返回列表
              </button>
            )}

            <div className="form-row">
              <label>测试类型</label>
              <select value={form.test_type} onChange={e => setForm(f => ({ ...f, test_type: e.target.value }))}>
                {TEST_TYPES.map(t => (
                  <option key={t.label} value={t.label}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label>班次</label>
              <div className="shift-toggle">
                {['白班', '夜班'].map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`shift-btn ${form.shift === s ? 'shift-btn-active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, shift: s }))}
                  >
                    {s === '白班' ? '☀ 白班' : '☾ 夜班'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <label>预约人 *</label>
              <input
                value={form.tester}
                onChange={e => { setForm(f => ({ ...f, tester: e.target.value })); setSubmitAttempted(false) }}
                placeholder="姓名"
                style={submitAttempted && !form.tester.trim() ? { borderColor: '#EF4444' } : {}}
              />
              {submitAttempted && !form.tester.trim() && (
                <span className="field-error">请填写预约人姓名</span>
              )}
            </div>

            <div className="date-range-row">
              <div className="form-row">
                <label>开始日期</label>
                <input type="date" value={form.start_date}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>结束日期</label>
                <input type="date" value={form.end_date}
                  onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>

            <div className="form-row">
              <label>备注</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="可选"
              />
            </div>

            {conflict && (
              <div className="conflict-warning">
                该车辆 {form.start_date} ~ {form.end_date} 期间{form.shift}已被
                <strong> {conflict.tester}</strong>（{conflict.test_type}）占用，无法重复预约同一班次。
              </div>
            )}
          </div>
        )}

        {(mode === 'new' || mode === 'edit') && (
          <div className="modal-footer">
            {mode === 'edit' && (
              <button className="btn btn-danger" onClick={() => onDelete(editing.id)}>删除</button>
            )}
            <button className="btn btn-ghost" onClick={onClose}>取消</button>
            <button
              className="btn btn-primary"
              disabled={!!conflict}
              onClick={handleSave}
            >
              {mode === 'edit' ? '保存修改' : '创建预约'}
            </button>
          </div>
        )}

        {mode === 'list' && (
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>关闭</button>
          </div>
        )}
      </div>
    </div>
  )
}
