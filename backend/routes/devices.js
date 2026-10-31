const router = require('express').Router();
const mongoose = require('mongoose');
const Device = require('../models/Device');

const checkId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'ID không hợp lệ' });
  }
  next();
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const handleError = (err, res) => {
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message: msg });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ: ' + err.path });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Mã thiết bị đã tồn tại' });
  }
  console.error(err);
  return res.status(500).json({ message: 'Lỗi máy chủ hoặc lỗi kết nối cơ sở dữ liệu' });
};

// GET /api/devices và /api/devices?search=...
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.search && req.query.search.trim()) {
      const rx = new RegExp(escapeRegex(req.query.search.trim()), 'i');
      filter.$or = [{ deviceId: rx }, { name: rx }, { deviceType: rx }, { room: rx }];
    }
    const devices = await Device.find(filter).sort({ createdAt: -1 });
    res.json(devices);
  } catch (err) { handleError(err, res); }
});

router.get('/:id', checkId, async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    res.json(device);
  } catch (err) { handleError(err, res); }
});

router.post('/', async (req, res) => {
  try {
    const device = await Device.create(req.body);
    res.status(201).json(device);
  } catch (err) { handleError(err, res); }
});

router.put('/:id', checkId, async (req, res) => {
  try {
    const { _id, createdAt, updatedAt, __v, ...data } = req.body;
    const device = await Device.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    res.json(device);
  } catch (err) { handleError(err, res); }
});

router.delete('/:id', checkId, async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    if (!device) return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    res.json({ message: 'Đã xóa thiết bị' });
  } catch (err) { handleError(err, res); }
});

module.exports = router;
