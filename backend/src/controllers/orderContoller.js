import { Order } from '../models/order.model.js';
import { Service } from '../models/service.model.js';

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
    } = req.body;

    console.log('💻 Create Order Request:');
    console.log('Service ID:', serviceId);
    console.log('Selected Options:', JSON.stringify(selectedOptions, null, 2));

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
      console.log('❌ Service not found with ID:', serviceId);
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    console.log('✅ Service found:', service.name);
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
          console.log('❌ Available option IDs:');
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
      });

      await order.save();
      console.log('✅ Order saved successfully!');

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order,
      });
    } catch (error) {
      console.error('❌ Error validating options:', error.message);
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

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('service', 'name description price type')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if the order belongs to the current user or user is admin
    if (order.user._id.toString() !== req.userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: This order does not belong to you',
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
      message: 'Error retrieving order details',
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

// Update order status
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

    // Check if the order belongs to the current user
    if (order.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: This order does not belong to you',
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

// Cancel order
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

    // Check if the order belongs to the current user
    if (order.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: This order does not belong to you',
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

// Handle payment status updates
export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    if (
      !paymentStatus ||
      !['pending', 'processing', 'completed', 'failed'].includes(paymentStatus)
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

    order.paymentStatus = paymentStatus;

    // If payment completed, update order status to confirmed
    if (paymentStatus === 'completed' && order.status === 'pending') {
      order.status = 'confirmed';
    }

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

// Get admin dashboard orders (admin only)
export const getAdminOrders = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required',
      });
    }

    const { status, limit = 10, page = 1 } = req.query;

    const query = {};
    if (status) {
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
