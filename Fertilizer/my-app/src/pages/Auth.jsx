import React, { useState, useContext } from 'react';
import { Typography, Card, Button, Input, Checkbox, Select, Form, notification, Row, Col, Alert } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  GoogleOutlined,
  FacebookOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { apiService } from '../services/apiService';
import LeafParticles from '../components/LeafParticles';
import bhoomiBloomLogo from '../assets/bhoomi_bloom_logo.jpg';

const { Title, Text } = Typography;
const { Option } = Select;

// Password strength validator
const validatePasswordStrength = (_, value) => {
  if (!value) {
    return Promise.reject(new Error('Please enter a password!'));
  }
  if (value.length < 8) {
    return Promise.reject(new Error('Password must be at least 8 characters.'));
  }
  if (!/[A-Z]/.test(value)) {
    return Promise.reject(new Error('Password must contain at least one uppercase letter.'));
  }
  if (!/[a-z]/.test(value)) {
    return Promise.reject(new Error('Password must contain at least one lowercase letter.'));
  }
  if (!/[0-9]/.test(value)) {
    return Promise.reject(new Error('Password must contain at least one number.'));
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    return Promise.reject(new Error('Password must contain at least one special character.'));
  }
  return Promise.resolve();
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [form] = Form.useForm();
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggle = () => {
    form.resetFields();
    setErrorMessage(null);
    setIsLogin((prev) => !prev);
  };

  const getRoleRedirectTarget = (role, fromState) => {
    const cleanRole = (role || 'farmer').toLowerCase();
    if (cleanRole === 'admin') return '/admin/dashboard';
    if (cleanRole === 'seller') return '/seller/dashboard';
    if (fromState && fromState !== '/dashboard' && !fromState.includes('/dashboard')) {
      return fromState;
    }
    return '/';
  };

  const handleFinish = async (values) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isLogin) {
        // ─── LOGIN API CALL ───
        const res = await apiService.login({
          email: values.email,
          password: values.password
        });

        login(res.access_token, res.user);

        notification.success({
          message: `Welcome Back, ${res.user.name || 'User'}!`,
          description: `Logged in as ${(res.user.role || 'farmer').toUpperCase()}.`,
        });

        const target = getRoleRedirectTarget(res.user.role, location.state?.from);
        navigate(target, { replace: true });
      } else {
        // ─── REGISTER API CALL ───
        const res = await apiService.register({
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role || 'farmer',
          mobile: values.mobile || ''
        });

        login(res.access_token, res.user);

        notification.success({
          message: 'Account Created Successfully!',
          description: 'Welcome to Bhoomi Bloom community.',
        });

        const target = getRoleRedirectTarget(res.user.role, location.state?.from);
        navigate(target, { replace: true });
      }
    } catch (err) {
      const msg = err.message || 'Authentication failed. Please check your credentials.';
      setErrorMessage(msg);
      notification.error({
        message: isLogin ? 'Login Failed' : 'Registration Failed',
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ minHeight: '100vh', display: 'flex' }}>
      <LeafParticles />

      {/* ─── LEFT SIDE: Hero Section ─── */}
      <div
        className="hero-column"
        style={{
          flex: 1.2,
          position: 'relative',
          background:
            'linear-gradient(170deg, rgba(21, 70, 28, 0.25) 0%, rgba(30, 82, 34, 0.45) 100%), url("/src/assets/auth_cinematic_bg.jpg") no-repeat center 60%',
          backgroundSize: 'cover',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '90px',
          color: '#ffffff',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Title
            level={1}
            style={{ color: '#fff', fontSize: '3.5rem', fontWeight: 800, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
          >
            Empowering<br />Sustainable<br />Agriculture
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', textShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
            Join the smart farming revolution with Bhoomi Bloom.
          </Text>
        </div>
      </div>

      {/* ─── RIGHT SIDE: Auth Card ─── */}
      <div
        className="form-column"
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: 'var(--bg-app)' }}
      >
        <Card
          className="glass-panel"
          style={{ width: '100%', maxWidth: 450, padding: 20, border: 'none', boxShadow: 'var(--glass-shadow)' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img
              src={bhoomiBloomLogo}
              alt="Logo"
              style={{ width: 70, height: 70, borderRadius: '50%', marginBottom: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Title level={3} style={{ margin: 0 }}>
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </Title>
            <Text type="secondary">
              {isLogin ? 'Sign in to continue to Bhoomi Bloom' : 'Join our organic farming community'}
            </Text>
          </div>

          {errorMessage && (
            <Alert
              message={errorMessage}
              type="error"
              showIcon
              closable
              style={{ marginBottom: 20, borderRadius: 10 }}
            />
          )}

          <Form
            form={form}
            name="auth_form"
            onFinish={handleFinish}
            layout="vertical"
            size="large"
            validateTrigger={['onBlur', 'onChange']}
          >
            {/* REGISTER-ONLY: Full Name */}
            {!isLogin && (
              <Form.Item
                name="name"
                rules={[{ required: true, message: 'Please enter your full name!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Full Name" />
              </Form.Item>
            )}

            {/* EMAIL */}
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email address!' },
                { type: 'email', message: 'Please enter a valid email address!' },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email Address" />
            </Form.Item>

            {/* REGISTER-ONLY: Mobile */}
            {!isLogin && (
              <Form.Item
                name="mobile"
                rules={[
                  { required: true, message: 'Please enter your mobile number!' },
                  { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit mobile number!' },
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Mobile Number" maxLength={10} />
              </Form.Item>
            )}

            {/* PASSWORD */}
            <Form.Item
              name="password"
              hasFeedback={!isLogin}
              rules={
                isLogin
                  ? [{ required: true, message: 'Please enter your password!' }]
                  : [
                      { required: true, message: 'Please enter a password!' },
                      { validator: validatePasswordStrength },
                    ]
              }
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>

            {/* REGISTER-ONLY: Confirm Password + Role */}
            {!isLogin && (
              <>
                <Form.Item
                  name="confirm"
                  hasFeedback
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
                  <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
                </Form.Item>

                <Form.Item
                  name="role"
                  initialValue="farmer"
                  rules={[{ required: true, message: 'Please select a role!' }]}
                >
                  <Select placeholder="Select your role">
                    <Option value="farmer">🚜 Farmer / Buyer</Option>
                    <Option value="seller">💼 Seller / Merchant</Option>
                    <Option value="admin">🔑 Admin</Option>
                  </Select>
                </Form.Item>
              </>
            )}

            {/* LOGIN-ONLY: Remember me */}
            {isLogin && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <a style={{ color: 'var(--primary-color)' }} onClick={() => notification.info({ message: 'Password Reset', description: 'Please contact admin or support to reset password.' })}>Forgot password?</a>
              </div>
            )}

            {/* SUBMIT */}
            <Form.Item>
              <Button type="primary" htmlType="submit" className="gradient-btn" loading={loading} block>
                {isLogin ? 'Log In' : 'Sign Up'}
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <Text type="secondary">Or continue with</Text>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Button className="social-btn" block icon={<GoogleOutlined />}>
                  Google
                </Button>
              </Col>
              <Col span={12}>
                <Button className="social-btn" block icon={<FacebookOutlined />}>
                  Facebook
                </Button>
              </Col>
            </Row>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Text type="secondary">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </Text>
              <Button type="link" onClick={handleToggle} style={{ padding: 0 }}>
                {isLogin ? 'Sign up' : 'Log in'}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
