import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Sparkles } from 'lucide-react';
import { MessageAction } from '../../src/types';
import { useAppStore } from '../../src/store/useAppStore';
import { SettingsPanel } from '../../src/components/settings/SettingsPanel';
import { GenerationPanel } from '../../src/components/GenerationPanel';
import { Gallery } from '../../src/components/ui/Gallery';
import WelcomePage from '../../src/components/welcome/WelcomePage';
import './workspace.css';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    selectedText,
    selectedHtml,
    pageTitle,
    pageContext,
    setSelectedText,
    activeProviderId,
    providers,
  } = useAppStore();

  const activeProvider = providers?.find((p) => p.id === activeProviderId);

  // 检查是否已配置凭证
  const hasApiKey = (() => {
    if (!activeProvider?.credentials) return false;
    // Gemini: 检查 apiKey
    if ('apiKey' in activeProvider.credentials) {
      return !!activeProvider.credentials.apiKey;
    }
    // Custom OpenAI: 检查 textModel 和 imageModel 的 apiKey
    if ('textModel' in activeProvider.credentials && 'imageModel' in activeProvider.credentials) {
      return !!activeProvider.credentials.textModel?.apiKey && !!activeProvider.credentials.imageModel?.apiKey;
    }
    return false;
  })();

  if (!providers || providers.length === 0) {
    return (
      <div className="ws-loading-wrap">
        <div className="ws-loading-text">加载中...</div>
      </div>
    );
  }

  useEffect(() => {
    console.log('LucidMark SidePanel loaded');

    const handleMessage = (message: MessageAction) => {
      console.log('SidePanel received message:', message);

      if (message.type === 'TEXT_SELECTED') {
        setSelectedText(
          message.payload.text,
          message.payload.html,
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

  return (
    <div className="ws-root">
      <div className="ws-header">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="ws-title-wrap"
        >
          <span className="ws-title-emoji">✨</span>
          <span className="ws-title-text">LucidMark</span>
        </motion.h1>
        <motion.button
          type="button"
          onClick={() => setShowSettings(true)}
          className="ws-settings-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="设置"
        >
          <Settings />
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="ws-card"
      >
        <div className="ws-card-page-row">
          <Sparkles />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 className="ws-card-page-label">页面</h3>
            <p className="ws-card-page-value">
              {pageTitle || '等待选择文本...'}
            </p>
          </div>
        </div>

        <div className={`ws-card-text-box ${!selectedText ? 'is-placeholder' : ''}`}>
          <h3 className="ws-card-text-label">选中文本</h3>
          <div
            className="ws-card-text-value ws-rich-content"
            dangerouslySetInnerHTML={{ __html: selectedHtml || selectedText || '请在网页中划选文本...' }}
          />
        </div>

        {pageContext && (
          <div className="ws-card-context">
            上下文: {pageContext}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: '1.25rem' }}
      >
        <GenerationPanel onGenerated={handleGenerated} />
      </motion.div>

      <motion.div
        key={refreshKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Gallery />
      </motion.div>

      <AnimatePresence>
        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </div>
  );
}