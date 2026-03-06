import { MessageAction } from '../src/types';

export default defineBackground(() => {
  // 监听扩展安装事件
  browser.runtime.onInstalled.addListener(() => {
    browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

    // 创建右键菜单
    browser.contextMenus.create({
      id: 'lucidmark-generate',
      title: '✨ 发送至 LucidMark 生成配图',
      contexts: ['selection'],
    });
  });

  // 监听右键菜单点击
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'lucidmark-generate' && info.selectionText && tab?.id) {
      // 打开侧边栏
      await browser.sidePanel.open({ tabId: tab.id });

      // 发送选中文本到侧边栏
      const message: MessageAction = {
        type: 'TEXT_SELECTED',
        payload: {
          text: info.selectionText,
          html: info.selectionText || '',
          title: tab.title || '',
          context: '', // 右键菜单无法获取上下文，由 content script 负责获取
        },
      };

      // 延迟发送，确保 sidePanel 已打开
      setTimeout(() => {
        browser.runtime.sendMessage(message);
      }, 300);
    }
  });

  // 监听快捷键命令
  browser.commands.onCommand.addListener(async (command, tab) => {
    if (command === 'generate-image' && tab?.id) {
      // 打开侧边栏
      await browser.sidePanel.open({ tabId: tab.id });

      // 通知 content script 获取选中文本
      try {
        const response = await browser.tabs.sendMessage(tab.id, { type: 'GET_SELECTION' });
        if (response?.text) {
          const message: MessageAction = {
            type: 'TEXT_SELECTED',
            payload: {
              text: response.text,
              html: response.html || response.text || '',
              title: response.title || '',
              context: response.context || '',
            },
          };
          setTimeout(() => {
            browser.runtime.sendMessage(message);
          }, 300);
        }
      } catch {
        // tab may not have content script or selection
      }
    }
  });

  // 监听来自 content script 的消息
  browser.runtime.onMessage.addListener((message: MessageAction) => {
    if (message.type === 'TEXT_SELECTED') {
      // 转发给 sidePanel
      browser.runtime.sendMessage(message);
    }
  });
});
