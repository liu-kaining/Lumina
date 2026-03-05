import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Palette, Download, Settings, X } from 'lucide-react';
import { useState } from 'react';
import { SettingsPanel } from '../settings/SettingsPanel';

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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50 p-5">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-5 w-24 h-24 bg-amber-200/40 rounded-full blur-2xl" />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-yellow-200/20 rounded-full blur-3xl" />
      </div>

      {/* Logo 区域 */}
      <motion.div
        className="relative text-center pt-10 pb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-4xl">✨</span>
        </motion.div>
        
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent">
          LucidMark
        </h1>
        <p className="text-sm text-orange-700/60 mt-1 font-medium">光影档案 · 智能配图助手</p>
      </motion.div>

      {/* 功能卡片 */}
      <motion.div
        className="relative space-y-3 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-orange-100 shadow-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0">
              <feature.icon className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{feature.title}</h3>
              <p className="text-xs text-gray-500">{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* 使用指南 */}
      <motion.div
        className="relative bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-orange-100 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-500" />
          使用指南
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-orange-100 text-orange-600 text-xs flex items-center justify-center font-medium">1</span>
            划选网页上的文本
          </p>
          <p className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-orange-100 text-orange-600 text-xs flex items-center justify-center font-medium">2</span>
            右键选择「发送至 LucidMark」
          </p>
          <p className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-orange-100 text-orange-600 text-xs flex items-center justify-center font-medium">3</span>
            选择风格，一键生成精美配图
          </p>
        </div>
      </motion.div>

      {/* 设置按钮 */}
      <motion.button
        onClick={() => setShowSettings(true)}
        className="relative w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Settings className="w-5 h-5" />
        配置 AI Provider
      </motion.button>

      {/* 底部提示 */}
      <motion.p
        className="text-center text-xs text-gray-400 mt-6"
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