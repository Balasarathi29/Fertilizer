import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Divider, Space, Typography } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

const { Text, Link } = Typography;

// Custom high-quality SVGs for Google and Facebook to ensure a premium look
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
  </svg>
);

const LoginForm = ({ onRegisterClick, onSubmitSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    setLoading(true);
    // Simulate API call for premium UI experience
    setTimeout(() => {
      setLoading(false);
      onSubmitSuccess(values.email);
    }, 1500);
  };

  return (
    <div className="fade-enter-active">
      <Form
        form={form}
        name="login_form"
        initialValues={{ remember: true }}
        onFinish={handleFinish}
        layout="vertical"
        size="large"
        requiredMark={false}
      >
        <Form.Item
          name="email"
          label={<span style={{ fontWeight: 500 }}>Email Address</span>}
          rules={[
            { required: true, message: 'Please enter your email address!' },
            { type: 'email', message: 'Please enter a valid email address!' },
          ]}
        >
          <Input 
            prefix={<MailOutlined className="site-form-item-icon" style={{ color: '#8c8c8c' }} />} 
            placeholder="farmer@bhoomibloom.in" 
          />
        </Form.Item>

       <Form.Item
  name="password"
  label={<span style={{ fontWeight: 500 }}>Password</span>}
  rules={[
    {
      required: true,
      message: "Please enter your password!",
    },
    {
      pattern:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
      message:
        "Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character.",
    },
  ]}
>
  <Input.Password
    prefix={<LockOutlined style={{ color: "#8c8c8c" }} />}
    placeholder="Enter a strong password"
  />
</Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox style={{ fontSize: '14px' }}>Remember me</Checkbox>
            </Form.Item>
            <Link 
              href="#forgot-password" 
              style={{ color: 'var(--primary-color)', fontSize: '14px', fontWeight: 500 }}
              onClick={(e) => e.preventDefault()}
            >
              Forgot Password?
            </Link>
          </div>
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            className="gradient-btn" 
            loading={loading}
            block
          >
            Log In
          </Button>
        </Form.Item>

        <Divider style={{ margin: '20px 0', borderColor: 'var(--glass-border)' }}>
          <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Or Continue With</Text>
        </Divider>

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Button 
            className="social-btn" 
            icon={<GoogleIcon />} 
            block
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                onSubmitSuccess('Google User');
              }, 1200);
            }}
          >
            Sign in with Google
          </Button>
          <Button 
            className="social-btn" 
            icon={<FacebookIcon />} 
            block
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                onSubmitSuccess('Facebook User');
              }, 1200);
            }}
          >
            Sign in with Facebook
          </Button>
        </Space>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            Don't have an account?{' '}
            <Link 
              style={{ color: 'var(--primary-color)', fontWeight: 600 }} 
              onClick={onRegisterClick}
            >
              Sign Up
            </Link>
          </Text>
        </div>
      </Form>
    </div>
  );
};

export default LoginForm;
