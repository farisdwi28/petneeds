const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Shipment = sequelize.define('Shipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  tracking_number: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  carrier: {
    type: DataTypes.STRING(100),
    allowNull: false // e.g., 'JNE', 'TIKI', 'POS Indonesia'
  },
  service_type: {
    type: DataTypes.STRING(50),
    allowNull: true // e.g., 'REG', 'YES', 'ONS'
  },
  status: {
    type: DataTypes.ENUM('pending', 'pickup', 'in_transit', 'delivered', 'failed', 'returned'),
    defaultValue: 'pending'
  },
  estimated_delivery: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actual_delivery: {
    type: DataTypes.DATE,
    allowNull: true
  },
  weight_grams: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  dimensions: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  origin_address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  destination_address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  shipping_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  tracking_history: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'shipments',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ['tracking_number']
    },
    {
      fields: ['order_id']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Shipment;
