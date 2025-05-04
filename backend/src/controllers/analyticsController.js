// controllers/analyticsController.js
import { Order } from '../models/order.model.js';
import { User } from '../models/user.model.js';
import { Provider } from '../models/provider.model.js';
import { Service } from '../models/service.model.js';

export const getAnalytics = async (req, res) => {
  try {
    // Get date range (last 30 days by default)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Get total counts
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProviders = await Provider.countDocuments();
    const totalServices = await Service.countDocuments();

    // Get orders for the date range
    const recentOrders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Calculate revenue
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]);

    // Revenue by service
    const revenueByService = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'serviceData',
        },
      },
      { $unwind: '$serviceData' },
      {
        $group: {
          _id: '$serviceData.name',
          revenue: { $sum: '$grandTotal' },
          count: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    // Order status distribution
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format order status data properly
    const formattedOrdersByStatus = ordersByStatus.map((item) => ({
      name: item._id || 'unknown',
      count: item.count,
    }));

    // Top providers by rating
    const topProviders = await Provider.find({ isActive: true })
      .sort({ rating: -1 })
      .limit(5)
      .select('name rating');

    // Orders by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const ordersByMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$grandTotal' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format orders by month data
    const formattedOrdersByMonth = ordersByMonth.map((item) => ({
      month: item._id.month,
      year: item._id.year,
      count: item.count,
      revenue: item.revenue,
    }));

    // Popular services
    const popularServices = await Order.aggregate([
      {
        $group: {
          _id: '$service',
          orderCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'serviceData',
        },
      },
      { $unwind: '$serviceData' },
      {
        $project: {
          name: '$serviceData.name',
          orderCount: 1,
        },
      },
      { $sort: { orderCount: -1 } },
      { $limit: 5 },
    ]);

    // Recent activities
    const recentActivities = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name')
      .populate('service', 'name')
      .select('createdAt status grandTotal');

    // Calculate average order value
    const averageOrderValue = totalRevenue[0]?.total
      ? totalRevenue[0].total / totalOrders
      : 0;

    // Get payment method distribution
    const paymentMethodDistribution = await Order.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedPaymentMethods = paymentMethodDistribution.map((item) => ({
      name: item._id || 'unknown',
      count: item.count,
    }));

    // Get completed orders for conversion rate
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const conversionRate =
      totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalOrders,
          totalUsers,
          totalProviders,
          totalServices,
          totalRevenue: totalRevenue[0]?.total || 0,
          averageOrderValue,
          conversionRate: conversionRate.toFixed(2),
        },
        revenueByService: revenueByService.map((item) => ({
          name: item._id,
          revenue: item.revenue,
          count: item.count,
        })),
        ordersByStatus: formattedOrdersByStatus,
        topProviders: topProviders.map((provider) => ({
          id: provider._id,
          name: provider.name,
          rating: provider.rating,
        })),
        ordersByMonth: formattedOrdersByMonth,
        popularServices: popularServices.map((service) => ({
          id: service._id,
          name: service.name,
          orderCount: service.orderCount,
        })),
        paymentMethods: formattedPaymentMethods,
        recentActivities: recentActivities.map((activity) => ({
          orderId: activity._id,
          userName: activity.user?.name || 'Unknown User',
          serviceName: activity.service?.name || 'Unknown Service',
          status: activity.status,
          amount: activity.grandTotal,
          date: activity.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message,
    });
  }
};
