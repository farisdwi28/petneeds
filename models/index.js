const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const Address = require('./Address');
const Cart = require('./Cart');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');
const Shipment = require('./Shipment');

// Define associations

// User associations
User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' });
User.hasMany(Cart, { foreignKey: 'user_id', as: 'cartItems' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });

// Category associations
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

// Product associations
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
Product.hasMany(Cart, { foreignKey: 'product_id', as: 'cartItems' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });

// ProductImage associations
ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Address associations
Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Address.hasMany(Order, { foreignKey: 'address_id', as: 'orders' });

// Cart associations
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Cart.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Order associations
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
Order.hasOne(Payment, { foreignKey: 'order_id', as: 'payment' });
Order.hasOne(Shipment, { foreignKey: 'order_id', as: 'shipment' });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Payment associations
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Shipment associations
Shipment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Sync database (only in development, commented out for production)
// if (process.env.NODE_ENV === 'development') {
//   sequelize.sync({ alter: true });
// }

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  ProductImage,
  Address,
  Cart,
  Order,
  OrderItem,
  Payment,
  Shipment
};
