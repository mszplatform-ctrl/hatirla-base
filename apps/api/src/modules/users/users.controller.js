const usersService = require('./users.service');

class UsersController {
  async getProfile(req, res) {
    try {
      const user = await usersService.getUserProfile(req.params.id);
      res.json(user);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  async createUser(req, res) {
    try {
      const user = await usersService.createUser(req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new UsersController();