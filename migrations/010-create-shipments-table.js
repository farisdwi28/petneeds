'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('shipments', {
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
      tracking_number: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      carrier: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      service_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'pickup', 'in_transit', 'delivered', 'failed', 'returned'),
        allowNull: false,
        defaultValue: 'pending'
      },
      estimated_delivery: {
        type: Sequelize.DATE,
        allowNull: true
      },
      actual_delivery: {
        type: Sequelize.DATE,
        allowNull: true
      },
      weight_grams: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      dimensions: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      origin_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      destination_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      shipping_cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      tracking_history: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.addIndex('shipments', ['order_id']);
    await queryInterface.addIndex('shipments', ['tracking_number'], { unique: true });
    await queryInterface.addIndex('shipments', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('shipments');
  }
};
