const usersRepository = require('./users.repository');

class UsersService {
  async getUserProfile(id) {
    const user = await usersRepository.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  async createUser(data) {
    if (!data.email) throw new Error('Email required');
    return usersRepository.create(data);
  }
}

module.exports = new UsersService();