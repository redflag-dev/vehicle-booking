import React, { useState } from 'react'
import { saveTestTypes, DEFAULT_TEST_TYPES } from '../vehicles'

// generate a light bg from a hex color
function colorToBg(hex) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `rgba(${r},${g},${b},0.12)`
}

export default function TestTypeModal({ testTypes, onClose, onSave }) {
  const [list, setList] = useState(testTypes.map(t => ({ ...t })))
  const [newLabel, setNewLabel] = useState('')
  const [newColor, setNewColor] = useState('#1565C0')

  function add() {
    const label = newLabel.trim()
    if (!label || list.some(t => t.label === label)) return
    setList(l => [...l, { label, color: newColor, bg: colorToBg(newColor) }])
    setNewLabel('')
  }

  function remove(idx) {
    setList(l => l.filter((_, i) => i !== idx))
  }

  function updateColor(idx, color) {
    setList(l => l.map((t, i) => i === idx ? { ...t, color, bg: colorToBg(color) } : t))
  }

  function handleSave() {
    saveTestTypes(list)
    onSave(list)
  }

  function handleReset() {
    setList(DEFAULT_TEST_TYPES.map(t => ({ ...t })))
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 480 }}>
        <div className="modal-header">
          <div style={{ flex: 1 }}>
            <h2 className="modal-title">管理测试类型</h2>
            <div className="modal-subtitle">修改后刷新页面生效</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {list.map((t, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <input
                type="color"
                value={t.color}
                onChange={e => updateColor(idx, e.target.value)}
                style={{ width: 32, height: 32, border: 'none', padding: 0, cursor: 'pointer', borderRadius: 4 }}
              />
              <span
                style={{
                  flex: 1, padding: '4px 10px', borderRadius: 4,
                  background: t.bg, color: t.color, fontWeight: 600, fontSize: 13
                }}
              >
                {t.label}
              </span>
              <button
                className="ebi-delete-btn"
                onClick={() => remove(idx)}
                style={{ opacity: 1 }}
              >✕</button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input
              type="color"
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
              style={{ width: 32, height: 32, border: 'none', padding: 0, cursor: 'pointer', borderRadius: 4 }}
            />
            <input
              className="form-row input"
              style={{ flex: 1, border: '1px solid #CBD5E1', borderRadius: 6, padding: '6px 10px', fontSize: 13, fontFamily: 'inherit' }}
              placeholder="新类型名称"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && add()}
            />
            <button className="btn btn-primary" onClick={add}>添加</button>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-danger" onClick={handleReset}>恢复默认</button>
          <button className="btn btn-ghost" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  )
}
