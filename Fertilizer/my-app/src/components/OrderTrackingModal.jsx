import React, { useState, useEffect, useRef } from 'react';
import { Modal, Steps, Typography, Card, Tag, Button, Spin, Divider, Row, Col, Space, Popconfirm, notification } from 'antd';
import {
  InboxOutlined, CheckCircleOutlined, CarOutlined, HomeOutlined,
  EnvironmentOutlined, PrinterOutlined, CloseCircleOutlined,
  CustomerServiceOutlined, CopyOutlined, ClockCircleOutlined,
  SafetyCertificateOutlined, ArrowRightOutlined
} from '@ant-design/icons';
import { apiService } from '../services/apiService';
import { formatCurrency } from '../utils/formatters';

const { Title, Text, Paragraph } = Typography;

const OrderTrackingModal = ({ open, orderId, onClose, onOrderUpdated }) => {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);

  useEffect(() => {
    if (open && orderId) {
      loadTrackingData(orderId);
    }
  }, [open, orderId]);

  const loadTrackingData = async (id) => {
    setLoading(true);
    try {
      const data = await apiService.trackOrder(id);
      setOrder(data);
      if (data.delivery_location?.latitude && data.delivery_location?.longitude) {
        setTimeout(() => initMiniMap(data.delivery_location.latitude, data.delivery_location.longitude), 300);
      }
    } catch (err) {
      notification.error({
        message: 'Tracking Info Error',
        description: err.message || 'Unable to fetch order tracking details.'
      });
    } finally {
      setLoading(false);
    }
  };

  const initMiniMap = async (lat, lon) => {
    if (!mapRef.current) return;
    if (window.L) {
      renderMap(window.L, lat, lon);
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => renderMap(window.L, lat, lon);
      document.head.appendChild(script);
    }
  };

  const renderMap = (L, lat, lon) => {
    if (!mapRef.current) return;
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([lat, lon], 13);
    leafletMapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

    const icon = L.divIcon({
      html: `<div style="
        width:32px;height:32px;border-radius:50%;background:#2E7D32;
        border:2px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;
      ">📍</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([lat, lon], { icon }).addTo(map);
  };

  const handleCancelOrder = async () => {
    if (!order?.order_id) return;
    setCancelling(true);
    try {
      await apiService.cancelOrder(order.order_id);
      notification.success({
        message: 'Order Cancelled',
        description: `Order ${order.order_id} has been cancelled successfully.`
      });
      loadTrackingData(order.order_id);
      if (onOrderUpdated) onOrderUpdated();
    } catch (err) {
      notification.error({
        message: 'Cancellation Failed',
        description: err.message || 'Could not cancel this order.'
      });
    } finally {
      setCancelling(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!order) return;
    const printWindow = window.open('', '_blank');
    const itemsHtml = (order.items || []).map((item, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>${item.name}</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price || 0}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tax Invoice - ${order.order_id}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; margin: 40px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2E7D32; padding-bottom: 20px; }
          .title { color: #2E7D32; font-size: 26px; font-weight: bold; margin: 0; }
          .subtitle { font-size: 13px; color: #666; margin-top: 4px; }
          .meta-box { margin: 24px 0; background: #f9fdf9; border: 1px solid #e0f2e9; padding: 16px; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #2E7D32; color: #fff; padding: 10px; text-align: left; font-size: 13px; }
          .total-section { margin-top: 24px; width: 320px; margin-left: auto; }
          .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
          .grand-total { font-size: 18px; font-weight: bold; color: #2E7D32; border-top: 2px solid #2E7D32; padding-top: 8px; margin-top: 8px; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">🌱 Bhoomi Bloom</div>
            <div class="subtitle">Smart Agri & Organic Marketplace | GSTIN: 33AAAAA0000A1Z5</div>
            <div class="subtitle">Email: support@bhoomibloom.in | Web: www.bhoomibloom.in</div>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; color: #111;">TAX INVOICE</h2>
            <div style="font-size: 13px; color: #555; margin-top: 4px;">Invoice #: BB-INV-${order.order_id.replace('BB-ORD-', '')}</div>
            <div style="font-size: 13px; color: #555;">Order ID: <strong>${order.order_id}</strong></div>
            <div style="font-size: 13px; color: #555;">Date: ${new Date(order.order_date).toLocaleDateString('en-IN')}</div>
          </div>
        </div>

        <div class="meta-box">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <strong style="color: #2E7D32;">Billed / Shipped To:</strong><br>
              <div style="margin-top: 4px; font-weight: 600;">${order.customer_name}</div>
              <div style="color: #555; max-width: 320px; font-size: 13px; margin-top: 2px;">${order.shipping_address}</div>
            </div>
            <div style="text-align: right;">
              <strong style="color: #2E7D32;">Payment Information:</strong><br>
              <div style="font-size: 13px; margin-top: 4px;">Mode: <strong>${order.payment_method}</strong></div>
              <div style="font-size: 13px;">Status: <strong style="color: #2E7D32;">${order.payment_status}</strong></div>
              <div style="font-size: 13px;">Logistics: <strong>${order.courier_partner}</strong></div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row"><span>Item Subtotal:</span> <strong>₹${order.items_subtotal || 0}</strong></div>
          <div class="total-row"><span>Shipping Charges:</span> <strong style="color: ${order.shipping_charge === 0 ? '#2E7D32' : '#333'}">${order.shipping_charge === 0 ? 'FREE' : '₹' + order.shipping_charge}</strong></div>
          ${order.discount_amount > 0 ? `<div class="total-row" style="color: #2E7D32;"><span>Discount Applied:</span> <strong>-₹${order.discount_amount}</strong></div>` : ''}
          <div class="total-row grand-total"><span>Grand Total:</span> <span>₹${(order.total_amount || 0).toLocaleString()}</span></div>
        </div>

        <div class="footer">
          Thank you for choosing Bhoomi Bloom! This is a computer-generated tax invoice.
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const isCancellable = order && !['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(order.order_status);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={780}
      centered
      destroyOnClose
      style={{ borderRadius: 20 }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 24 }}>
          <Space>
            <CarOutlined style={{ color: '#2E7D32', fontSize: 22 }} />
            <div>
              <Title level={4} style={{ margin: 0, color: '#1B2E1E' }}>Order Tracking & Live Status</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>ID: {orderId}</Text>
            </div>
          </Space>
          {order && (
            <Tag
              color={
                order.order_status === 'Delivered' ? 'success'
                : order.order_status === 'Cancelled' ? 'error'
                : order.order_status === 'Out for Delivery' ? 'purple'
                : 'processing'
              }
              style={{ fontSize: 13, padding: '4px 12px', borderRadius: 12, fontWeight: 700 }}
            >
              {order.order_status}
            </Tag>
          )}
        </div>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#666' }}>Fetching live order tracking data...</div>
        </div>
      ) : !order ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
          Order details not found.
        </div>
      ) : (
        <div style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: 4 }}>
          {/* ─── Top Banner: Estimated Arrival & Carrier ─── */}
          <div style={{
            background: order.order_status === 'Cancelled' ? '#fff1f0' : 'linear-gradient(135deg, #f0fdf4 0%, #e6f4ea 100%)',
            border: `1px solid ${order.order_status === 'Cancelled' ? '#ffa39e' : '#bbf7d0'}`,
            borderRadius: 16, padding: '16px 20px', marginBottom: 20
          }}>
            <Row gutter={[16, 12]} align="middle">
              <Col xs={24} sm={14}>
                <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                  {order.order_status === 'Cancelled' ? 'Status' : 'Estimated Delivery'}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: order.order_status === 'Cancelled' ? '#cf1322' : '#2E7D32', marginTop: 2 }}>
                  {order.order_status === 'Cancelled' ? 'Order Cancelled' : order.estimated_delivery}
                </div>
                {order.order_status !== 'Cancelled' && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    🚚 Carrier: <strong>{order.courier_partner}</strong> | Tracking #{order.tracking_number}
                  </Text>
                )}
              </Col>
              <Col xs={24} sm={10} style={{ textAlign: 'right' }}>
                <Space>
                  <Button
                    icon={<PrinterOutlined />}
                    onClick={handlePrintInvoice}
                    style={{ borderRadius: 8, fontWeight: 600 }}
                  >
                    Invoice
                  </Button>
                  {isCancellable && (
                    <Popconfirm
                      title="Cancel this order?"
                      description="Are you sure you want to cancel? Items will be returned to stock."
                      onConfirm={handleCancelOrder}
                      okText="Yes, Cancel"
                      cancelText="No"
                      okButtonProps={{ danger: true, loading: cancelling }}
                    >
                      <Button danger icon={<CloseCircleOutlined />} style={{ borderRadius: 8 }}>
                        Cancel
                      </Button>
                    </Popconfirm>
                  )}
                </Space>
              </Col>
            </Row>
          </div>

          {/* ─── Flipkart-Style Vertical Stepper ─── */}
          <Card title="Live Shipment Timeline" size="small" style={{ borderRadius: 14, marginBottom: 20 }}>
            <div style={{ padding: '8px 12px' }}>
              <Steps
                direction="vertical"
                size="small"
                current={order.timeline.findIndex(t => t.current)}
                items={order.timeline.map((step) => ({
                  title: (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: step.completed ? 700 : 500, color: step.completed ? '#2E7D32' : '#888' }}>
                        {step.title}
                      </span>
                      <span style={{ fontSize: 11, color: '#888', marginLeft: 12 }}>{step.time}</span>
                    </div>
                  ),
                  description: (
                    <div style={{ fontSize: 12, color: step.completed ? '#555' : '#aaa', marginTop: 2 }}>
                      {step.description}
                    </div>
                  ),
                  status: step.completed ? 'finish' : step.current ? 'process' : 'wait',
                }))}
              />
            </div>
          </Card>

          {/* ─── Delivery Location & Map Snapshot ─── */}
          <Card title="Delivery Address & Map" size="small" style={{ borderRadius: 14, marginBottom: 20 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={14}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <EnvironmentOutlined style={{ color: '#2E7D32', fontSize: 20, marginTop: 2 }} />
                  <div>
                    <Text strong style={{ fontSize: 14, color: '#1B2E1E', display: 'block' }}>
                      {order.customer_name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4, lineHeight: 1.4 }}>
                      {order.shipping_address}
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Tag color="green">📍 Verified Delivery Destination</Tag>
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={10}>
                <div
                  ref={mapRef}
                  style={{
                    width: '100%', height: 120, borderRadius: 10,
                    background: '#e8f5e9', overflow: 'hidden', border: '1px solid #c8e6c9'
                  }}
                />
              </Col>
            </Row>
          </Card>

          {/* ─── Ordered Items ─── */}
          <Card title="Shipment Contents" size="small" style={{ borderRadius: 14, marginBottom: 20 }}>
            {(order.items || []).map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx < order.items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    🌱
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 13 }}>{item.name}</Text>
                    <div style={{ fontSize: 11, color: '#888' }}>
                      Qty: <strong>{item.quantity}</strong> × {formatCurrency(item.price || 0)}
                    </div>
                  </div>
                </div>
                <Text strong style={{ color: '#2E7D32', fontSize: 14 }}>
                  {formatCurrency((item.price || 0) * (item.quantity || 1))}
                </Text>
              </div>
            ))}
          </Card>

          {/* ─── Payment & Total Breakdown ─── */}
          <Card title="Payment & Price Breakdown" size="small" style={{ borderRadius: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <Text type="secondary">Items Subtotal</Text>
              <Text strong>{formatCurrency(order.items_subtotal || 0)}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <Text type="secondary">Delivery Fee</Text>
              <Text strong style={{ color: order.shipping_charge === 0 ? '#52C41A' : '#333' }}>
                {order.shipping_charge === 0 ? 'FREE ✅' : formatCurrency(order.shipping_charge)}
              </Text>
            </div>
            {order.discount_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#2E7D32' }}>
                <Text style={{ color: '#2E7D32' }}>Discounts & Offers</Text>
                <Text strong style={{ color: '#2E7D32' }}>- {formatCurrency(order.discount_amount)}</Text>
              </div>
            )}
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16 }}>
              <Text strong>Total Amount Paid</Text>
              <Title level={4} style={{ margin: 0, color: '#2E7D32' }}>{formatCurrency(order.total_amount || 0)}</Title>
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: '#888', textAlign: 'right' }}>
              Paid via <strong>{order.payment_method}</strong> ({order.payment_status})
            </div>
          </Card>
        </div>
      )}
    </Modal>
  );
};

export default OrderTrackingModal;
