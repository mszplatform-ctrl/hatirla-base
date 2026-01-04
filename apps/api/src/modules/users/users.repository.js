const db = require('../../db');

class UsersRepository {
  async findById(id) {
    // Mock DB'den user bul (id string olabilir, parseInt yapıyoruz)
    const user = db.users.find(u => u.id === parseInt(id));
    return user || null;
  }

  async create({ email, name }) {
    // Yeni user oluştur
    const newUser = {
      id: db.users.length + 1,
      email,
      name
    };
    db.users.push(newUser);
    return newUser;
  }
}

module.exports = new UsersRepository();