const midtransClient = require('midtrans-client');

// Initialize Snap API
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_SANDBOX !== 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// Initialize Core API for status checking
const core = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_SANDBOX !== 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

const createTransaction = async (transactionDetails) => {
  try {
    const transaction = await snap.createTransaction(transactionDetails);
    return {
      success: true,
      data: transaction
    };
  } catch (error) {
    console.error('Midtrans create transaction error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const getTransactionStatus = async (orderId) => {
  try {
    const status = await core.transaction.status(orderId);
    return {
      success: true,
      data: status
    };
  } catch (error) {
    console.error('Midtrans get status error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const cancelTransaction = async (orderId) => {
  try {
    const result = await core.transaction.cancel(orderId);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Midtrans cancel error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const expireTransaction = async (orderId) => {
  try {
    const result = await core.transaction.expire(orderId);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Midtrans expire error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const refundTransaction = async (orderId, refundDetails) => {
  try {
    const result = await core.transaction.refund(orderId, refundDetails);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Midtrans refund error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  snap,
  core,
  createTransaction,
  getTransactionStatus,
  cancelTransaction,
  expireTransaction,
  refundTransaction
};
