const referralRepository = require('./referral.repository');

class ReferralService {
  async getReferralByCode(code) {
    const referral = await referralRepository.findByCode(code);
    if (!referral) throw new Error('Referral not found');
    return referral;
  }

  async getUserReferrals(userId) {
    return await referralRepository.findByUserId(userId);
  }

  async generateReferral(userId) {
    if (!userId) throw new Error('userId required');
    
    // Generate referral code
    const code = 'REF' + Math.floor(Math.random() * 100000);
    
    return await referralRepository.create({ code, userId });
  }
}

module.exports = new ReferralService();