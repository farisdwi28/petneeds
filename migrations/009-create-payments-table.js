'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      payment_method: {
        type: Sequelize.ENUM('midtrans', 'bank_transfer', 'credit_card', 'ewallet'),
        allowNull: false
      },
      midtrans_transaction_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true
      },
      midtrans_order_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      midtrans_payment_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'IDR'
      },
      status: {
        type: Sequelize.ENUM('pending', 'settlement', 'capture', 'cancel', 'deny', 'expire', 'failure', 'refund', 'partial_refund'),
        allowNull: false,
        defaultValue: 'pending'
      },
      fraud_status: {
        type: Sequelize.ENUM('accept', 'challenge', 'deny'),
        allowNull: true
      },
      payment_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      expiry_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      payment_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      qr_string: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      va_numbers: {
        type: Sequelize.JSON,
        allowNull: true
      },
      bill_key: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      biller_code: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      permata_va_number: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      signature_key: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      raw_response: {
        type: Sequelize.JSON,
        allowNull: true
      },
      webhook_logs: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('payments', ['order_id']);
    await queryInterface.addIndex('payments', ['user_id']);
    await queryInterface.addIndex('payments', ['midtrans_transaction_id'], { unique: true });
    await queryInterface.addIndex('payments', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('payments');
  }
};
