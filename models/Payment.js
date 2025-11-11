const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
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
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  payment_method: {
    type: DataTypes.ENUM('midtrans', 'bank_transfer', 'credit_card', 'ewallet'),
    allowNull: false
  },
  midtrans_transaction_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  midtrans_order_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  midtrans_payment_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'IDR'
  },
  status: {
    type: DataTypes.ENUM('pending', 'settlement', 'capture', 'cancel', 'deny', 'expire', 'failure', 'refund', 'partial_refund'),
    defaultValue: 'pending'
  },
  fraud_status: {
    type: DataTypes.ENUM('accept', 'challenge', 'deny'),
    allowNull: true
  },
  payment_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expiry_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  payment_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  qr_string: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  va_numbers: {
    type: DataTypes.JSON,
    allowNull: true
  },
  bill_key: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  biller_code: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  permata_va_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  signature_key: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  raw_response: {
    type: DataTypes.JSON,
    allowNull: true
  },
  webhook_logs: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'payments',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ['midtrans_transaction_id']
    },
    {
      fields: ['order_id']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Payment;
