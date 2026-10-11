import React from 'react';
import { Typography, Row, Col, Card } from 'antd';

const { Title, Paragraph } = Typography;

const About = () => {
  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100vh' }}>
      
      {/* ─── 1. HERO SECTION ─── */}
      <div 
        style={{ 
          height: '90vh', 
          background: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url("/src/assets/about_hero.jpg") center/cover no-repeat',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 20px'
        }}
      >
        <div style={{ maxWidth: 800 }}>
          <Title level={1} style={{ color: '#fff', fontSize: '3.5rem', marginBottom: 30, textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            Empowering Farmers Through Smart Agriculture
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem' }}>
            Bhoomi Bloom is a next-generation AI-powered agriculture ecosystem combining nature, technology, and smart farming to cultivate a better future.
          </Paragraph>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 20px' }}>
        
        {/* ─── 2. AI AGRICULTURE TECHNOLOGY ─── */}
        <Row gutter={[64, 64]} align="middle" style={{ marginBottom: 120 }}>
          <Col xs={24} md={12}>
            <div className="img-container">
              <img src="/src/assets/about_ai_tech.jpg" alt="AI Farming Technology" style={{ width: '100%', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Title level={2} style={{ color: '#2E7D32', marginBottom: 20 }}>Technology & Nature in Harmony</Title>
            <Paragraph style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
              We bring the power of artificial intelligence directly to the fields. Our transparent digital farming dashboards and smart agriculture sensors provide real-time crop health monitoring, allowing farmers to make data-driven decisions that optimize yields while preserving the environment.
            </Paragraph>
          </Col>
        </Row>

        {/* ─── 3. BHOOMI AI ASSISTANT ─── */}
        <Row gutter={[64, 64]} align="middle" style={{ marginBottom: 120, flexDirection: 'row-reverse' }}>
          <Col xs={24} md={12}>
            <div className="img-container">
              <img src="/src/assets/about_ai_assistant.jpg" alt="Bhoomi AI Assistant" style={{ width: '100%', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Title level={2} style={{ color: '#2E7D32', marginBottom: 20 }}>An AI Partner for Every Farmer</Title>
            <Paragraph style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
              Imagine having an expert agronomist available 24/7. The Bhoomi AI Assistant uses futuristic holographic interfaces and deep learning to provide instant plant disease analysis, personalized crop recommendations, and intelligent farming data visualization right in the palm of your hand.
            </Paragraph>
          </Col>
        </Row>

        {/* ─── 4. AGRICULTURE MARKETPLACE ─── */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <Title level={2} style={{ color: '#2E7D32', marginBottom: 20 }}>The Premium Agriculture Marketplace</Title>
          <Paragraph style={{ fontSize: '1.1rem', maxWidth: 800, margin: '0 auto' }}>
            We've curated a luxury showcase of the finest agricultural products. From premium organic seeds and eco-friendly fertilizers to state-of-the-art machinery and irrigation equipment, Bhoomi Bloom is your one-stop destination for commercial-grade farming supplies.
          </Paragraph>
        </div>
        <div style={{ marginBottom: 120 }}>
          <img src="/src/assets/about_marketplace.jpg" alt="Agriculture Marketplace" style={{ width: '100%', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
        </div>

        {/* ─── 5 & 6. COMMUNITY AND THE FUTURE ─── */}
        <Row gutter={[48, 48]}>
          <Col xs={24} md={12}>
            <Card bordered={false} className="glass-panel" style={{ borderRadius: 24, padding: 20, height: '100%' }}>
              <img src="/src/assets/about_community.jpg" alt="Farming Community" style={{ width: '100%', borderRadius: 16, marginBottom: 24 }} />
              <Title level={3} style={{ color: '#2E7D32' }}>Growing Together</Title>
              <Paragraph style={{ fontSize: '1.05rem' }}>
                At the heart of Bhoomi Bloom is our community. We believe in empowering diverse groups of farmers to work collaboratively, sharing knowledge, and embracing modern sustainable agriculture practices for a brighter tomorrow.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card bordered={false} className="glass-panel" style={{ borderRadius: 24, padding: 20, height: '100%' }}>
              <img src="/src/assets/about_future.jpg" alt="Future Farming" style={{ width: '100%', borderRadius: 16, marginBottom: 24 }} />
              <Title level={3} style={{ color: '#2E7D32' }}>The Future of Sustainable Farming</Title>
              <Paragraph style={{ fontSize: '1.05rem' }}>
                We are building the smart farms of the future. By integrating automated irrigation, agricultural drones, modern machinery, and renewable energy, we are creating a high-tech ecosystem that maximizes efficiency while protecting our planet.
              </Paragraph>
            </Card>
          </Col>
        </Row>

      </div>
    </div>
  );
};

export default About;
