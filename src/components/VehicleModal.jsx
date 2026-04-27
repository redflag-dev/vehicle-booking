import React, { useState } from 'react'

const LOCATIONS = ['深圳', '长春', '天津']

// Convert legacy "临牌M.D过期" → "YYYY-MM-DD" for the date input
function toInputDate(plateInfo) {
  if (!plateInfo) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(plateInfo)) return plateInfo
  const m = plateInfo.match(/临牌(\d+)[./](\d+)/)
  if (!m) return ''
  return `2026-${String(+m[1]).padStart(2, '0')}-${String(+m[2]).padStart(2, '0')}`
}

export default function VehicleModal({ vehicle, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    id:        vehicle.id,
    location:  vehicle.location,
    usage:     vehicle.usage  || '',
    notes:     vehicle.notes  || '',
    plateInfo: toInputDate(vehicle.plateInfo),
  })

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleSave() {
    if (!form.id.trim()) return
    onSave({ ...vehicle, ...form, id: form.id.trim() }, vehicle.id || null)
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <div style={{ flex: 1 }}>
            <h2 className="modal-title">{vehicle.id ? '编辑车辆信息' : '新增车辆'}</h2>
            {vehicle.id && <div className="modal-subtitle">原编号：{vehicle.id}</div>}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <label>车辆编号 *</label>
            <input
              value={form.id}
              onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
              placeholder="如 E202-16#"
            />
          </div>

          <div className="form-row">
            <label>所在地</label>
            <select value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="form-row">
            <label>临牌信息</label>
            <input
              type="date"
              value={form.plateInfo}
              onChange={e => setForm(f => ({ ...f, plateInfo: e.target.value }))}
            />
          </div>

          <div className="form-row">
            <label>用途 / 说明</label>
            <textarea
              value={form.usage}
              onChange={e => setForm(f => ({ ...f, usage: e.target.value }))}
              placeholder="如 OTA测试·记忆泊车"
            />
          </div>

          <div className="form-row">
            <label>注意事项</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="如 不适用冷启动测试"
            />
          </div>
        </div>

        <div className="modal-footer">
          {vehicle.id && (
            <button className="btn btn-danger" onClick={() => onDelete(vehicle.id)}>删除车辆</button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>取消</button>
          <button
            className="btn btn-primary"
            disabled={!form.id.trim()}
            onClick={handleSave}
          >
            {vehicle.id ? '保存' : '创建'}
          </button>
        </div>
      </div>
    </div>
  )
}
