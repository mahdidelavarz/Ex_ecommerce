'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface OrderDetails {
  id: string;
  orderNumber: string;
  user: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  trackingNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  orderId: string;
}

export function AdminOrderDetails({ orderId }: Props) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/v1/admin/orders/${orderId}`);
      const data = await response.json();
      setOrder(data);
      setTrackingNumber(data.trackingNumber || '');
      setNotes(data.notes || '');
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      await fetch(`/api/v1/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrderDetails();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const updateTracking = async () => {
    try {
      await fetch(`/api/v1/admin/orders/${orderId}/tracking`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber }),
      });
      alert('Tracking number updated!');
    } catch (error) {
      console.error('Failed to update tracking:', error);
    }
  };

  const updateNotes = async () => {
    try {
      await fetch(`/api/v1/admin/orders/${orderId}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      alert('Notes saved!');
    } catch (error) {
      console.error('Failed to update notes:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading order details...</div>;
  }

  if (!order) {
    return <div className="text-center py-8 text-red-600">Order not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">Order #{order.orderNumber}</h2>
            <p className="text-gray-600 text-sm">
              Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy h:mm a')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => updateStatus('processing')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Process Order
            </button>
            <button
              onClick={() => updateStatus('shipped')}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Mark as Shipped
            </button>
            <button
              onClick={() => updateStatus('delivered')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Mark Delivered
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Customer Information</h3>
          <div className="space-y-2">
            <p className="font-medium">{order.user.name}</p>
            <p className="text-gray-600">{order.user.email}</p>
            <p className="text-gray-600">{order.user.phone}</p>
            <div className="pt-2">
              <p className="font-medium">Shipping Address:</p>
              <p className="text-gray-600">
                {order.user.address.street}<br />
                {order.user.address.city}, {order.user.address.state} {order.user.address.zipCode}<br />
                {order.user.address.country}
              </p>
            </div>
          </div>
        </div>

        {/* Order Status & Tracking */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Order Status</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={order.status}
                onChange={(e) => updateStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Payment Status</label>
              <div className={`px-3 py-2 rounded-md ${
                order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {order.paymentStatus.toUpperCase()} - {order.paymentMethod}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tracking Number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="Enter tracking number"
                />
                <button
                  onClick={updateTracking}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>${order.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-lg">Order Items</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.quantity}</td>
                <td className="px-6 py-4 text-sm text-gray-500">${item.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm font-medium">${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Admin Notes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-lg mb-4">Internal Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Add internal notes about this order..."
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={updateNotes}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Save Notes
          </button>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-end">
        <Link
          href="/admin/orders"
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back to Orders
        </Link>
      </div>
    </div>
  );
}