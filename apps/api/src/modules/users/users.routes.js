const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');

router.get('/:id', usersController.getProfile);
router.post('/', usersController.createUser);

module.exports = router;