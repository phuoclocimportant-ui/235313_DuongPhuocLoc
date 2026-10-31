require('dotenv').config();
const mongoose = require('mongoose');
const Device = require('./models/Device');

const samples = [
  { deviceId: 'MC001', name: 'Máy chiếu Epson EB-X06', deviceType: 'Máy chiếu', room: 'A101', brand: 'Epson', model: 'EB-X06', quantity: 1, status: 'Đang sử dụng', purchaseDate: '2023-08-15', description: 'Máy chiếu phòng A101' },
  { deviceId: 'PC001', name: 'Máy tính Dell OptiPlex 3080', deviceType: 'Máy tính', room: 'B202', brand: 'Dell', model: 'OptiPlex 3080', quantity: 30, status: 'Đang sử dụng', purchaseDate: '2022-09-01', description: 'Máy tính phòng thực hành' },
  { deviceId: 'AM001', name: 'Loa Bluetooth JBL', deviceType: 'Âm thanh', room: 'A102', brand: 'JBL', model: 'PartyBox 110', quantity: 2, status: 'Hư hỏng', purchaseDate: '2023-01-20', description: 'Loa bị rè tiếng' },
  { deviceId: 'MC002', name: 'Máy chiếu Sony VPL', deviceType: 'Máy chiếu', room: 'C303', brand: 'Sony', model: 'VPL-DX221', quantity: 1, status: 'Đang sửa chữa', purchaseDate: '2021-05-10', description: 'Đang thay bóng đèn' },
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const d of samples) {
    await Device.updateOne({ deviceId: d.deviceId }, { $set: d }, { upsert: true });
  }
  console.log('Đã thêm dữ liệu mẫu:', await Device.countDocuments(), 'thiết bị');
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
