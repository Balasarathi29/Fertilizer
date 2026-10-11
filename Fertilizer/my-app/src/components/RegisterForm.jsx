import React, { useState } from 'react';
import { Form, Input, Button, Radio, Typography, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';

const { Text, Link } = Typography;

const RegisterForm = ({ onLoginClick, onSubmitSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleFinish = (values) => {
  console.log("SUCCESS", values);

    // Simulate API registration
    setTimeout(() => {
      setLoading(false);
      onSubmitSuccess(values.fullName);
    }, 1500);
  };

  return (
    <div className="fade-enter-active">
      <Form
        form={form}
        name="register_form"
        onFinish={handleFinish}
        layout="vertical"
        size="large"
        requiredMark={false}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="fullName"
              label={<span style={{ fontWeight: 500 }}>Full Name</span>}
              rules={[{ required: true, message: 'Please enter your full name!' }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#8c8c8c' }} />} 
                placeholder="John Doe" 
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="username"
              label={<span style={{ fontWeight: 500 }}>Username</span>}
              rules={[{ required: true, message: 'Please enter a username!' }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#8c8c8c' }} />} 
                placeholder="johndoe12" 
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="email"
          label={<span style={{ fontWeight: 500 }}>Email Address</span>}
          rules={[
            { required: true, message: 'Please enter your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input 
            prefix={<MailOutlined style={{ color: '#8c8c8c' }} />} 
            placeholder="farmer@bhoomibloom.in" 
          />
        </Form.Item>

        <Form.Item
          name="mobile"
          label={<span style={{ fontWeight: 500 }}>Mobile Number</span>}
          rules={[
            { required: true, message: 'Please enter your mobile number!' },
            { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit mobile number!' }
          ]}
        >
          <Input 
            prefix={<PhoneOutlined style={{ color: '#8c8c8c' }} />} 
            placeholder="9876543210" 
          />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
  name="password"
  label={<span style={{ fontWeight: 500 }}>Password</span>}
  hasFeedback
  rules={[
    {
      required: true,
      message: "Please enter a password!",
    },
    {
      validator: (_, value) => {
        if (!value) {
          return Promise.reject(new Error("Please enter a password!"));
        }

        if (value.length < 8) {
          return Promise.reject(
            new Error("Password must be at least 8 characters.")
          );
        }

        if (!/[A-Z]/.test(value)) {
          return Promise.reject(
            new Error("Password must contain at least one uppercase letter.")
          );
        }

        if (!/[a-z]/.test(value)) {
          return Promise.reject(
            new Error("Password must contain at least one lowercase letter.")
          );
        }

        if (!/[0-9]/.test(value)) {
          return Promise.reject(
            new Error("Password must contain at least one number.")
          );
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          return Promise.reject(
            new Error("Password must contain at least one special character.")
          );
        }

        return Promise.resolve();
      },
    },
  ]}
>
  <Input.Password
    prefix={<LockOutlined style={{ color: "#8c8c8c" }} />}
    placeholder="Enter a strong password"
  />
</Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="confirmPassword"
              label={<span style={{ fontWeight: 500 }}>Confirm Password</span>}
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="••••••••"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="userType"
          label={<span style={{ fontWeight: 500 }}>I want to join as a</span>}
          initialValue="Farmer"
          rules={[{ required: true }]}
        >
          <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
            <Radio.Button value="Farmer" style={{ flex: 1, textAlign: 'center', height: '40px', lineHeight: '38px', borderRadius: '8px 0 0 8px' }}>
              🚜 Farmer / Buyer
            </Radio.Button>
            <Radio.Button value="Seller" style={{ flex: 1, textAlign: 'center', height: '40px', lineHeight: '38px', borderRadius: '0 8px 8px 0' }}>
              💼 Seller / Merchant
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item style={{ marginTop: 24, marginBottom: 16 }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            className="gradient-btn" 
            loading={loading}
            block
          >
            Register Account
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            Already have an account?{' '}
            <Link 
              style={{ color: 'var(--primary-color)', fontWeight: 600 }} 
              onClick={onLoginClick}
            >
              Log In
            </Link>
          </Text>
        </div>
      </Form>
    </div>
  );
};

export default RegisterForm;
