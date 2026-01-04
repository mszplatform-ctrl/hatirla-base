const db = require('../../db');

class ReferralRepository {
  async findByCode(code) {
    const referral = db.referrals.find(r => r.code === code);
    return referral || null;
  }

  async findByUserId(userId) {
    const referrals = db.referrals.filter(r => r.userId === parseInt(userId));
    return referrals;
  }

  async create({ code, userId }) {
    const newReferral = {
      id: db.referrals.length + 1,
      code,
      userId: parseInt(userId)
    };
    db.referrals.push(newReferral);
    return newReferral;
  }
}

module.exports = new ReferralRepository();