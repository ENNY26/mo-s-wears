// admin/AdminOrders.jsx
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, updateDoc, doc, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { toast } from 'react-toastify';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId, newStatus, note = '') => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const order = orders.find(o => o.id === orderId);
      
      await updateDoc(orderRef, {
        status: newStatus,
        statusHistory: [
          ...(order.statusHistory || []),
          {
            status: newStatus,
            timestamp: new Date(),
            note: note || `Order ${newStatus}`
          }
        ],
        updatedAt: new Date()
      });

      // Send email notification (you'll need to implement this)
      await sendStatusEmail(orderId, newStatus, order.userEmail, order.userName);

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const sendStatusEmail = async (orderId, status, userEmail, userName) => {
    try {
      // Implement email sending logic here
      // You can use EmailJS, SendGrid, or any other email service
      console.log(`Email sent to ${userEmail}: Order ${orderId} status changed to ${status}`);
    } catch (error) {
      console.error('Error sending status email:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'placed': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusOptions = (currentStatus) => {
    const statusFlow = {
      placed: ['confirmed', 'processing', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['out_for_delivery', 'delivered'],
      out_for_delivery: ['delivered'],
      delivered: [],
      cancelled: []
    };
    return statusFlow[currentStatus] || [];
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Order Management ({filteredOrders.length} orders)
        </h2>
        
        {/* Filter Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'all' 
                ? 'bg-black text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('placed')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'placed' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Placed
          </button>
          <button
            onClick={() => setFilter('processing')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'processing' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setFilter('shipped')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'shipped' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Shipped
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'delivered' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Delivered
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Order #{order.id.slice(-8).toUpperCase()}
                </h3>
                <p className="text-gray-600">
                  Customer: {order.userEmail}
                </p>
                <p className="text-gray-600 text-sm">
                  Placed: {order.createdAt.toLocaleString()}
                </p>
                <p className="text-gray-600 text-sm">
                  Payment: {order.paymentMethod || 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  ${order.total?.toFixed(2)}
                </p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {formatStatus(order.status)}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Items</h4>
              <div className="space-y-2">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 text-sm">
                    <img
                      src={item.imageUrls?.[0]}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-gray-600">
                        Size: {item.selectedSize} • Qty: {item.quantity} • ${item.price?.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-1">Shipping Address</h4>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.name}<br />
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                  {order.shippingAddress.phone && `Phone: ${order.shippingAddress.phone}`}
                </p>
              </div>
            )}

            {/* Status Management */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Update Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {getStatusOptions(order.status).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(order.id, status)}
                        className="px-3 py-1 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors duration-200"
                      >
                        Mark as {formatStatus(status)}
                      </button>
                    ))}
                    {getStatusOptions(order.status).length === 0 && (
                      <span className="text-sm text-gray-500">No further actions available</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {selectedOrder?.id === order.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              {/* Status History */}
              {selectedOrder?.id === order.id && (
                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Status History</h5>
                  <div className="space-y-2">
                    {order.statusHistory?.map((history, index) => (
                      <div key={index} className="flex items-center space-x-3 text-sm">
                        <span className={`w-3 h-3 rounded-full ${getStatusColor(history.status).split(' ')[0]}`}></span>
                        <span className="font-medium">{formatStatus(history.status)}</span>
                        <span className="text-gray-500">
                          {history.timestamp?.toDate().toLocaleString()}
                        </span>
                        {history.note && (
                          <span className="text-gray-600">- {history.note}</span>
                        )}
                      </div>
                    ))}
                    {(!order.statusHistory || order.statusHistory.length === 0) && (
                      <p className="text-gray-500 text-sm">No status history available</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'No orders have been placed yet.' 
                : `No orders with status "${filter}" found.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;