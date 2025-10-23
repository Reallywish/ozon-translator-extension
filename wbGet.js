// 在页面上添加下载按钮
function addDownloadButton() {
    // 避免重复添加
    if (document.getElementById('m3u8-downloader-button')) return;

    const button = document.createElement('button');
    button.id = 'm3u8-downloader-button';
    button.innerHTML = '🎬 下载视频';

    // 按钮样式
    button.style.position = 'fixed';
    button.style.top = '200px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '12px 18px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '10px';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
    button.style.fontFamily = 'Arial, sans-serif';
    button.style.fontSize = '14px';
    button.style.fontWeight = '600';
    button.style.transition = 'all 0.3s ease';
    button.style.opacity = '1';
    button.style.display = 'block';


    // 鼠标悬停效果
    button.addEventListener('mouseover', () => {
        button.style.transform = 'translateY(-3px)';
        button.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
        button.style.backgroundColor = '#45a049';
    });

    button.addEventListener('mouseout', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
        button.style.backgroundColor = '#4CAF50';
    });

    // 点击事件
    button.addEventListener('click', () => {
        // 查找所有video元素
        const videos = document.querySelector("div.wb-player__video[src*='.m3u8']");
        let m3u8Url = null;

        if (videos) {
            m3u8Url = videos.getAttribute('src');

            console.log("找到 m3u8 链接：", m3u8Url);
            downloadM3U8Video(m3u8Url);  // 调用你已有的下载函数
        } else {
            alert("未找到 M3U8 视频链接！");
        }
    });

    document.body.appendChild(button);


}

function addDownloadImageButton() {
    if (document.getElementById('img-downloader-button')) return;

    const button = document.createElement('button');
    button.id = 'img-downloader-button';
    button.innerHTML = '📸 下载大图';

    // 按钮样式（可调整位置，这里示例放在视频按钮上方）
    button.style.position = 'fixed';
    button.style.top = '150px';  // 增加间距避免重叠
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '12px 18px';
    button.style.backgroundColor = '#2196F3';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '10px';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.3)';
    button.style.fontFamily = 'Arial, sans-serif';
    button.style.fontSize = '14px';
    button.style.fontWeight = '600';
    button.style.transition = 'all 0.3s ease';
    button.style.opacity = '1';
    button.style.display = 'block';

    button.addEventListener('mouseover', () => {
        button.style.transform = 'translateY(-3px)';
        button.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
        button.style.backgroundColor = '#1976d2';
    });
    button.addEventListener('mouseout', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.3)';
        button.style.backgroundColor = '#2196F3';
    });

    button.addEventListener('click', async () => {
        // 提取网页 URL 中的倒数第二段
    const urlParts = location.pathname.split('/');
    const pageId = urlParts.length >= 2 ? urlParts[urlParts.length - 2] : null;

    if (!pageId) {
        console.warn('无法提取页面ID，已跳过下载');
        return;
    }

    // 找所有 img 标签，优先取 data-src-pb
    const imgs = document.querySelectorAll('img[data-src-pb], img[src]');
    const urls = [];

    for (const img of imgs) {
        let url = img.getAttribute('data-src-pb') || img.src;
        if (!url) continue;

        // 只处理包含当前页面ID的链接
        if (!url.includes(pageId)) continue;

        const parts = url.split('/');
        if (parts.length >= 2) parts[parts.length - 2] = 'big';

        const finalUrl = parts.join('/');
        urls.push(finalUrl);
    }
        const unique = Array.from(new Set(urls));
        console.log(`图片链接共 ${unique.length} 个:`, unique);

        chrome.runtime.sendMessage({type: 'images', urls: unique});
    });

    document.body.appendChild(button);
}


// 上传商品按钮与弹窗
function addUploadProductButton() {
    if (document.getElementById('upload-product-button')) return;

    const button = document.createElement('button');
    button.id = 'upload-product-button';
    button.innerHTML = '📦 上传商品';

    button.style.position = 'fixed';
    button.style.top = '100px';  // 增加间距避免重叠
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '12px 18px';
    button.style.backgroundColor = '#673ab7';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '10px';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
    button.style.fontFamily = 'Arial, sans-serif';
    button.style.fontSize = '14px';
    button.style.fontWeight = '600';
    button.style.transition = 'all 0.3s ease';
    button.style.opacity = '1';
    button.style.display = 'block';

    button.addEventListener('mouseover', () => { 
        button.style.transform = 'translateY(-3px)';
        button.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
        button.style.backgroundColor = '#5e35b1';
    });
    button.addEventListener('mouseout', () => { 
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
        button.style.backgroundColor = '#673ab7';
    });

    button.addEventListener('click', async () => {
        // 采集当前页面大图 URL（与下载逻辑一致）
        const urlParts = location.pathname.split('/');
        const pageId = urlParts.length >= 2 ? urlParts[urlParts.length - 2] : null;
        const urls = [];
        if (pageId) {
            const imgs = document.querySelectorAll('img[data-src-pb], img[src]');
            for (const img of imgs) {
                let url = img.getAttribute('data-src-pb') || img.src;
                if (!url || !url.includes(pageId)) continue;
                const parts = url.split('/');
                if (parts.length >= 2) parts[parts.length - 2] = 'big';
                urls.push(parts.join('/'));
            }
        }
        const uniqueUrls = Array.from(new Set(urls));

        openUploadModal(uniqueUrls);
    });

    document.body.appendChild(button);
}

async function openUploadModal(imageUrls) {
    // 读取存储的 ClientId/ApiKey - 使用更安全的方式
    let storage = { clientId: '', apiKey: '' };
    try {
        // 方法1: 直接使用 chrome.storage
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            storage = await new Promise(resolve => chrome.storage.local.get(['clientId', 'apiKey'], resolve));
        }
        // 方法2: 通过消息传递到 background script
        else if (typeof chrome !== 'undefined' && chrome.runtime) {
            storage = await new Promise(resolve => {
                chrome.runtime.sendMessage({ action: 'get_storage' }, (response) => {
                    resolve(response || { clientId: '', apiKey: '' });
                });
            });
        }
    } catch (error) {
        console.warn('无法读取存储的配置:', error);
        // 如果无法读取存储，使用空值
        storage = { clientId: '', apiKey: '' };
    }

    const modal = document.createElement('div');
    modal.id = 'wb-upload-modal';
    modal.style.cssText = `
      position: fixed; top: 50px; left: 50px; z-index: 10000; width: 95%; max-width: 1000px; max-height: 90vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); overflow: hidden; backdrop-filter: blur(10px);`

    modal.innerHTML = `
    <div id="wb-modal-header" style="display:flex; align-items:center; justify-content: space-between; padding: 20px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:#fff; cursor: move; border-radius: 16px 16px 0 0;">
      <h2 style="margin:0; font-size: 1.4rem; font-weight: 600;">📦 上传商品</h2>
      <button id="wb-close-modal" style="background: rgba(255,255,255,0.2); border: none; font-size: 1.8rem; cursor: pointer; color: #fff; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">&times;</button>
    </div>
    <div style="padding: 24px; overflow:auto; max-height: calc(90vh - 80px); background: rgba(255,255,255,0.9);">
      <div style="display:grid; grid-template-columns: 1fr; gap: 20px;">
        <div style="background: rgba(255,255,255,0.8); border-radius:12px; padding:20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); backdrop-filter: blur(10px);">
          <div style="font-weight:bold; font-size: 1.1rem; color: #333; margin-bottom: 12px;">🔑 Ozon API 配置</div>
          <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
            <input id="wb-client-id" placeholder="Client ID" style="padding:12px; border:2px solid #e1e5e9; border-radius:8px; font-size: 14px; transition: border-color 0.3s;" value="${storage.clientId || ''}"/>
            <input id="wb-api-key" placeholder="API Key" style="padding:12px; border:2px solid #e1e5e; border-radius:8px; font-size: 14px; transition: border-color 0.3s;" value="${storage.apiKey || ''}"/>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.8); border-radius:12px; padding:20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); backdrop-filter: blur(10px);">
          <div style="font-weight:bold; font-size: 1.1rem; color: #333; margin-bottom: 12px;">🖼️ 商品图片</div>
          <textarea id="wb-image-textarea" style="width:100%; margin-top:8px; padding:12px; border:2px solid #e1e5e9; border-radius:8px; min-height:80px; font-size: 14px; resize: vertical;">${imageUrls.join(',')}</textarea>
          <div id="wb-image-thumbs" style="margin-top: 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px;"></div>
        </div>

        <div style="background: rgba(255,255,255,0.8); border-radius:12px; padding:20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); backdrop-filter: blur(10px);">
          <div style="font-weight:bold; font-size: 1.1rem; color: #333; margin-bottom: 12px;">📂 选择类目（三级联动）</div>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top:12px;">
            <select id="wb-cat-top" style="padding:12px; border:2px solid #e1e5e9; border-radius:8px; font-size: 14px; background: white;"></select>
            <select id="wb-cat-second" style="padding:12px; border:2px solid #e1e5e9; border-radius:8px; font-size: 14px; background: white;"></select>
            <select id="wb-cat-third" style="padding:12px; border:2px solid #e1e5e9; border-radius:8px; font-size: 14px; background: white;"></select>
          </div>
          <div style="margin-top:16px; display:flex; gap:12px;">
            <button id="wb-fetch-attrs" style="padding:12px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight: 600; transition: all 0.3s;">🔍 获取属性</button>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.8); border-radius:12px; padding:20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); backdrop-filter: blur(10px);">
          <div style="font-weight:bold; font-size: 1.1rem; color: #333; margin-bottom: 12px;">📏 商品尺寸信息</div>
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top:12px;">
            <input type="number" placeholder="长度 (mm)" data-id="depth" style="padding:12px; border:2px solid #e1e5e9; border-radius:8px; font-size: 14px; background: white;">
            <input type="number" placeholder="宽度 (mm)" data-id="width" style="padding:12px; border:2px solid #e1e5e9; border-radius:8px; font-size: 14px; background: white;">
            <input type="number" placeholder="高度 (mm)" data-id="height" style="padding:12px; border:2px solid #e1e5e9; border-radius:8px; font-size: 14px; background: white;">
            <input type="number" placeholder="重量 (g)" data-id="weight" style="padding:12px; border:2px solid #e1e5e9; border-radius:8px; font-size: 14px; background: white;">
            <input type="text" placeholder="货号" data-id="offer_id" style="padding:12px; border:2px solid #e1e5e9; border-radius:8px; font-size: 14px; background: white;">
            <input type="number" placeholder="原价" data-id="old_price" style="padding:12px; border:2px solid #e1e5e9; border-radius:8px; font-size: 14px; background: white;" value="188">
            <input type="number" placeholder="现价" data-id="price" style="padding:12px; border:2px solid #e1e5e9; border-radius:8px; font-size: 14px; background: white;" value="111">
            <input type="text" placeholder="type_id" data-id="type_id" style="padding:12px; border:2px solid #e1e5e9; border-radius:8px; font-size: 14px; background: white;" readonly>
            <input type="text" placeholder="description_category_id" data-id="description_category_id" style="padding:12px; border:2px solid #e1e5e9; border-radius:8px; font-size: 14px; background: white;" readonly>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.8); border-radius:12px; padding:20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); backdrop-filter: blur(10px);">
          <div style="font-weight:bold; font-size: 1.1rem; color: #333; margin-bottom: 12px;">⚙️ 商品属性</div>
          <div id="wb-attrs-container" style="margin-top:12px; display:grid; grid-template-columns: 1fr; gap:16px;"></div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:12px; margin-top: 20px;">
          <button id="wb-upload-confirm" style="padding:14px 28px; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight: 600; font-size: 16px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);">✅ 确定上传</button>
        </div>
      </div>
    </div>`;

    document.body.appendChild(modal);

    // 自动生成货号
    const offerInput = modal.querySelector('input[data-id="offer_id"]');
    if (offerInput && !offerInput.value) {
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const pageId = location.pathname.split('/').pop() || 'WB';
        offerInput.value = `${pageId}-${randomSuffix}`;
    }

    // 可拖动
    (function makeDraggable() {
        const header = modal.querySelector('#wb-modal-header');
        if (!header) return;
        let isDragging = false; let offsetX = 0; let offsetY = 0;
        header.addEventListener('mousedown', (e) => {
            isDragging = true; const rect = modal.getBoundingClientRect();
            offsetX = e.clientX - rect.left; offsetY = e.clientY - rect.top;
            modal.style.userSelect = 'none'; document.body.style.userSelect = 'none';
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const newLeft = Math.min(Math.max(0, e.clientX - offsetX), window.innerWidth - modal.offsetWidth);
            const newTop = Math.min(Math.max(0, e.clientY - offsetY), window.innerHeight - modal.offsetHeight);
            modal.style.left = `${newLeft}px`; modal.style.top = `${newTop}px`;
            modal.style.right = 'auto'; modal.style.bottom = 'auto';
        });
        document.addEventListener('mouseup', () => {
            isDragging = false; modal.style.userSelect = ''; document.body.style.userSelect = '';
        });
    })();

    modal.querySelector('#wb-close-modal').addEventListener('click', () => modal.remove());

    // 渲染图片预览
    const imageTextarea = modal.querySelector('#wb-image-textarea');
    const thumbs = modal.querySelector('#wb-image-thumbs');
    const parseUrls = (text) => text.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
    const writeUrls = (arr) => imageTextarea.value = arr.join(',');
    const renderThumbs = () => {
        const urls = parseUrls(imageTextarea.value);
        if (urls.length === 0) { 
            thumbs.innerHTML = '<div style="color:#888; text-align:center; padding:20px; font-style:italic;">暂无图片链接</div>'; 
            return; 
        }
        thumbs.innerHTML = urls.map((u, idx) => `
          <div draggable="true" data-index="${idx}" style="border:2px solid #e1e5e9; border-radius:12px; padding:12px; background:#fff; display:flex; flex-direction:column; gap:12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.3s ease; cursor: move;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'">
            <div style="width:100%; aspect-ratio:1/1; overflow:hidden; border-radius:8px; background:#f8f9fa; display:flex; align-items:center; justify-content:center; position:relative;">
              <img src="${u}" style="max-width:100%; max-height:100%; object-fit:contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/>
              <div style="display:none; flex-direction:column; align-items:center; justify-content:center; color:#999; font-size:12px;">
                <div>❌</div>
                <div>图片加载失败</div>
              </div>
            </div>
            <div style="display:flex; gap:8px;">
              <button data-act="copy" data-url="${u}" style="flex:1; padding:8px 12px; border:1px solid #667eea; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:#fff; border-radius:6px; cursor:pointer; font-size:12px; font-weight:500;">📋 复制</button>
              <button data-act="delete" data-url="${u}" style="flex:1; padding:8px 12px; border:1px solid #ff6b6b; background:linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color:#fff; border-radius:6px; cursor:pointer; font-size:12px; font-weight:500;">🗑️ 删除</button>
            </div>
          </div>`).join('');
    };
    imageTextarea.addEventListener('input', () => {
        const unique = Array.from(new Set(parseUrls(imageTextarea.value)));
        writeUrls(unique); renderThumbs();
    });
    writeUrls(Array.from(new Set(imageUrls))); renderThumbs();

    // 拖拽排序功能
    let draggedIndex = null;
    thumbs.addEventListener('dragstart', (e) => {
        const item = e.target.closest('[data-index]');
        if (!item) return;
        draggedIndex = Number(item.getAttribute('data-index'));
        item.style.opacity = '0.5';
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            try { e.dataTransfer.setData('text/plain', String(draggedIndex)); } catch (_) {}
        }
    });

    thumbs.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    });

    thumbs.addEventListener('drop', (e) => {
        e.preventDefault();
        const target = e.target.closest('[data-index]');
        if (!target) return;
        const targetIndex = Number(target.getAttribute('data-index'));
        if (draggedIndex === null || targetIndex === draggedIndex) return;
        
        const urls = parseUrls(imageTextarea.value);
        if (draggedIndex < 0 || draggedIndex >= urls.length || targetIndex < 0 || targetIndex >= urls.length) return;
        
        const [moved] = urls.splice(draggedIndex, 1);
        urls.splice(targetIndex, 0, moved);
        writeUrls(urls);
        draggedIndex = null;
        renderThumbs();
    });

    thumbs.addEventListener('dragend', (e) => {
        const item = e.target.closest('[data-index]');
        if (item) item.style.opacity = '1';
        draggedIndex = null;
    });

    // 复制和删除功能
    thumbs.addEventListener('click', async (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        const action = target.getAttribute('data-act');
        const url = target.getAttribute('data-url');
        if (!action || !url) return;
        
        const urls = parseUrls(imageTextarea.value);
        if (action === 'copy') {
            try { 
                await navigator.clipboard.writeText(url); 
                // 临时显示复制成功提示
                const btn = target;
                const originalText = btn.textContent;
                btn.textContent = '✅ 已复制';
                btn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                }, 1500);
            } catch (_) {
                alert('复制失败，请手动复制');
            }
        } else if (action === 'delete') {
            if (confirm('确定要删除这张图片吗？')) {
                const next = urls.filter(u => u !== url);
                writeUrls(next);
                renderThumbs();
            }
        }
    });

    // 三级联动：读取 leimu_data.conf
    const selTop = modal.querySelector('#wb-cat-top');
    const selSecond = modal.querySelector('#wb-cat-second');
    const selThird = modal.querySelector('#wb-cat-third');
    let leimuDataCache = null;
    
    async function loadLeimu() {
        if (leimuDataCache) return leimuDataCache;
        try {
            const url = chrome.runtime.getURL('leimu_data_zh.conf');
            console.log('尝试加载文件:', url);
            const resp = await fetch(url);
            console.log('响应状态:', resp.status, resp.statusText);
            
            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
            }
            
            const text = await resp.text();
            console.log('文件内容长度:', text.length);
            
            // 检查文件内容是否为空或无效
            if (!text || text.trim() === '') {
                throw new Error('文件内容为空');
            }
            
            // 尝试解析JSON
            try {
                leimuDataCache = JSON.parse(text);
                console.log('leimu_data_zh.conf 加载成功:', leimuDataCache);
                return leimuDataCache;
            } catch (parseError) {
                console.error('JSON解析失败:', parseError);
                console.error('文件内容前100个字符:', text.substring(0, 100));
                throw new Error(`JSON解析失败: ${parseError.message}`);
            }
        } catch (error) {
            console.error('加载 leimu_data_zh.conf 失败:', error);
            console.error('错误详情:', error.message);
            return null;
        }
    }
    
    function fillSelect(selectEl, items, getLabel, getValue) {
        selectEl.innerHTML = '';
        const opt0 = document.createElement('option');
        opt0.value = '';
        opt0.textContent = '请选择';
        selectEl.appendChild(opt0);
        
        (items || []).forEach(it => {
            const opt = document.createElement('option');
            opt.value = String(getValue(it));
            opt.textContent = getLabel(it);
            opt.dataset.payload = JSON.stringify(it);
            selectEl.appendChild(opt);
        });
    }
    
    function getSelectedPayload(selectEl) {
        const v = selectEl.options[selectEl.selectedIndex];
        if (!v || !v.dataset.payload) return null;
        try { 
            return JSON.parse(v.dataset.payload); 
        } catch (_) { 
            return null; 
        }
    }
    
    // 初始化三级联动
    (async () => {
        const data = await loadLeimu();
        if (!data || !Array.isArray(data.result)) {
            console.error('leimu_data_zh.conf 数据格式错误');
            return;
        }
        
        const tops = data.result;
        console.log('顶级分类数量:', tops.length);
        fillSelect(selTop, tops, it => it.category_name, it => it.description_category_id);
        fillSelect(selSecond, [], it => it.category_name, it => it.description_category_id);
        fillSelect(selThird, [], it => it.type_name, it => it.type_id);
    })();

    selTop.addEventListener('change', () => {
        const payload = getSelectedPayload(selTop);
        if (!payload) {
            fillSelect(selSecond, [], it => it.category_name, it => it.description_category_id);
            fillSelect(selThird, [], it => it.type_name, it => it.type_id);
            return;
        }
        
        const seconds = (payload.children && Array.isArray(payload.children)) ? payload.children : [];
        console.log('二级分类数量:', seconds.length);
        fillSelect(selSecond, seconds, it => it.category_name, it => it.description_category_id);
        fillSelect(selThird, [], it => it.type_name, it => it.type_id);
    });
    
    selSecond.addEventListener('change', () => {
        const payload = getSelectedPayload(selSecond);
        if (!payload) {
            fillSelect(selThird, [], it => it.type_name, it => it.type_id);
            return;
        }
        
        const thirds = (payload.children && Array.isArray(payload.children)) ? payload.children : [];
        console.log('三级分类数量:', thirds.length);
        fillSelect(selThird, thirds, it => it.type_name, it => it.type_id);
    });

    // 获取属性并渲染
    const attrsContainer = modal.querySelector('#wb-attrs-container');
    modal.querySelector('#wb-fetch-attrs').addEventListener('click', async () => {
        const third = getSelectedPayload(selThird);
        const second = getSelectedPayload(selSecond);
        if (!third || !third.type_name) { alert('请先选择完整类目（第三级）'); return; }
        if (!second || !second.description_category_id) { alert('请先选择完整类目（第二级）'); return; }

        const clientId = modal.querySelector('#wb-client-id').value.trim();
        const apiKey = modal.querySelector('#wb-api-key').value.trim();
        if (!clientId || !apiKey) { alert('请填写 Client ID 和 API Key'); return; }
        
        // 安全地保存配置
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ clientId, apiKey });
            } else if (typeof chrome !== 'undefined' && chrome.runtime) {
                // 通过消息传递保存配置
                chrome.runtime.sendMessage({ 
                    action: 'set_storage', 
                    data: { clientId, apiKey } 
                });
            }
        } catch (error) {
            console.warn('无法保存配置:', error);
        }

        console.log('获取属性参数:', {
            type_name: third.type_name,
            type_id: third.type_id,
            description_category_id: second.description_category_id
        });

        // 显示加载进度
        const fetchBtn = modal.querySelector('#wb-fetch-attrs');
        const originalText = fetchBtn.textContent;
        fetchBtn.textContent = '⏳ 获取中...';
        fetchBtn.disabled = true;
        fetchBtn.style.opacity = '0.7';
        
        // 添加加载动画
        const loadingDiv = document.createElement('div');
        loadingDiv.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10001;
            background: rgba(255,255,255,0.95); padding: 30px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            display: flex; flex-direction: column; align-items: center; gap: 16px; backdrop-filter: blur(10px);
        `;
        loadingDiv.innerHTML = `
            <div style="width: 40px; height: 40px; border: 4px solid #e1e5e9; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <div style="font-size: 16px; color: #333; font-weight: 500;">正在获取商品属性...</div>
            <div style="font-size: 14px; color: #666;">请稍候，这可能需要几秒钟</div>
        `;
        
        // 添加CSS动画
        if (!document.getElementById('loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(loadingDiv);

        try {
            // 直接使用已选择的 type_id 和 description_category_id，不需要通过 type_name 映射
            const resp = await new Promise(resolve => chrome.runtime.sendMessage({
                action: 'get_attribute_direct',
                type_id: third.type_id,
                description_category_id: second.description_category_id,
                clientId, apiKey
            }, resolve));
            
            if (!resp || resp.error) { 
                alert(`获取属性失败: ${resp && resp.error ? resp.error : '未知错误'}`); 
                return; 
            }

            // 渲染属性表单（简化版）
            attrsContainer.innerHTML = '';
            const excludeKeywords = ['PDF文件名称', 'Ozon.视频封面：链接', 'Ozon.视频：视频中的产品', 'PDF 文件', 'Ozon.视频： 名称', 'Ozon视频： 链接', '为命名模板用的型号名称', '品牌', '欧亚经济联盟对外经济活动商品命名代码', '最高温度', '最低温度', '卖家代码', '#主题标签', '制造国', '名称', '商品保修，月', '保质期（天）'];
            (resp.result || []).forEach(attr => {
                const nameZh = attr.name_zh || '';
                if (excludeKeywords.includes(nameZh)) return;
                const wrap = document.createElement('div');
                wrap.style.cssText = 'background:#fff; border:2px solid #e1e5e9; border-radius:12px; padding:16px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);';
                const title = document.createElement('div');
                title.innerHTML = `<b style="color: #333; font-size: 16px;">${attr.name}</b> <span style="color:#666; font-size: 14px;">${attr.name_zh || ''}</span> <span style="color:#999; font-size: 12px;">ID: ${attr.id}</span>`;
                wrap.appendChild(title);
                if (Array.isArray(attr.attributeValues) && attr.attributeValues.length > 0) {
                    // 创建搜索框
                    const searchDiv = document.createElement('div');
                    searchDiv.style.cssText = 'margin-top: 12px; position: relative;';
                    const searchInput = document.createElement('input');
                    searchInput.type = 'text';
                    searchInput.placeholder = '🔍 搜索选项...';
                    searchInput.style.cssText = 'width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; margin-bottom: 8px;';
                    searchDiv.appendChild(searchInput);
                    
                    const sel = document.createElement('select');
                    sel.multiple = true; 
                    sel.style.cssText = 'width:100%; padding:8px; border:2px solid #e1e5e9; border-radius:8px; height:160px; font-size: 14px;';
                    sel.dataset.attrId = attr.id;
                    
                    // 存储所有选项用于搜索
                    const allOptions = [];
                    attr.attributeValues.forEach(v => {
                        const opt = document.createElement('option');
                        opt.value = v.value_zh || v.value || '';
                        opt.textContent = v.value_zh || v.value || '';
                        opt.dataset.id = v.id;
                        opt.dataset.originalText = v.value_zh || v.value || '';
                        allOptions.push(opt);
                        sel.appendChild(opt);
                    });
                    
                    // 搜索功能
                    searchInput.addEventListener('input', (e) => {
                        const searchTerm = e.target.value.toLowerCase();
                        
                        // 保存当前选中状态
                        const selectedValues = Array.from(sel.selectedOptions).map(opt => opt.value);
                        const selectedIds = Array.from(sel.selectedOptions).map(opt => opt.dataset.id);
                        
                        // 清空并重新填充
                        sel.innerHTML = '';
                        allOptions.forEach(opt => {
                            // 如果搜索框为空，显示所有选项；否则只显示匹配的选项
                            if (searchTerm === '' || opt.dataset.originalText.toLowerCase().includes(searchTerm)) {
                                const clonedOpt = opt.cloneNode(true);
                                
                                // 恢复选中状态
                                if (selectedValues.includes(clonedOpt.value) || selectedIds.includes(clonedOpt.dataset.id)) {
                                    clonedOpt.selected = true;
                                }
                                
                                sel.appendChild(clonedOpt);
                            }
                        });
                    });
                    
                    // 添加搜索框失去焦点时的处理，确保选中状态保持
                    searchInput.addEventListener('blur', (e) => {
                        // 延迟执行，确保用户的选择已经完成
                        setTimeout(() => {
                            const searchTerm = e.target.value.toLowerCase();
                            if (searchTerm === '') {
                                // 如果搜索框为空，显示所有选项
                                const selectedValues = Array.from(sel.selectedOptions).map(opt => opt.value);
                                const selectedIds = Array.from(sel.selectedOptions).map(opt => opt.dataset.id);
                                
                                sel.innerHTML = '';
                                allOptions.forEach(opt => {
                                    const clonedOpt = opt.cloneNode(true);
                                    if (selectedValues.includes(clonedOpt.value) || selectedIds.includes(clonedOpt.dataset.id)) {
                                        clonedOpt.selected = true;
                                    }
                                    sel.appendChild(clonedOpt);
                                });
                            }
                        }, 100);
                    });
                    
                    wrap.appendChild(searchDiv);
                    wrap.appendChild(sel);
                } else {
                    const input = document.createElement('textarea');
                    input.placeholder = '请输入';
                    input.style.cssText = 'width:100%; margin-top:12px; padding:12px; border:2px solid #e1e5e9; border-radius:8px; font-size: 14px; resize: vertical; min-height: 80px;';
                    input.dataset.attrId = attr.id;
                    wrap.appendChild(input);
                }
                attrsContainer.appendChild(wrap);
            });

            // 保存本次解析到 modal 以便提交
            modal.dataset.typeId = String(third.type_id || '');
            modal.dataset.descriptionCategoryId = String(second.description_category_id || '');
            
            // 自动填充 type_id 和 description_category_id
            const typeIdInput = modal.querySelector('input[data-id="type_id"]');
            const descCategoryIdInput = modal.querySelector('input[data-id="description_category_id"]');
            if (typeIdInput) typeIdInput.value = third.type_id || '';
            if (descCategoryIdInput) descCategoryIdInput.value = second.description_category_id || '';
            
        } catch (error) {
            console.error('获取属性时出错:', error);
            alert('获取属性时发生错误，请重试');
        } finally {
            // 恢复按钮状态
            fetchBtn.textContent = originalText;
            fetchBtn.disabled = false;
            fetchBtn.style.opacity = '1';
            
            // 移除加载提示
            if (loadingDiv && loadingDiv.parentNode) {
                loadingDiv.parentNode.removeChild(loadingDiv);
            }
        }
    });

    // 收集并上传商品
    modal.querySelector('#wb-upload-confirm').addEventListener('click', async () => {
        const clientId = modal.querySelector('#wb-client-id').value.trim();
        const apiKey = modal.querySelector('#wb-api-key').value.trim();
        const images = parseUrls(imageTextarea.value);
        const type_id = modal.dataset.typeId || '';
        const description_category_id = modal.dataset.descriptionCategoryId || '';

        // 验证必要字段
        if (!clientId || !apiKey) {
            alert('请填写 Client ID 和 API Key');
            return;
        }

        if (!type_id || !description_category_id) {
            alert('请先选择完整的商品类目');
            return;
        }

        // 构建完整的商品数据结构
        const results = {
            new_description_category_id: 0,
            dimension_unit: "mm",
            currency_code: "CNY",
            weight_unit: "g",
            attributes: []
        };

        // 收集固定字段（尺寸信息）
        const fixedInputs = modal.querySelectorAll('input[data-id]');
        fixedInputs.forEach(input => {
            const attrId = input.getAttribute('data-id');
            const value = input.value.trim();
            if (attrId && value !== "") {
                // 直接放到最外层
                results[attrId] = value;
            }
        });

        // 收集图片链接
        if (images.length > 0) {
            results.images = images;
            results.primary_image = images[0];
        }

        // 收集属性值
        attrsContainer.querySelectorAll('textarea, select').forEach(input => {
            const attrId = input.dataset.attrId;
            if (!attrId) return;

            if (input.tagName === 'TEXTAREA') {
                const value = input.value.trim();
                if (value) {
                    results.attributes.push({
                        id: parseInt(attrId),
                        values: [{ value }]
                    });
                }
            } else if (input.tagName === 'SELECT') {
                const selectedOptions = Array.from(input.selectedOptions).map(opt => ({
                    dictionary_value_id: opt.dataset.id,
                    value: opt.value
                }));
                if (selectedOptions.length > 0) {
                    results.attributes.push({
                        id: parseInt(attrId),
                        values: selectedOptions
                    });
                }
            }
        });

        // 将商品数据包装为items数组格式
        const uploadData = {
            items: [results]
        };
        
        console.log('准备上传的商品数据:', uploadData);
        
        // 显示上传进度
        const uploadBtn = modal.querySelector('#wb-upload-confirm');
        const originalText = uploadBtn.textContent;
        uploadBtn.textContent = '⏳ 上传中...';
        uploadBtn.disabled = true;
        uploadBtn.style.opacity = '0.7';

        try {
            // 发送上传请求
            const uploadResponse = await new Promise(resolve => chrome.runtime.sendMessage({
                action: 'upload_product',
                productData: uploadData,
                clientId,
                apiKey
            }, resolve));

            console.log('商品上传请求结果:', uploadResponse);
            
            if (uploadResponse && uploadResponse.error) {
                alert(`商品上传失败: ${uploadResponse.error}`);
                return;
            }

            if (uploadResponse && uploadResponse.result && uploadResponse.result.result && uploadResponse.result.result.task_id) {
                const taskId = uploadResponse.result.result.task_id;
                alert(`商品上传成功！\nTask ID: ${taskId}`);
                
                // 上传成功后，发起商品查询状态请求
                console.log('开始查询商品状态...');
                const queryResponse = await new Promise(resolve => chrome.runtime.sendMessage({
                    action: 'query_product_status',
                    taskId: String(taskId), // 转换为字符串格式
                    clientId,
                    apiKey
                }, resolve));

                console.log('商品查询状态请求结果:', queryResponse);
                
                if (queryResponse && queryResponse.error) {
                    alert(`商品状态查询失败: ${queryResponse.error}`);
                } else if (queryResponse && queryResponse.result) {
                    alert(`商品状态查询成功！\n状态: ${JSON.stringify(queryResponse.result, null, 2)}`);
                } else {
                    alert('商品状态查询失败：未收到有效响应');
                }
            } else {
                alert('商品上传失败：未收到有效响应');
            }

        } catch (error) {
            console.error('上传商品时出错:', error);
            alert(`上传商品时发生错误: ${error.message}`);
        } finally {
            // 恢复按钮状态
            uploadBtn.textContent = originalText;
            uploadBtn.disabled = false;
            uploadBtn.style.opacity = '1';
        }
    });
}

async function downloadM3U8Video(m3u8Url) {
    const baseUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf("/") + 1);

    const res = await fetch(m3u8Url);
    const text = await res.text();

    // 提取 .ts 文件名
    const tsFiles = text
        .split("\n")
        .filter(line => line && !line.startsWith("#"));

    console.log(`共找到 ${tsFiles.length} 个片段，开始下载...`);

    // 顺序下载并拼接
    const tsBuffers = [];
    for (let i = 0; i < tsFiles.length; i++) {
        const tsUrl = baseUrl + tsFiles[i];
        console.log(`下载第 ${i + 1} 个片段: ${tsUrl}`);
        const tsRes = await fetch(tsUrl);
        const tsData = await tsRes.arrayBuffer();
        tsBuffers.push(tsData);
    }

    // 合并所有 ArrayBuffer
    const totalLength = tsBuffers.reduce((acc, b) => acc + b.byteLength, 0);
    const mergedArray = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of tsBuffers) {
        mergedArray.set(new Uint8Array(buf), offset);
        offset += buf.byteLength;
    }
    const match = m3u8Url.match(/\/(\d+)\/hls\//);
    const filePrefix = match ? match[1] : 'video';
    // 创建 Blob 并触发下载
    const blob = new Blob([mergedArray], {type: 'video/mp2t'}); // MPEG-TS 格式
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${filePrefix}.mp4`;
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);

    console.log("下载完成，文件名：video.ts");
}


// 当页面加载完成后添加按钮
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        addDownloadButton();
        addDownloadImageButton();
        addUploadProductButton();
    });
} else {
    addDownloadButton();
    addDownloadImageButton();
    addUploadProductButton();
}