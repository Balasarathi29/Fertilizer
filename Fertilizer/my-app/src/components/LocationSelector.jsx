import React, { useState, useEffect } from 'react';
import { Row, Col, Select, Input, Typography, Spin, Alert, Form } from 'antd';
import { EnvironmentOutlined, GlobalOutlined } from '@ant-design/icons';
import { locationService } from '../services/locationService';

const { Text } = Typography;

/**
 * Reusable India-only Location Selector Component
 * Features:
 * - Country: "India" (Fixed / Read-only)
 * - State: Searchable Select dropdown
 * - District: Searchable Select dropdown (dynamically loaded based on selected state)
 * - Safe filterOption using option.label to prevent AntD crashes when typing
 */
const LocationSelector = ({
  selectedState,
  selectedDistrict,
  onStateChange,
  onDistrictChange,
  layout = 'horizontal', // 'horizontal' or 'vertical'
  disabled = false,
  showCountry = true,
  required = false
}) => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Load States on Mount
  useEffect(() => {
    let isMounted = true;
    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const stateList = await locationService.getStates();
        if (isMounted) {
          setStates(Array.isArray(stateList) ? stateList : []);
        }
      } catch (err) {
        if (isMounted) setStates([]);
      } finally {
        if (isMounted) setLoadingStates(false);
      }
    };
    fetchStates();
    return () => { isMounted = false; };
  }, []);

  // Fetch Districts when selectedState changes
  useEffect(() => {
    let isMounted = true;
    const fetchDistricts = async () => {
      if (!selectedState) {
        setDistricts([]);
        return;
      }
      setLoadingDistricts(true);
      try {
        const districtList = await locationService.getDistricts(selectedState);
        if (isMounted) {
          setDistricts(Array.isArray(districtList) ? districtList : []);
        }
      } catch (err) {
        if (isMounted) setDistricts([]);
      } finally {
        if (isMounted) setLoadingDistricts(false);
      }
    };
    fetchDistricts();
    return () => { isMounted = false; };
  }, [selectedState]);

  const handleStateSelect = (value) => {
    if (onStateChange) onStateChange(value);
    if (onDistrictChange) onDistrictChange('');
  };

  const handleDistrictSelect = (value) => {
    if (onDistrictChange) onDistrictChange(value);
  };

  // Convert states and districts to option objects with explicit `label` & `value`
  const stateOptions = states.map(s => ({
    label: `🇮🇳 ${s}`,
    value: s
  }));

  const districtOptions = districts.map(d => ({
    label: `📌 ${d}`,
    value: d
  }));

  // Safe search filter function comparing lowercased input with option.label
  const safeFilterOption = (input, option) => {
    if (!input || !option) return true;
    const labelStr = String(option.label || option.value || '');
    return labelStr.toLowerCase().includes(input.toLowerCase());
  };

  const colSpan = layout === 'horizontal' ? (showCountry ? 8 : 12) : 24;

  return (
    <Row gutter={[16, 16]}>
      {/* 1. Country (Fixed Read-Only India) */}
      {showCountry && (
        <Col xs={24} sm={colSpan}>
          <Text strong style={{ display: 'block', marginBottom: 6 }}>
            Country
          </Text>
          <Input
            value="🇮🇳 India"
            disabled
            prefix={<GlobalOutlined style={{ color: '#2E7D32' }} />}
            size="large"
            style={{ borderRadius: 10, backgroundColor: 'rgba(46, 125, 50, 0.05)', fontWeight: 600 }}
          />
        </Col>
      )}

      {/* 2. State Selection */}
      <Col xs={24} sm={colSpan}>
        <Text strong style={{ display: 'block', marginBottom: 6 }}>
          State / Union Territory {required && <span style={{ color: '#ff4d4f' }}>*</span>}
        </Text>
        <Select
          showSearch
          size="large"
          style={{ width: '100%' }}
          placeholder="Search & select State..."
          value={selectedState || undefined}
          onChange={handleStateSelect}
          options={stateOptions}
          loading={loadingStates}
          disabled={disabled || loadingStates}
          filterOption={safeFilterOption}
          notFoundContent={loadingStates ? <Spin size="small" /> : 'No matching state found'}
        />
      </Col>

      {/* 3. District Selection */}
      <Col xs={24} sm={colSpan}>
        <Text strong style={{ display: 'block', marginBottom: 6 }}>
          District {required && <span style={{ color: '#ff4d4f' }}>*</span>}
        </Text>
        <Select
          showSearch
          size="large"
          style={{ width: '100%' }}
          placeholder={selectedState ? `Search & select District in ${selectedState}...` : 'Select State First'}
          value={selectedDistrict || undefined}
          onChange={handleDistrictSelect}
          options={districtOptions}
          loading={loadingDistricts}
          disabled={disabled || !selectedState || loadingDistricts}
          filterOption={safeFilterOption}
          notFoundContent={
            loadingDistricts ? <Spin size="small" /> : (
              selectedState ? 'No matching district found' : 'Select a State first'
            )
          }
        />
      </Col>
    </Row>
  );
};

export default LocationSelector;
