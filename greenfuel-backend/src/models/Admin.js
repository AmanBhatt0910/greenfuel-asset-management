const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

const Admin = sequelize.define('Admin', {
  id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: true },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'admin' },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
}, {
  timestamps: true,
});

module.exports = Admin;
