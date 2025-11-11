const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        debug: process.env.NODE_ENV === 'development' ? 'No token in Authorization header' : undefined
      });
    }

    const decoded = verifyToken(token);
    console.log('decoded', decoded);

    // Check if user still exists and is active
    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        debug: process.env.NODE_ENV === 'development' ? `User lookup failed for ID: ${decoded.id}` : undefined
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('authorize', req.user);
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Specific role middlewares
const requireAdmin = authorize('admin');
const requireCustomer = authorize('customer');
const requireAdminOrCustomer = authorize('admin', 'customer');

module.exports = {
  authenticate,
  authorize,
  requireAdmin,
  requireCustomer,
  requireAdminOrCustomer
};
