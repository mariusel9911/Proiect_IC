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
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            });
        }

        // Verify the selected options exist in the service
        const optionsMap = new Map();
        service.options.forEach((option) => {
            optionsMap.set(option._id.toString(), option);
        });

        const validatedOptions = selectedOptions.map((option) => {
            const serviceOption = optionsMap.get(option.optionId);
            if (!serviceOption) {
                throw new Error(
                    `Option with ID ${option.optionId} not found in this service`
                );
            }

            return {
                optionId: option.optionId,
                name: serviceOption.name,
                price: serviceOption.price,
                quantity: option.quantity,
            };
        });

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

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order,
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating order',
        });
    }
};

// Get all orders for a user
export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.userId })
            .populate('service', 'name description type')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
        });
    }
};

// Get a single order by ID
export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId).populate(
            'service',
            'name description type options'
        );

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

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
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