document.addEventListener('DOMContentLoaded', () => {
  // 加载保存的设置
  chrome.storage.local.get(['clientId', 'apiKey', 'typeId', 'categoryId'], (result) => {
    if (result.clientId) document.getElementById('client-id').value = result.clientId;
    if (result.apiKey) document.getElementById('api-key').value = result.apiKey;
  });
  
  // 保存设置
  document.getElementById('save-settings').addEventListener('click', () => {
    const clientId = document.getElementById('client-id').value;
    const apiKey = document.getElementById('api-key').value;
    
    chrome.storage.local.set({ clientId, apiKey,}, () => {
      showStatus('设置已保存！', 'success');
    });
  });
  
  // 获取商品属性
  document.getElementById('get-attributes').addEventListener('click', async () => {
    const clientId = document.getElementById('client-id').value;
    const apiKey = document.getElementById('api-key').value;
	
	
	
	
    const typeId = document.getElementById('type-id').value;
    const categoryId = document.getElementById('category-id').value;
    
    if (!clientId || !apiKey) {
      showStatus('请填写所有字段！', 'error');
      return;
    }
    
    // 保存设置
    chrome.storage.local.set({ clientId, apiKey});
    
    showStatus('正在获取商品属性...', 'loading');
    
    // 通过后台脚本调用API
    chrome.runtime.sendMessage({
      action: 'get_attribute',
      type_id: typeId,
      description_category_id: categoryId,
      clientId,
      apiKey
    }, (response) => {
      if (response.error) {
        showStatus(`获取失败: ${response.error}`, 'error');
        return;
      }
      
      showStatus('获取成功！正在显示属性...', 'success');
      
      // 发送数据给内容脚本显示对话框
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'show_attributes',
          data: response
        });
      });
    });
  });
  
  // 显示状态消息
  function showStatus(message, type) {
    const statusEl = document.getElementById('status-message');
    statusEl.textContent = message;
    statusEl.className = 'status';
    
    if (type === 'success') {
      statusEl.style.backgroundColor = '#d4edda';
      statusEl.style.color = '#155724';
    } else if (type === 'error') {
      statusEl.style.backgroundColor = '#f8d7da';
      statusEl.style.color = '#721c24';
    } else if (type === 'loading') {
      statusEl.style.backgroundColor = '#cce5ff';
      statusEl.style.color = '#004085';
    }
  }
});

// document.getElementById("m3u8Download").addEventListener("click", async () => {
//   const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     func: () => window.getM3U8AndDownload && window.getM3U8AndDownload()
//   });
// });