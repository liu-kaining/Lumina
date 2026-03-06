export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    /**
     * 获取选中文本及其上下文（包含 HTML 格式）
     */
    function getSelectionWithContext() {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        return null;
      }

      const selectedText = selection.toString().trim();

      // 文本太短则忽略
      if (selectedText.length < 2) {
        return null;
      }

      // 获取 HTML 格式
      let selectedHtml = '';
      let contextSnippet = '';

      try {
        const range = selection.getRangeAt(0);

        // 克隆选中内容并获取 HTML
        const fragment = range.cloneContents();
        const div = document.createElement('div');
        div.appendChild(fragment);
        selectedHtml = div.innerHTML;

        // 如果选中内容不包含完整表格，尝试获取整个表格
        if (!selectedHtml.includes('<table')) {
          const commonAncestor = range.commonAncestorContainer;
          let tableElement: HTMLElement | null = null;
          let listElement: HTMLElement | null = null;

          // 检查 commonAncestor 是否是表格或包含在表格中
          if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
            tableElement = (commonAncestor as HTMLElement).closest('table');
            listElement = (commonAncestor as HTMLElement).closest('ul, ol');
          } else if (commonAncestor.parentElement) {
            tableElement = commonAncestor.parentElement.closest('table');
            listElement = commonAncestor.parentElement.closest('ul, ol');
          }

          // 如果找到了表格元素，使用整个表格
          if (tableElement) {
            selectedHtml = tableElement.outerHTML;
          } else if (listElement) {
            selectedHtml = listElement.outerHTML;
          }
        }

        // 获取上下文
        const container = range.commonAncestorContainer;
        const textNode = container.nodeType === Node.TEXT_NODE
          ? container
          : container.parentElement?.childNodes[0];

        if (textNode && textNode.textContent) {
          const fullText = textNode.textContent;
          const startOffset = Math.max(0, range.startOffset - 100);
          const endOffset = Math.min(fullText.length, range.endOffset + 100);

          contextSnippet = fullText.substring(startOffset, endOffset);
        }
      } catch {
        // ignore context extraction errors
      }

      return {
        text: selectedText,
        html: selectedHtml,
        title: document.title,
        context: contextSnippet,
      };
    }

    // 监听鼠标抬起事件
    document.addEventListener('mouseup', (event) => {
      const result = getSelectionWithContext();

      if (result && result.text.length > 2) {
        // 发送到 background
        browser.runtime.sendMessage({
          type: 'TEXT_SELECTED',
          payload: result,
        });
      }
    });

    // 监听来自 background 的消息（快捷键触发）
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'GET_SELECTION') {
        const result = getSelectionWithContext();
        sendResponse(result);
      }
    });
  },
});
