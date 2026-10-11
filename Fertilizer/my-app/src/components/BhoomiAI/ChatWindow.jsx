import React, { useState, useEffect, useRef, useContext } from 'react';
import { Button, Card, Input, Typography, Avatar, Tooltip } from 'antd';
import { RobotOutlined, CloseOutlined, SendOutlined, UserOutlined, AudioOutlined } from '@ant-design/icons';
import QuickActions from './QuickActions';
import PlantScanner from './PlantScanner';
import RecommendationCard from './RecommendationCard';
import { mockProducts } from '../../data/products';
import { AuthContext, useDarkMode } from '../../App';

const { Text, Title } = Typography;

const ChatWindow = () => {
  const isDark = useDarkMode();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialization & Personalization
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = isAuthenticated && user?.firstName
        ? `Welcome back ${user.firstName}! Based on your farm profile, your tomatoes are reaching the flowering stage. How can I assist you with your crops today?`
        : 'Hello! I am Bhoomi AI, your intelligent farming companion. How can I help you maximize your yield today?';
      
      setMessages([{ id: 1, type: 'bot', text: greeting, timestamp: new Date() }]);
    }
  }, [isOpen, isAuthenticated, user, messages.length]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSimulateResponse = (text) => {
    setIsTyping(true);
    const lowerText = text.toLowerCase();
    
    setTimeout(() => {
      let botResponse = { id: Date.now(), type: 'bot', timestamp: new Date() };

      if (lowerText.includes('scan') || lowerText.includes('disease')) {
        botResponse.text = "Please upload a photo of the affected plant leaf. I will use our AI vision models to detect any diseases.";
        botResponse.component = 'scanner';
      } else if (lowerText.includes('weather') || lowerText.includes('rain')) {
        botResponse.text = "Based on your farm's location, heavy rain is expected tomorrow evening (90% probability). I strongly advise against applying any fertilizers or pesticides today to prevent runoff.";
      } else if (lowerText.includes('crop') || lowerText.includes('recommendation')) {
        botResponse.text = "For your specific red soil and current rainy season, I recommend Groundnut or Millet. I've found some premium seeds for you in our catalog:";
        botResponse.products = [mockProducts.find(p => p.id === 122), mockProducts.find(p => p.id === 123)]; // Groundnut, Millet
      } else if (lowerText.includes('fertilizer')) {
        botResponse.text = "To boost your crop's growth safely, I recommend applying organic vermicompost. Apply 5kg per acre near the root zone.";
        botResponse.products = [mockProducts.find(p => p.id === 201)]; // Vermicompost
      } else if (lowerText.includes('tomato')) {
        botResponse.text = "To accelerate your tomato growth safely, I recommend using a specialized organic booster.";
        botResponse.products = [mockProducts.find(p => p.id === 209)]; // Plant booster
      } else {
        botResponse.text = "I'm analyzing your request. Our smart agriculture models are constantly learning. Feel free to use the quick actions below for specific assistance.";
      }

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = (text = input) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text, timestamp: new Date() }]);
    setInput('');
    handleSimulateResponse(text);
  };

  const handleScannerComplete = (result) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        text: `I highly recommend applying an organic treatment for ${result.disease}. Here is the best product for the job:`,
        products: [mockProducts.find(p => p.id === result.productId)],
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      <Button
        className="ai-fab"
        type="primary"
        shape="circle"
        size="large"
        icon={<RobotOutlined style={{ fontSize: 28 }} />}
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: 130,
          right: 40,
          width: 64,
          height: 64,
          boxShadow: '0 8px 32px rgba(46, 125, 50, 0.4)',
          background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
          border: 'none',
          display: isOpen ? 'none' : 'flex',
          zIndex: 1000,
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s ease'
        }}
      />

      {isOpen && (
        <Card
          style={{
            position: 'fixed',
            bottom: 130,
            right: 40,
            width: 380,
            height: 650,
            zIndex: 1000,
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.8)',
            background: isDark ? 'rgba(18, 24, 20, 0.97)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: 0
          }}
          styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
        >
          {/* HEADER */}
          <div style={{ background: 'linear-gradient(135deg, #2E7D32, #1B5E20)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <Avatar size={48} icon={<RobotOutlined />} style={{ background: isDark ? 'rgba(255,255,255,0.12)' : '#fff', color: '#2E7D32', border: '2px solid rgba(255,255,255,0.2)' }} />
                <div style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, background: '#52c41a', borderRadius: '50%', border: '2px solid #fff' }} />
              </div>
              <div>
                <Title level={5} style={{ color: '#fff', margin: 0, letterSpacing: '0.5px' }}>Bhoomi AI 🌱</Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Premium Smart Assistant</Text>
              </div>
            </div>
            <Button type="text" icon={<CloseOutlined style={{ color: '#fff', fontSize: 18 }} />} onClick={() => setIsOpen(false)} />
          </div>

          {/* MESSAGES */}
          <div style={{ flex: 1, padding: '20px 20px 0', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', gap: 12, flexDirection: msg.type === 'user' ? 'row-reverse' : 'row' }}>
                <Avatar 
                  size="small" 
                  icon={msg.type === 'user' ? <UserOutlined /> : <RobotOutlined />} 
                  style={{ backgroundColor: msg.type === 'user' ? '#C9A227' : '#2E7D32', flexShrink: 0, marginTop: 4 }}
                />
                <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ 
                    background: msg.type === 'user' ? '#2E7D32' : (isDark ? 'rgba(255,255,255,0.08)' : '#f5f5f5'),
                    color: msg.type === 'user' ? '#fff' : (isDark ? '#f3f4f6' : '#1a1a1a'),
                    padding: '12px 16px',
                    borderRadius: 16,
                    borderTopRightRadius: msg.type === 'user' ? 4 : 16,
                    borderTopLeftRadius: msg.type === 'bot' ? 4 : 16,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    fontSize: 14,
                    lineHeight: 1.5
                  }}>
                    {msg.text}
                  </div>
                  <Text type="secondary" style={{ fontSize: 10, marginTop: 4, marginLeft: 4, marginRight: 4 }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  
                  {/* Dynamic Components rendering based on AI response */}
                  {msg.component === 'scanner' && <PlantScanner onComplete={handleScannerComplete} />}
                  {msg.products && msg.products.map(p => <RecommendationCard key={p.id} product={p} />)}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingBottom: 16 }}>
                <Avatar size="small" icon={<RobotOutlined />} style={{ backgroundColor: '#2E7D32' }} />
                <div style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#f5f5f5', padding: '12px 16px', borderRadius: 16, borderTopLeftRadius: 4, color: isDark ? 'rgba(255,255,255,0.6)' : '#666', fontSize: 13, display: 'flex', gap: 4 }}>
                  Bhoomi AI is thinking<span className="dot-typing">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* FOOTER */}
          <div style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#fff', borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '12px 16px 4px' }}>
              <QuickActions onActionClick={handleSend} />
            </div>
            <div style={{ padding: '8px 16px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <Input
                placeholder="Message Bhoomi AI..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onPressEnter={() => handleSend()}
                style={{ borderRadius: 24, background: isDark ? 'rgba(255,255,255,0.08)' : '#f5f5f5', border: 'none', padding: '10px 16px', color: isDark ? '#f3f4f6' : undefined }}
              />
              <Tooltip title="Voice Input">
                <Button shape="circle" icon={<AudioOutlined />} style={{ border: 'none', background: isDark ? 'rgba(255,255,255,0.08)' : '#f5f5f5', color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }} />
              </Tooltip>
              <Button 
                type="primary" 
                shape="circle" 
                icon={<SendOutlined />} 
                onClick={() => handleSend()}
                style={{ background: '#2E7D32', border: 'none', width: 40, height: 40 }}
              />
            </div>
          </div>

          <style>{`
            .dot-typing {
              animation: blink 1.4s infinite both;
            }
            @keyframes blink {
              0% { opacity: 0.2; }
              20% { opacity: 1; }
              100% { opacity: 0.2; }
            }
          `}</style>
        </Card>
      )}
    </>
  );
};

export default ChatWindow;
