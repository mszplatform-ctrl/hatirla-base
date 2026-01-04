const referralService = require('./referral.service');

class ReferralController {
  async getReferralByCode(req, res) {
    try {
      const referral = await referralService.getReferralByCode(req.params.code);
      res.json(referral);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  async getUserReferrals(req, res) {
    try {
      const referrals = await referralService.getUserReferrals(req.params.userId);
      res.json(referrals);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async generateReferral(req, res) {
    try {
      const referral = await referralService.generateReferral(req.body.userId);
      res.status(201).json(referral);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new ReferralController();