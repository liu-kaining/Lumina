import { motion } from 'framer-motion';
import { Sparkles, Keyboard, MousePointer, ArrowRight } from 'lucide-react';
import './App.css';

function App() {
  const openSidePanel = async () => {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.windowId) {
        return;
      }
      if (browser.sidePanel?.open) {
        await browser.sidePanel.open({ windowId: tab.windowId });
      } else {
        // 备选方案：显示提示
        alert('请点击浏览器右上角的 LucidMark 图标，然后在侧边栏菜单中选择 LucidMark。\n\n或者在任意网页划选文本后右键发送到 LucidMark。');
      }
    } catch {
      alert('请点击浏览器右上角的 LucidMark 图标，然后在侧边栏菜单中选择 LucidMark。\n\n或者在任意网页划选文本后右键发送到 LucidMark。');
    }
  };

  return (
    <div className="popup-container">
      {/* 背景装饰 */}
      <div className="bg-glow" />

      {/* Logo 区域 */}
      <motion.div
        className="logo-section"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="logo-icon"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          ✨
        </motion.div>
        <h1 className="logo-text">LucidMark</h1>
        <p className="logo-subtitle">光影档案</p>
      </motion.div>

      {/* 打开侧边栏按钮 */}
      <motion.button
        className="primary-btn"
        onClick={openSidePanel}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Sparkles size={16} />
        <span>打开 LucidMark</span>
        <ArrowRight size={14} />
      </motion.button>

      {/* 使用提示 */}
      <motion.div
        className="tips"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="tip-item">
          <div className="tip-icon">
            <MousePointer size={12} />
          </div>
          <span>划选文本后右键发送</span>
        </div>
        <div className="tip-item">
          <div className="tip-icon">
            <Keyboard size={12} />
          </div>
          <span>快捷键 <kbd>⌘+Shift+L</kbd></span>
        </div>
      </motion.div>

      {/* 底部 */}
      <motion.div
        className="footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span>Made with ❤️ for creators</span>
      </motion.div>
    </div>
  );
}

export default App;