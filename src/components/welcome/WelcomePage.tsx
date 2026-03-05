import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Palette, Download, Settings } from 'lucide-react';
import { useState } from 'react';
import { SettingsPanel } from '../settings/SettingsPanel';
import './welcome.css';

interface WelcomePageProps {
  onOpenSettings: () => void;
}

export default function WelcomePage({ onOpenSettings }: WelcomePageProps) {
  const [showSettings, setShowSettings] = useState(false);

  const features = [
    { icon: Zap, title: '一键生成', desc: '划选文本即可生成精美配图' },
    { icon: Palette, title: '多种风格', desc: '电影感、吉卜力、赛博朋克等' },
    { icon: Download, title: '本地存储', desc: '图片安全存储在本地，隐私无忧' },
  ];

  return (
    <div className="welcome-root">
      {/* 背景装饰 */}
      <div className="welcome-bg-blur">
        <div className="blur-1" />
        <div className="blur-2" />
        <div className="blur-3" />
      </div>

      {/* Logo 区域 */}
      <motion.div
        className="welcome-logo-wrap"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="welcome-logo-box"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="icon-emoji">✨</span>
        </motion.div>
        <h1 className="welcome-title">LucidMark</h1>
        <p className="welcome-subtitle">光影档案 · 智能配图助手</p>
      </motion.div>

      {/* 功能卡片 */}
      <motion.div
        className="welcome-features"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="welcome-feature-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
          >
            <div className="welcome-feature-icon">
              <feature.icon />
            </div>
            <div>
              <h3 className="welcome-feature-title">{feature.title}</h3>
              <p className="welcome-feature-desc">{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* 使用指南 */}
      <motion.div
        className="welcome-guide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h3 className="welcome-guide-title">
          <Sparkles />
          使用指南
        </h3>
        <div className="welcome-guide-steps">
          <p>
            <span className="welcome-guide-num">1</span>
            划选网页上的文本
          </p>
          <p>
            <span className="welcome-guide-num">2</span>
            右键选择「发送至 LucidMark」
          </p>
          <p>
            <span className="welcome-guide-num">3</span>
            选择风格，一键生成精美配图
          </p>
        </div>
      </motion.div>

      {/* 设置按钮 */}
      <motion.button
        type="button"
        className="welcome-btn"
        onClick={() => setShowSettings(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Settings />
        配置 AI Provider
      </motion.button>

      {/* 底部提示 */}
      <motion.p
        className="welcome-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        需要配置 API Key 才能使用
      </motion.p>

      {/* 设置面板 */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}