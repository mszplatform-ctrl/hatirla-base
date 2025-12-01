// apps/api/src/db.js

// Mock veritabanı
const referrals = [
  { id: 1, code: 'REF123', userId: 1 },
  { id: 2, code: 'REF456', userId: 2 },
];

const users = [
  { id: 1, email: 'ali@hatirla.ai', name: 'Ali' },
  { id: 2, email: 'ayse@hatirla.ai', name: 'Ayşe' },
];

module.exports = {
  referrals,
  users,
};
