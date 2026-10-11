import React, { useState, useEffect, useRef } from 'react';
import { Card, Typography, Spin, Space, Button, Badge, Divider, Tag } from 'antd';
import { EnvironmentOutlined, InfoCircleOutlined, CompassOutlined, CloudOutlined, EditOutlined } from '@ant-design/icons';
import { weatherService } from '../services/weatherService';
import DeliveryLocationModal from './DeliveryLocationModal';

const { Title, Text } = Typography;

// Custom Animated SVGs for Weather Conditions
const WeatherIcon = ({ type, size = 52 }) => {
  const iconStyle = {
    width: size,
    height: size,
    filter: 'drop-shadow(0px 3px 6px rgba(46, 125, 50, 0.12))'
  };

  switch (type) {
    case 'Sun':
      return (
        <svg viewBox="0 0 64 64" style={iconStyle} xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="12" fill="#C9A227">
            <animate attributeName="r" values="12;13;12" dur="3s" repeatCount="indefinite" />
          </circle>
          <g stroke="#C9A227" strokeWidth="3" strokeLinecap="round">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
              <line 
                key={idx} 
                x1="32" y1="8" x2="32" y2="14" 
                transform={`rotate(${angle} 32 32)`}
              >
                <animateTransform 
                  attributeName="transform" 
                  type="rotate" 
                  from={`${angle} 32 32`} 
                  to={`${angle + 360} 32 32`} 
                  dur="15s" 
                  repeatCount="indefinite" 
                />
              </line>
            ))}
          </g>
        </svg>
      );
    case 'Cloud':
      return (
        <svg viewBox="0 0 64 64" style={iconStyle} xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M18 40a10 10 0 0 1 2-19.8 14 14 0 0 1 27.2-2.2 12 12 0 0 1 4.8 22H18z" 
            fill="#a1a1a1"
            opacity="0.85"
          >
            <animate attributeName="transform" type="translate" values="0,0; 0,-2; 0,0" dur="4s" repeatCount="indefinite" />
          </path>
        </svg>
      );
    case 'CloudSun':
      return (
        <svg viewBox="0 0 64 64" style={iconStyle} xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="24" r="8" fill="#C9A227" />
          <path 
            d="M18 44a10 10 0 0 1 2-19.8 14 14 0 0 1 27.2-2.2 12 12 0 0 1 4.8 22H18z" 
            fill="#cfd8dc"
          >
            <animate attributeName="transform" type="translate" values="-0.5,0; 0.5,0; -0.5,0" dur="5s" repeatCount="indefinite" />
          </path>
        </svg>
      );
    case 'Rain':
      return (
        <svg viewBox="0 0 64 64" style={iconStyle} xmlns="http://www.w3.org/2000/svg">
          <path d="M18 36a10 10 0 0 1 2-19.8 14 14 0 0 1 27.2-2.2 12 12 0 0 1 4.8 22H18z" fill="#90a4ae" />
          <g stroke="#29b6f6" strokeWidth="2.5" strokeLinecap="round">
            <line x1="24" y1="42" x2="20" y2="50">
              <animate attributeName="y1" values="42;46;42" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="y2" values="50;54;50" dur="1.2s" repeatCount="indefinite" />
            </line>
            <line x1="34" y1="42" x2="30" y2="50">
              <animate attributeName="y1" values="44;48;44" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="y2" values="52;56;52" dur="1.5s" repeatCount="indefinite" />
            </line>
          </g>
        </svg>
      );
    case 'Storm':
      return (
        <svg viewBox="0 0 64 64" style={iconStyle} xmlns="http://www.w3.org/2000/svg">
          <path d="M18 36a10 10 0 0 1 2-19.8 14 14 0 0 1 27.2-2.2 12 12 0 0 1 4.8 22H18z" fill="#455a64" />
          <path d="M30 40l-6 10h6l-3 8 8-12h-6z" fill="#ffeb3b">
            <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" />
          </path>
        </svg>
      );
    default:
      return <CloudOutlined style={{ fontSize: size, color: '#2E7D32' }} />;
  }
};

const WeatherCard = ({ customCoords }) => {
  const [loading, setLoading] = useState(true);
  const [permissionState, setPermissionState] = useState('checking'); // checking, allowed, denied
  const [weather, setWeather] = useState(null);
  const [cityName, setCityName] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const refreshInterval = useRef(null);

  useEffect(() => {
    // 1. Check customCoords prop
    if (customCoords?.latitude && customCoords?.longitude) {
      setPermissionState('allowed');
      loadWeatherData(customCoords.latitude, customCoords.longitude);
      return;
    }

    // 2. Check localStorage saved location
    try {
      const savedLoc = localStorage.getItem('bhoomi_delivery_location');
      if (savedLoc) {
        const parsed = JSON.parse(savedLoc);
        if (parsed.latitude && parsed.longitude) {
          setPermissionState('allowed');
          loadWeatherData(parsed.latitude, parsed.longitude);
          return;
        }
      }
    } catch {}

    // 3. Fallback to browser GPS
    requestPermissionAndLoad();

    // 4. Listen for location changes from DeliveryLocationModal
    const handleLocationUpdated = (event) => {
      const loc = event.detail;
      if (loc?.latitude && loc?.longitude) {
        setPermissionState('allowed');
        loadWeatherData(loc.latitude, loc.longitude);
      }
    };
    window.addEventListener('bhoomi_location_updated', handleLocationUpdated);

    refreshInterval.current = setInterval(() => {
      silentRefresh();
    }, 15 * 60 * 1000);

    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
      window.removeEventListener('bhoomi_location_updated', handleLocationUpdated);
    };
  }, [customCoords]);

  const requestPermissionAndLoad = async () => {
    setLoading(true);
    setPermissionState('checking');
    try {
      const coords = await weatherService.getUserCoordinates();
      setPermissionState('allowed');
      await loadWeatherData(coords.latitude, coords.longitude);
    } catch (err) {
      console.warn("Location permission denied or unavailable", err);
      // Try using fallback Tamil Nadu district
      setPermissionState('allowed');
      await loadWeatherData(8.7642, 78.1348); // Thoothukudi fallback
    }
  };

  const silentRefresh = async () => {
    try {
      const savedLoc = localStorage.getItem('bhoomi_delivery_location');
      if (savedLoc) {
        const p = JSON.parse(savedLoc);
        if (p.latitude) {
          await loadWeatherData(p.latitude, p.longitude);
          return;
        }
      }
      const coords = customCoords?.latitude ? customCoords : await weatherService.getUserCoordinates();
      await loadWeatherData(coords.latitude, coords.longitude);
    } catch (e) {
      console.warn("Silent weather refresh error", e);
    }
  };

  const loadWeatherData = async (lat, lon) => {
    try {
      const data = await weatherService.getWeatherForecast(lat, lon);
      setWeather(data);
      const name = data.location.name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
      setCityName(name);
    } catch (err) {
      console.error("Failed to fetch Open-Meteo weather data", err);
    } finally {
      setLoading(false);
    }
  };

  const getIconForCondition = (cond) => {
    const c = (cond || '').toLowerCase();
    if (c.includes("sunny") || c.includes("clear")) return "Sun";
    if (c.includes("cloudy") || c.includes("overcast")) return "Cloud";
    if (c.includes("drizzle") || c.includes("rain") || c.includes("shower")) return "Rain";
    if (c.includes("thunder") || c.includes("storm")) return "Storm";
    return "CloudSun";
  };

  const getFarmingRecommendation = () => {
    if (!weather?.current) return "Maintain stable irrigation. Soil moisture is optimal.";
    
    const prec = weather.current.precipitation || 0;
    const temp = weather.current.temp || 28;
    const wind = weather.current.windSpeed || 12;

    if (prec >= 2.0 || weather.current.condition.toLowerCase().includes("rain")) {
      return "Rain expected today. Avoid foliar fertilizer application.";
    }
    if (temp >= 35) {
      return "High temperature detected. Irrigate deep in early morning or late evening.";
    }
    if (wind >= 20) {
      return "Strong winds. Postpone foliar liquid spraying.";
    }
    if (temp <= 22) {
      return "Optimal temperature for seed sowing and tilling.";
    }
    return "Good weather to apply organic vermicompost or neem cake.";
  };

  // 1. Loading State
  if (loading) {
    return (
      <Card 
        className="glass-panel" 
        style={{ 
          background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(255, 255, 255, 0.7) 100%)', 
          border: '1px solid rgba(46, 125, 50, 0.15)',
          borderRadius: 20, 
          padding: '24px 20px', 
          minHeight: 140, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.03)'
        }}
      >
        <Space direction="vertical" align="center" size="small">
          <Spin size="small" style={{ color: '#2E7D32' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>Connecting Open-Meteo GPS weather...</Text>
        </Space>
      </Card>
    );
  }

  if (!weather) return null;

  // 2. Loaded Open-Meteo Live Weather
  return (
    <>
      <Card 
        className="glass-panel" 
        style={{ 
          background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.06) 0%, rgba(255, 255, 255, 0.85) 100%)', 
          border: '1px solid rgba(46, 125, 50, 0.18)',
          borderRadius: 20,
          padding: '14px 18px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.03)',
          transition: 'all 0.3s ease',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          
          {/* Left Side: Icon, Temp and Condition */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <WeatherIcon type={getIconForCondition(weather.current.condition)} size={48} />
            <div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {weather.current.temp}°C
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: 700, color: '#2E7D32' }}>{weather.current.condition}</Text>
                <Tag color="green" style={{ fontSize: 10, padding: '0 4px', borderRadius: 4 }}>Open-Meteo Live</Tag>
              </div>
            </div>
          </div>

          {/* Right Side: Location details and metrics */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginBottom: 4 }}>
              <EnvironmentOutlined style={{ color: '#2E7D32', fontSize: 13 }} />
              <Text strong style={{ fontSize: 13, color: 'var(--text-primary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cityName}
              </Text>
              <Button 
                type="link" 
                size="small" 
                icon={<EditOutlined />} 
                onClick={() => setModalOpen(true)}
                style={{ padding: '0 4px', fontSize: 11, color: '#2E7D32' }}
                title="Change location or search pincode"
              >
                Change
              </Button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              💧 Humidity: <strong>{weather.current.humidity}%</strong> | 💨 Wind: <strong>{weather.current.windSpeed} km/h</strong>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              🌧️ Rain/Precip: <strong>{weather.current.precipitation ?? 0} mm</strong>
            </div>
          </div>

        </div>

        <Divider style={{ margin: '10px 0' }} />

        {/* Mini Agronomist Suggestion Banner */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <InfoCircleOutlined style={{ color: '#C9A227', fontSize: 13, flexShrink: 0 }} />
          <Text style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>
            {getFarmingRecommendation()}
          </Text>
        </div>
      </Card>

      <DeliveryLocationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onLocationSaved={(loc) => {
          if (loc?.latitude && loc?.longitude) {
            loadWeatherData(loc.latitude, loc.longitude);
          }
        }}
      />
    </>
  );
};

export default WeatherCard;
