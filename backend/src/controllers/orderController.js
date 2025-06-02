import { Order } from '../models/order.model.js';
import { Service } from '../models/service.model.js';
import { User } from '../models/user.model.js';

// Create a new order/checkout
export const createOrder = async (req, res) => {
  try {
    const {
      serviceId,
      selectedOptions,
      totalAmount,
      tax,
      grandTotal,
      address,
      scheduledDate,
      timeSlot,
      paymentMethod,
      paypalOrderId,
    } = req.body;

    console.log('💻 Create Order Request:');
    console.log('Service ID:', serviceId);
    console.log('Selected Options:', JSON.stringify(selectedOptions, null, 2));
    console.log('Payment Method:', paymentMethod);

    if (
      !serviceId ||
      !selectedOptions ||
      !Array.isArray(selectedOptions) ||
      selectedOptions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Verify the service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      console.log('Service not found with ID:', serviceId);
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    console.log('Service found:', service.name);
    console.log('Service options:', JSON.stringify(service.options, null, 2));

    // Create a map for easier option lookup
    const optionsMap = new Map();
    service.options.forEach((option) => {
      optionsMap.set(option._id.toString(), option);
      console.log(
        `Option ID map entry: ${option._id.toString()} -> ${option.name}`
      );
    });

    // Verify the selected options exist in the service and prepare validated options
    try {
      const validatedOptions = [];

      for (const option of selectedOptions) {
        console.log(`Looking for option with ID: ${option.optionId}`);

        // First try direct lookup from map
        let serviceOption = optionsMap.get(option.optionId);

        // If not found, try to find it by matching string versions
        if (!serviceOption) {
          console.log(
            'Option not found in map, trying to find by ID matching...'
          );

          serviceOption = service.options.find((opt) => {
            const optId = opt._id.toString();
            const requestedId = option.optionId.toString();

            console.log(`Comparing: ${optId} with ${requestedId}`);
            return optId === requestedId || opt.id === option.optionId;
          });
        }

        if (!serviceOption) {
          // If still not found, log available options and throw error
          console.log('Not Available option IDs:');
          service.options.forEach((opt) =>
            console.log(`- ${opt._id} (${opt.name})`)
          );

          throw new Error(
            `Option with ID ${option.optionId} not found in this service`
          );
        }

        console.log(`✅ Found option: ${serviceOption.name}`);

        validatedOptions.push({
          optionId: serviceOption._id,
          name: serviceOption.name,
          price: serviceOption.price,
          quantity: option.quantity,
        });
      }

      // Prepare payment details based on payment method
      const paymentDetails = {};

      // If PayPal payment, store PayPal order ID
      if (paymentMethod === 'paypal' && paypalOrderId) {
        paymentDetails.paypalOrderId = paypalOrderId;
      }

      // Create the order
      const order = new Order({
        user: req.userId,
        service: serviceId,
        selectedOptions: validatedOptions,
        totalAmount: totalAmount || 0,
        tax: tax || 0,
        grandTotal: grandTotal || 0,
        address: address || {},
        scheduledDate: scheduledDate || new Date(),
        timeSlot: timeSlot || { start: '09:00', end: '12:00' },
        paymentMethod: paymentMethod || 'card',
        paymentStatus: paymentMethod === 'paypal' ? 'processing' : 'pending',
        paymentDetails:
          Object.keys(paymentDetails).length > 0 ? paymentDetails : undefined,
      });

      await order.save();
      console.log('Order saved successfully!');

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order,
      });
    } catch (error) {
      console.error('Error validating options:', error.message);
      throw error;
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating order',
    });
  }
};

// Handle payment status updates including PayPal
export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const {
      paymentStatus,
      paypalOrderId,
      paypalPayerId,
      paypalCapture,
      transactionId,
    } = req.body;

    if (
      !paymentStatus ||
      !['pending', 'processing', 'completed', 'failed', 'refunded'].includes(
        paymentStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status',
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if the order belongs to the current user
    if (order.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: This order does not belong to you',
      });
    }

    // Update payment status
    order.paymentStatus = paymentStatus;

    // Update payment details if provided
    if (!order.paymentDetails) {
      order.paymentDetails = {};
    }

    // Set timestamp for payment update
    order.paymentDetails.timestamp = new Date();

    // Update PayPal specific details if available
    if (order.paymentMethod === 'paypal') {
      if (paypalOrderId) {
        order.paymentDetails.paypalOrderId = paypalOrderId;
      }

      if (paypalPayerId) {
        order.paymentDetails.paypalPayerId = paypalPayerId;
      }

      if (paypalCapture) {
        order.paymentDetails.paypalCapture = paypalCapture;
      }
    }

    // Set transaction ID if provided
    if (transactionId) {
      order.paymentDetails.transactionId = transactionId;
    }

    // Save order with updated payment info
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      order,
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment status',
    });
  }
};

// In orderController.js at line 258
// Update getOrderById function in orderController.js
export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    console.log('Getting order details for ID:', orderId);

    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('service', 'name description price type imageUrl')
      .exec();

    if (!order) {
      console.log('Order not found with ID:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Find user to check if admin
    const user = await User.findById(req.userId);
    const isAdmin = user?.isAdmin || false;
    const isOwner =
      req.userId &&
      order.user &&
      (typeof order.user === 'object'
        ? order.user._id.toString() === req.userId
        : order.user.toString() === req.userId);

    console.log('Request user ID:', req.userId);
    console.log(
      'Order user ID:',
      typeof order.user === 'object' ? order.user._id : order.user
    );
    console.log('Is owner:', isOwner);
    console.log('Is admin:', isAdmin);

    if (!isOwner && !isAdmin) {
      console.log('Unauthorized access attempt');
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only view your own orders',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error getting order details:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting order details',
    });
  }
};
// Verify PayPal payment complete
export const verifyPayPalPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paypalOrderId, paypalPayerId, captureId, captureStatus } = req.body;

    if (!paypalOrderId || !captureId) {
      return res.status(400).json({
        success: false,
        message: 'Missing PayPal details',
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if the order belongs to the current user
    if (order.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: This order does not belong to you',
      });
    }

    // Ensure it's a PayPal payment
    if (order.paymentMethod !== 'paypal') {
      return res.status(400).json({
        success: false,
        message: 'This order is not using PayPal payment',
      });
    }

    // Update order with PayPal details
    if (!order.paymentDetails) {
      order.paymentDetails = {};
    }

    order.paymentDetails.paypalOrderId = paypalOrderId;
    order.paymentDetails.paypalPayerId = paypalPayerId;
    order.paymentDetails.paypalCapture = {
      id: captureId,
      status: captureStatus,
    };
    order.paymentDetails.timestamp = new Date();

    // Update payment status based on capture status
    if (captureStatus === 'COMPLETED') {
      order.paymentStatus = 'completed';
      // Order status will be updated automatically by the pre-save middleware
    } else if (captureStatus === 'DECLINED') {
      order.paymentStatus = 'failed';
    } else {
      order.paymentStatus = 'processing';
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'PayPal payment verification processed',
      order,
    });
  } catch (error) {
    console.error('Error verifying PayPal payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying PayPal payment',
    });
  }
};

// Get all orders for current user
export const getUserOrders = async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;

    const query = { user: req.userId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('service', 'name type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
    });
  }
};

// In orderController.js - updateOrderStatus function
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (
      !status ||
      ![
        'pending',
        'confirmed',
        'in-progress',
        'completed',
        'cancelled',
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if the user is admin (directly from the database)
    const user = await User.findById(req.userId);
    const isAdmin = user?.isAdmin || false;

    // Allow if user is admin OR the order owner
    if (!isAdmin && order.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message:
          'Unauthorized: You do not have permission to update this order',
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
    });
  }
};
// In orderController.js - cancelOrder function
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if the user is admin (directly from the database)
    const user = await User.findById(req.userId);
    const isAdmin = user?.isAdmin || false;

    // Allow if user is admin OR the order owner
    if (!isAdmin && order.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message:
          'Unauthorized: You do not have permission to cancel this order',
      });
    }

    // Only allow cancellation if the order is in pending or confirmed status
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
    });
  }
};

// Get admin dashboard orders (admin only)
export const getAdminOrders = async (req, res) => {
  try {
    // Check if user is admin - this is a double check in case middleware fails
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required',
      });
    }

    const { status, limit = 10, page = 1 } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('service', 'name type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
    });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order first
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user is admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required to delete orders',
      });
    }

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting order',
    });
  }
};
