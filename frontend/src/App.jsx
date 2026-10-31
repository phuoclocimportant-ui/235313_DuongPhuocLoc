import { useEffect, useState, useCallback } from 'react'
import './App.css'

const API = (window.__API_URL__ || import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')
const STATUSES = ['Đang sử dụng', 'Hư hỏng', 'Đang sửa chữa', 'Ngừng sử dụng']
const EMPTY = { deviceId: '', name: '', deviceType: '', room: '', brand: '', model: '', quantity: 1, status: 'Đang sử dụng', purchaseDate: '', description: '' }
const statusClass = (s) => ({ 'Đang sử dụng': 'ok', 'Hư hỏng': 'bad', 'Đang sửa chữa': 'fix', 'Ngừng sử dụng': 'off' }[s])

async function api(path, options) {
  const res = await fetch(API + path, { headers: { 'Content-Type': 'application/json' }, ...options })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Có lỗi xảy ra')
  return data
}

export default function App() {
  const [devices, setDevices] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState(null)
  const [formError, setFormError] = useState('')
  const [detail, setDetail] = useState(null)

  const show = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 3000) }

  const load = useCallback(async (kw = '') => {
    setLoading(true); setError('')
    try {
      setDevices(await api('/api/devices' + (kw ? `?search=${encodeURIComponent(kw)}` : '')))
    } catch (e) {
      setError(e.message === 'Failed to fetch' ? 'Không kết nối được tới backend' : e.message)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function viewDetail(id) {
    try { setDetail(await api('/api/devices/' + id)) } catch (e) { setError(e.message) }
  }

  async function save(e) {
    e.preventDefault(); setFormError('')
    const { _id, createdAt, updatedAt, __v, ...data } = form
    data.quantity = Number(data.quantity)
    if (!data.purchaseDate) delete data.purchaseDate
    try {
      if (_id) await api('/api/devices/' + _id, { method: 'PUT', body: JSON.stringify(data) })
      else await api('/api/devices', { method: 'POST', body: JSON.stringify(data) })
      setForm(null); show(_id ? 'Cập nhật thiết bị thành công' : 'Thêm thiết bị thành công'); load(search)
    } catch (err) { setFormError(err.message) }
  }

  async function remove(d) {
    if (!window.confirm(`Xóa thiết bị "${d.name}"?`)) return
    try { await api('/api/devices/' + d._id, { method: 'DELETE' }); show('Đã xóa thiết bị'); load(search) }
    catch (err) { setError(err.message) }
  }

  const edit = (d) => { setFormError(''); setForm({ ...d, purchaseDate: d.purchaseDate ? d.purchaseDate.slice(0, 10) : '' }) }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="container">
      <h1>Quản lý thiết bị phòng học</h1>
      <div className="toolbar">
        <input placeholder="Tìm theo mã, tên, loại, phòng..." value={search}
          onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(search)} />
        <button onClick={() => load(search)}>Tìm kiếm</button>
        <button onClick={() => { setSearch(''); load('') }}>Xóa lọc</button>
        <button className="primary" onClick={() => { setFormError(''); setForm(EMPTY) }}>+ Thêm thiết bị</button>
      </div>

      {notice && <div className="notice">{notice}</div>}
      {error && <div className="error">{error}</div>}

      {loading ? <p>Đang tải dữ liệu...</p> : (
        <table>
          <thead>
            <tr><th>Mã</th><th>Tên thiết bị</th><th>Loại</th><th>Phòng</th><th>SL</th><th>Tình trạng</th><th>Thao tác</th></tr>
          </thead>
          <tbody>
            {devices.length === 0 && <tr><td colSpan="7" className="center">Không có thiết bị nào</td></tr>}
            {devices.map((d) => (
              <tr key={d._id}>
                <td>{d.deviceId}</td><td>{d.name}</td><td>{d.deviceType}</td><td>{d.room}</td><td>{d.quantity}</td>
                <td><span className={'badge ' + statusClass(d.status)}>{d.status}</span></td>
                <td className="actions">
                  <button onClick={() => viewDetail(d._id)}>Xem</button>
                  <button onClick={() => edit(d)}>Sửa</button>
                  <button className="danger" onClick={() => remove(d)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {detail && (
        <div className="overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết thiết bị</h2>
            <p><b>Mã:</b> {detail.deviceId}</p>
            <p><b>Tên:</b> {detail.name}</p>
            <p><b>Loại:</b> {detail.deviceType}</p>
            <p><b>Phòng:</b> {detail.room}</p>
            <p><b>Hãng:</b> {detail.brand}</p>
            <p><b>Model:</b> {detail.model}</p>
            <p><b>Số lượng:</b> {detail.quantity}</p>
            <p><b>Tình trạng:</b> <span className={'badge ' + statusClass(detail.status)}>{detail.status}</span></p>
            <p><b>Ngày mua:</b> {detail.purchaseDate ? new Date(detail.purchaseDate).toLocaleDateString('vi-VN') : ''}</p>
            <p><b>Mô tả:</b> {detail.description}</p>
            <button onClick={() => setDetail(null)}>Đóng</button>
          </div>
        </div>
      )}

      {form && (
        <div className="overlay">
          <form className="modal" onSubmit={save}>
            <h2>{form._id ? 'Cập nhật thiết bị' : 'Thêm thiết bị'}</h2>
            {formError && <div className="error">{formError}</div>}
            <label>Mã thiết bị *<input value={form.deviceId} onChange={set('deviceId')} /></label>
            <label>Tên thiết bị *<input value={form.name} onChange={set('name')} /></label>
            <label>Loại thiết bị *<input value={form.deviceType} onChange={set('deviceType')} /></label>
            <label>Phòng học *<input value={form.room} onChange={set('room')} /></label>
            <label>Hãng<input value={form.brand} onChange={set('brand')} /></label>
            <label>Model<input value={form.model} onChange={set('model')} /></label>
            <label>Số lượng<input type="number" min="0" value={form.quantity} onChange={set('quantity')} /></label>
            <label>Tình trạng
              <select value={form.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            </label>
            <label>Ngày mua<input type="date" value={form.purchaseDate} onChange={set('purchaseDate')} /></label>
            <label>Mô tả<textarea value={form.description} onChange={set('description')} /></label>
            <div className="actions">
              <button type="submit" className="primary">Lưu</button>
              <button type="button" onClick={() => setForm(null)}>Hủy</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
