import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Button, Spin, Typography, Tag, Space, Alert, Input, List, Divider } from 'antd';
import {
  EnvironmentOutlined, AimOutlined, CheckCircleOutlined,
  SearchOutlined, LoadingOutlined, CompassOutlined
} from '@ant-design/icons';
import { useDarkMode } from '../App';

const { Text, Title } = Typography;

// Popular Tamil Nadu agri districts for 1-click selection
const POPULAR_DISTRICTS = [
  { name: 'Thoothukudi', lat: 8.7642, lon: 78.1348 },
  { name: 'Kallakurichi', lat: 11.7383, lon: 78.9639 },
  { name: 'Coimbatore', lat: 11.0168, lon: 76.9558 },
  { name: 'Kanyakumari', lat: 8.0883, lon: 77.5385 },
  { name: 'Thanjavur', lat: 10.7870, lon: 79.1378 },
  { name: 'Madurai', lat: 9.9252, lon: 78.1198 },
  { name: 'Salem', lat: 11.6643, lon: 78.1460 },
  { name: 'Tiruchirappalli', lat: 10.7905, lon: 78.7047 },
  { name: 'Erode', lat: 11.3410, lon: 77.7172 },
  { name: 'Tirunelveli', lat: 8.7139, lon: 77.7567 },
];

const DeliveryLocationModal = ({ open, onClose, onLocationSaved }) => {
  const isDark = useDarkMode();
  const [step, setStep] = useState('picker'); // picker | detecting | map | confirmed | denied
  const [locationData, setLocationData] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);

  // Dynamically load Leaflet library
  const loadLeaflet = useCallback(async () => {
    if (window.L) return window.L;

    if (!document.querySelector('#leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    return new Promise((resolve) => {
      if (window.L) { resolve(window.L); return; }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve(window.L);
      document.head.appendChild(script);
    });
  }, []);

  // Reverse geocoding via Nominatim
  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`,
        { headers: { 'User-Agent': 'BhoomiBloom/1.0' } }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      const addr = data.address || {};
      return {
        formatted_address: data.display_name,
        area: addr.village || addr.suburb || addr.neighbourhood || addr.town || addr.city_district || '',
        city: addr.city || addr.county || addr.district || addr.state_district || '',
        district: addr.county || addr.state_district || '',
        state: addr.state || '',
        pincode: addr.postcode || '',
        country: addr.country || 'India',
        latitude: lat,
        longitude: lon,
      };
    } catch {
      return {
        formatted_address: `Location [${lat.toFixed(4)}, ${lon.toFixed(4)}]`,
        latitude: lat,
        longitude: lon,
      };
    }
  };

  // Search places via Nominatim Search API
  const handleSearchLocation = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const q = encodeURIComponent(`${query.trim()}, India`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&addressdetails=1&countrycodes=in&limit=6`,
        { headers: { 'User-Agent': 'BhoomiBloom/1.0' } }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSearchResults(data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Initialize/update Leaflet map
  const initMap = useCallback(async (lat, lon) => {
    const L = await loadLeaflet();
    if (!mapRef.current) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const map = L.map(mapRef.current, { zoomControl: true }).setView([lat, lon], 14);
    leafletMapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      html: `<div style="
        width:38px;height:38px;border-radius:50% 50% 50% 0;
        background:#2E7D32;border:3px solid #fff;
        box-shadow:0 3px 14px rgba(0,0,0,0.35);
        transform:rotate(-45deg);
        display:flex;align-items:center;justify-content:center;
      "><div style="transform:rotate(45deg);font-size:18px;">📍</div></div>`,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      className: ''
    });

    const marker = L.marker([lat, lon], { icon, draggable: true }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', async (e) => {
      const { lat: newLat, lng: newLon } = e.target.getLatLng();
      const addr = await reverseGeocode(newLat, newLon);
      setLocationData(addr);
    });

    map.on('click', async (e) => {
      const { lat: newLat, lng: newLon } = e.latlng;
      marker.setLatLng([newLat, newLon]);
      const addr = await reverseGeocode(newLat, newLon);
      setLocationData(addr);
    });

    setMapLoaded(true);
  }, [loadLeaflet]);

  // Select place from search or district chips
  const selectPlace = async (lat, lon, customName) => {
    setDetecting(true);
    const addr = await reverseGeocode(lat, lon);
    if (customName && (!addr.city || addr.city === '')) {
      addr.city = customName;
    }
    setLocationData(addr);
    setDetecting(false);
    setStep('map');
    setSearchResults([]);
    setTimeout(() => initMap(lat, lon), 250);
  };

  // Request browser GPS
  const detectLiveGPS = useCallback(() => {
    setStep('detecting');
    setDetecting(true);

    if (!navigator.geolocation) {
      setStep('denied');
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setDetecting(false);

        const addr = await reverseGeocode(latitude, longitude);
        setLocationData(addr);
        setStep('map');
        setTimeout(() => initMap(latitude, longitude), 250);
      },
      (err) => {
        console.warn('GPS denied:', err);
        setDetecting(false);
        setStep('denied');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, [initMap]);

  // Save location to localStorage & dispatch global event
  const handleConfirmLocation = () => {
    if (!locationData) return;
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u && u.email) {
          localStorage.setItem(`bhoomi_delivery_location_${u.email}`, JSON.stringify(locationData));
        }
      }
    } catch (e) {}
    localStorage.setItem('bhoomi_delivery_location', JSON.stringify(locationData));
    window.dispatchEvent(new CustomEvent('bhoomi_location_updated', { detail: locationData }));
    if (onLocationSaved) onLocationSaved(locationData);
    setStep('confirmed');
    setTimeout(() => {
      onClose();
      setStep('picker');
    }, 1200);
  };

  const handleClose = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }
    setMapLoaded(false);
    setStep('picker');
    setLocationData(null);
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      title={
        <Space>
          <EnvironmentOutlined style={{ color: '#2E7D32', fontSize: 20 }} />
          <Title level={4} style={{ margin: 0, color: '#1B2E1E' }}>Select Delivery & Weather Location</Title>
        </Space>
      }
      width={620}
      centered
      destroyOnClose
      style={{ borderRadius: 20 }}
    >
      {/* ─── STEP 1: Main Picker (Search + GPS + District Chips) ─── */}
      {step === 'picker' && (
        <div style={{ padding: '8px 0' }}>
          {/* Search Box */}
          <div style={{ marginBottom: 18 }}>
            <Input.Search
              placeholder="Search your City, Village, District, or 6-digit Pincode (e.g. Thoothukudi, 628001)"
              allowClear
              enterButton={<Button style={{ background: '#2E7D32', borderColor: '#2E7D32', color: '#fff' }}><SearchOutlined /> Search</Button>}
              size="large"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length > 2) handleSearchLocation(e.target.value);
              }}
              onSearch={handleSearchLocation}
              loading={searching}
            />
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div style={{
              background: isDark ? 'rgba(255,255,255,0.06)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#d9d9d9'}`, borderRadius: 12,
              marginBottom: 16, maxHeight: 220, overflowY: 'auto', boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
            }}>
              <List
                size="small"
                dataSource={searchResults}
                renderItem={(item) => (
                  <List.Item
                    style={{ cursor: 'pointer', padding: '10px 14px' }}
                    onClick={() => selectPlace(parseFloat(item.lat), parseFloat(item.lon), item.display_name.split(',')[0])}
                    className="hover-bg"
                  >
                    <Space orientation="horizontal">
                      <EnvironmentOutlined style={{ color: '#2E7D32' }} />
                      <div>
                        <Text strong style={{ fontSize: 13, display: 'block' }}>{item.display_name.split(',')[0]}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>{item.display_name}</Text>
                      </div>
                    </Space>
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* GPS Auto-Detect Button */}
          <div style={{ marginBottom: 20 }}>
            <Button
              block
              size="large"
              icon={<AimOutlined />}
              onClick={detectLiveGPS}
              style={{
                height: 48, borderRadius: 12,
                background: '#f0fdf4', borderColor: '#86efac',
                color: '#2E7D32', fontWeight: 700, fontSize: 15
              }}
            >
              📡 Detect via Device GPS
            </Button>
          </div>

          <Divider style={{ margin: '14px 0', fontSize: 12, color: '#888' }}>or choose your district</Divider>

          {/* District Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {POPULAR_DISTRICTS.map((d) => (
              <Tag
                key={d.name}
                onClick={() => selectPlace(d.lat, d.lon, d.name)}
                style={{
                  padding: '6px 14px', borderRadius: 16, cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, border: '1px solid #dcfce7',
                  background: '#f8fafc', color: '#1B2E1E', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#2E7D32'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#1B2E1E'; }}
              >
                📍 {d.name}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {/* ─── STEP 2: Detecting Spinner ─── */}
      {step === 'detecting' && (
        <div style={{ textAlign: 'center', padding: '48px 20px' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 44, color: '#2E7D32' }} spin />} />
          <Title level={4} style={{ marginTop: 20 }}>Detecting Location...</Title>
          <Text type="secondary">Fetching precise GPS coordinates and address...</Text>
        </div>
      )}

      {/* ─── STEP 3: Denied ─── */}
      {step === 'denied' && (
        <div style={{ padding: '20px 0' }}>
          <Alert
            type="warning"
            showIcon
            message="GPS Permission Not Granted"
            description="You can easily search your city or pincode using the search box above."
            style={{ borderRadius: 12, marginBottom: 16 }}
          />
          <Button block onClick={() => setStep('picker')} style={{ borderRadius: 10, height: 44 }}>
            Search by City or Pincode
          </Button>
        </div>
      )}

      {/* ─── STEP 4: Interactive Map View ─── */}
      {step === 'map' && (
        <div>
          {/* Back to search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Button size="small" type="link" onClick={() => setStep('picker')}>
              ← Change Location / Search
            </Button>
            <Text type="secondary" style={{ fontSize: 12 }}>Drag pin to adjust</Text>
          </div>

          {/* Map Container */}
          <div
            ref={mapRef}
            style={{ width: '100%', height: 300, borderRadius: 14, overflow: 'hidden', marginBottom: 14, border: '2px solid #bbf7d0' }}
          />

          {/* Detected Address Details */}
          {locationData && (
            <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '12px 16px', marginBottom: 16, border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <EnvironmentOutlined style={{ color: '#2E7D32', fontSize: 20, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <Text strong style={{ display: 'block', color: '#1B2E1E', fontSize: 14 }}>
                    {locationData.area || locationData.city || 'Delivery Location'}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
                    {locationData.formatted_address}
                  </Text>
                  <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {locationData.city && <Tag color="green">{locationData.city}</Tag>}
                    {locationData.state && <Tag color="blue">{locationData.state}</Tag>}
                    {locationData.pincode && <Tag color="orange">{locationData.pincode}</Tag>}
                    <Tag color="default">📍 {locationData.latitude?.toFixed(4)}, {locationData.longitude?.toFixed(4)}</Tag>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button
            type="primary"
            block
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={handleConfirmLocation}
            disabled={!locationData}
            style={{ background: '#2E7D32', borderColor: '#2E7D32', borderRadius: 10, height: 48, fontWeight: 700, fontSize: 16 }}
          >
            ✅ Confirm & Set Location
          </Button>
        </div>
      )}

      {/* ─── STEP 5: Confirmed ─── */}
      {step === 'confirmed' && (
        <div style={{ textAlign: 'center', padding: '36px 20px' }}>
          <CheckCircleOutlined style={{ fontSize: 52, color: '#52C41A' }} />
          <Title level={4} style={{ color: '#2E7D32', marginTop: 14 }}>Location Successfully Saved!</Title>
          <Text type="secondary">{locationData?.formatted_address}</Text>
        </div>
      )}
    </Modal>
  );
};

export default DeliveryLocationModal;
