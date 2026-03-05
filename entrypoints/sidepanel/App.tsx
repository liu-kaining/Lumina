import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Sparkles, Zap, Palette, Image, Keyboard, MousePointer } from 'lucide-react';
import { MessageAction } from '../../src/types';
import { useAppStore } from '../../src/store/useAppStore';
import { SettingsPanel } from '../../src/components/settings/SettingsPanel';
import { GenerationPanel } from '../../src/components/GenerationPanel';
import { Gallery } from '../../src/components/ui/Gallery';
import WelcomePage from '../../src/components/welcome/WelcomePage';
import './style.css';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    selectedText,
    pageTitle,
    pageContext,
    setSelectedText,
    activeProviderId,
    providers,
  } = useAppStore();

  const activeProvider = providers.find((p) => p.id === activeProviderId);
  const hasApiKey = activeProvider?.credentials && 'apiKey' in activeProvider.credentials
    ? !!activeProvider.credentials.apiKey
    : false;

  useEffect(() => {
    console.log('LucidMark SidePanel loaded');

    const handleMessage = (message: MessageAction) => {
      console.log('SidePanel received message:', message);

      if (message.type === 'TEXT_SELECTED') {
        setSelectedText(
          message.payload.text,
          message.payload.context,
          message.payload.title
        );
      }
    };

    browser.runtime.onMessage.addListener(handleMessage);

    return () => {
      browser.runtime.onMessage.removeListener(handleMessage);
    };
  }, [setSelectedText]);

  const handleGenerated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // 未配置 API Key 的锁定状态
  if (!hasApiKey) {
    return <WelcomePage onOpenSettings={() => setShowSettings(true)} />;
  }

  // 主界面
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50 p-5">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between mb-5">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl font-bold flex items-center gap-2 text-gray-800"
        >
          <span className="text-2xl">✨</span>
          <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">LucidMark</span>
        </motion.h1>
        <motion.button
          onClick={() => setShowSettings(true)}
          className="p-2.5 rounded-xl bg-white/80 hover:bg-white text-gray-600 hover:text-orange-600 transition-colors shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="w-5 h-5" />
        </motion.button>
      </div>

      {/* 原文卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-5 shadow-sm border border-orange-100"
      >
        <div className="flex items-start gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-400 text-xs mb-1">页面</h3>
            <p className="text-gray-800 text-sm truncate font-medium">
              {pageTitle || '等待选择文本...'}
            </p>
          </div>
        </div>

        <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100">
          <h3 className="text-gray-400 text-xs mb-2">选中文本</h3>
          <p className="text-gray-700 text-sm leading-relaxed max-h-24 overflow-y-auto">
            {selectedText || '请在网页中划选文本...'}
          </p>
        </div>

        {pageContext && (
          <div className="mt-3 pt-3 border-t border-orange-100">
            <p className="text-gray-400 text-xs line-clamp-2">
              上下文: {pageContext}
            </p>
          </div>
        )}
      </motion.div>

      {/* 生成面板 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-5"
      >
        <GenerationPanel onGenerated={handleGenerated} />
      </motion.div>

      {/* 画廊 */}
      <motion.div
        key={refreshKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Gallery />
      </motion.div>

      {/* 设置面板 */}
      <AnimatePresence>
        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </div>
  );
}