function addcommButton() {
// 在页面上添加浮动按钮
    const pluginButton = document.createElement('button');
    pluginButton.id = 'ozon-translator-button';
    pluginButton.innerHTML = '📝 获取属性';
    pluginButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      background: linear-gradient(45deg, #1a2a6c, #2a5298);
      color: white;
      border: none;
      border-radius: 50px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    `;

    pluginButton.addEventListener('click', async () => {

        let descJson = '', descHtml = '', keywordRes = '', characteristics = {}, sku = '', clientId_chrom = '',
            apiKey_chrom = '';

        // 1. 从存储中获取保存的设置
        const {clientId, apiKey} = await new Promise(resolve => {
            chrome.storage.local.get(['clientId', 'apiKey'], resolve);
        });

        clientId_chrom = clientId;
        apiKey_chrom = apiKey;

        // 2. 检查设置是否完整
        if (!clientId || !apiKey) {
            alert('请先配置插件：点击浏览器工具栏中的插件图标填写API信息');
            chrome.action.openPopup(); // 打开配置页面
            return;
        }
        // 3. 显示加载状态
        pluginButton.textContent = '加载中...';


        const targetDiv = document.getElementById('state-webGallery-3311626-default-1');


        if (!targetDiv) {
            alert('未找到 id 为 state-webGallery-3311626-default-1 的 div');
            return;
        }

        const dataState = targetDiv.getAttribute('data-state');
        if (!dataState) {
            alert('该 div 上没有 data-state 属性');
            return;
        }

        let parsed;
        try {
            parsed = JSON.parse(dataState);
        } catch (e) {
            alert('data-state 属性不是合法 JSON');
            console.error(e);
            return;
        }

        const imageUrls = [];
        if (Array.isArray(parsed.images)) {
            parsed.images.forEach(img => {
                if (img.src) imageUrls.push(img.src);
            });
        }


        try {
            sku = parsed.sku || articleValue || '';
            if (!sku) throw new Error('缺少 sku 或 Артикул');

            const apiUrl = `https://www.ozon.ru/api/entrypoint-api.bx/page/json/v2?url=/product/${sku}/?layout_container=pdpPage2column&layout_page_index=2&__rr=2`;
            const response = await fetch(apiUrl, {
                method: 'GET', headers: {'accept': '*/*', 'x-requested-with': 'XMLHttpRequest'}, credentials: 'include'
            });

            if (!response.ok) throw new Error(`请求失败：${response.status}`);
            const jsonData = await response.json();

            // 描述部分
            const webDescRaw = jsonData.widgetStates['webDescription-2983286-pdpPage2column-2'] || '';

            if (webDescRaw) {
                try {
                    const normalizedDesc = webDescRaw.replace(/\\"/g, '"').replace(/^"|"$/g, '');
                    const descData = JSON.parse(normalizedDesc);
                    if (descData.richAnnotationType === "JSON") {
                        descJson = JSON.stringify(descData.richAnnotationJson) || ' ';
                    } else if (descData.richAnnotationType === "HTML") {
                        descHtml = descData.richAnnotation
                            .replace(/\\n/g, '\n')                      // 转义换行符变实际换行
                            .replace(/<br\s*\/?>/gi, '\n')              // 统一替换各种 <br> 标签为换行
                            .replace(/\n{2,}/g, '\n')                   // 多个换行替换为一个
                            .trim() || ' ';
                    }
                } catch (e) {
                    console.warn('描述解析失败:', e);
                }
            }

            const keyword = jsonData.widgetStates['tagList-3460535-pdpPage2column-2'] || '';
            if (keyword) {
                try {
                    const keywordDesc = keyword.replace(/\\"/g, '"').replace(/^"|"$/g, '');
                    const keywordJson = JSON.parse(keywordDesc);
                    keywordRes = keywordJson.items.map(item => item.name).join(';');
                } catch (e) {
                    console.warn('关键词解析失败:', e);
                }
            }

            // 特性部分
            const webCharsRaw = jsonData.widgetStates['webCharacteristics-3282540-pdpPage2column-2'] || '';
            if (webCharsRaw) {
                try {
                    const charsData = JSON.parse(webCharsRaw);
                    if (charsData.characteristics && Array.isArray(charsData.characteristics)) {
                        charsData.characteristics.forEach(charGroup => {
                            [...(charGroup.short || []), ...(charGroup.long || [])].forEach(item => {
                                if (item.name && item.values) {
                                    const values = item.values
                                        .filter(v => v.text)
                                        .map(v => v.text)
                                        .join(', ');
                                    if (values) characteristics[item.name.trim()] = values.trim();
                                }
                            });
                        });
                    }
                } catch (e) {
                    console.warn('特性解析失败:', e);
                }
            }
        } catch (e) {
            console.warn('特性解析失败:', e);
        }


        // 4. 请求API获取属性数据
        chrome.runtime.sendMessage({
            action: 'get_attribute', type_name: characteristics['Тип'], clientId, apiKey
        }, (response) => {
            // 恢复按钮文本
            pluginButton.textContent = '📝 获取属性';

            if (response.error) {
                alert('获取属性失败: ' + response.error);
                return;
            }
            console.log(response)
            // 显示属性对话框
            showAttributesModal(response, characteristics, imageUrls, descJson, descHtml, keywordRes, sku, clientId_chrom, apiKey_chrom);
        });
    });
    document.body.appendChild(pluginButton);
}

function addDownImageButton() {
    const pluginButton = document.createElement('button');
    pluginButton.id = 'downLoadImage';
    pluginButton.innerHTML = '下载商品图片';
    pluginButton.style.cssText = `
      position: fixed;
      top: 70px;
      right: 20px;
      z-index: 9999;
      background: linear-gradient(45deg, #1a2a6c, #2a5298);
      color: white;
      border: none;
      border-radius: 50px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    `;

    pluginButton.addEventListener('click', async () => {
        const targetDiv = document.getElementById('state-webGallery-3311626-default-1');


        if (!targetDiv) {
            alert('未找到 id 为 state-webGallery-3311626-default-1 的 div');
            return;
        }

        const dataState = targetDiv.getAttribute('data-state');
        if (!dataState) {
            alert('该 div 上没有 data-state 属性');
            return;
        }

        let parsed;
        try {
            parsed = JSON.parse(dataState);
        } catch (e) {
            alert('data-state 属性不是合法 JSON');
            console.error(e);
            return;
        }

        const imageUrls = [];
        if (Array.isArray(parsed.images)) {
            parsed.images.forEach(img => {
                if (img.src) imageUrls.push(img.src);
            });
        }
        let videoCoverUrl = parsed.videoCover?.url || '';
        const videoUrls = (parsed.videos || []).map(v => v.url).filter(Boolean);

        sku = parsed.sku || articleValue || '';

        chrome.runtime.sendMessage({type: 'images_ozon', imageUrls, sku, videoCoverUrl, videoUrls});
    });
    document.body.appendChild(pluginButton);

}

// 点击按钮时打开设置弹窗
// content.js


// 接收来自弹出窗口的消息
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === 'show_attributes') {
//         showAttributesModal(message.data, characteristics, imageUrls, descJson, descHtml, keywordRes, sku, clientId, apiKey);
//     }
// });

// 显示属性对话框
function showAttributesModal(data, characteristics, imageUrls, descJson, descHtml, keywordRes, sku, clientId, apiKey) {
    // console.log(data)
    const type_id = data.type_id
    const description_category_id = data.description_category_id
    // 创建可拖动的悬浮面板（非模态）
    const modal = document.createElement('div');
    modal.id = 'ozon-attribute-modal';
    modal.style.cssText = `
      position: fixed;
      top: 60px;
      left: 60px;
      z-index: 10000;
      width: 90%;
      max-width: 800px;
      max-height: 85vh;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      overflow: hidden;
    `;

    modal.innerHTML = `
    <div id="ozon-modal-header" style="display:flex; align-items:center; justify-content: space-between; padding: 12px 16px; background:#1a2a6c; color:#fff; cursor: move;">
      <h2 style="margin:0; font-size: 1.2rem;">商品属性补全</h2>
      <button id="ozon-close-modal" style="background: none; border: none; font-size: 1.6rem; cursor: pointer; color: #fff;">&times;</button>
    </div>

    <div style="padding: 20px; overflow: auto; max-height: calc(85vh - 60px);">
      <div id="ozon-attribute-list" style="display: grid; grid-template-columns: 1fr; gap: 20px;">

        <!-- 图片链接与缩略图管理 -->
        <div style="background: #f9f9ff; border-radius: 10px; padding: 20px; box-shadow: 0 3px 10px rgba(0,0,0,0.08);">
          <div style="font-weight: bold; font-size: 1.2rem; color: #333;">图片链接</div>
          <div style="font-size: 1.1rem; color: #e52e71; margin-top: 5px;">可填写多个链接，按逗号分隔</div>
          <textarea style="width: 100%; padding: 12px 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; margin-top: 10px;"
                    placeholder="请输入图片链接，逗号分隔或一行一个" data-id="888">${imageUrls}</textarea>
          <div id="ozon-image-thumbs" style="margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px;"></div>
        </div>

        <!-- 长宽高重量等信息（保持不变） -->
        <div style="background: #f9f9ff; border-radius: 10px; padding: 20px; box-shadow: 0 3px 10px rgba(0,0,0,0.08); display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
          <input type="number" placeholder="长度 (mm)" data-id="depth" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
          <input type="number" placeholder="宽度 (mm)" data-id="width" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
          <input type="number" placeholder="高度 (mm)" data-id="height" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
          <input type="number" placeholder="重量 (g)" data-id="weight" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
          <input id="offerInput" type="text" placeholder="货号" data-id="offer_id" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;">
          
          <input type="number" placeholder="old_price" data-id="old_price" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;" value=188>
          <input type="number" placeholder="price" data-id="price" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;" value="111">
          <input type="text" placeholder="type_id" data-id="type_id" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;" value="${type_id}">
          <input type="text" placeholder="description_category_id" data-id="description_category_id" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem;" value="${description_category_id}">
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
        <button id="ozon-cancel-btn" style="padding: 12px 25px; background: #f0f0f0; border: none; border-radius: 8px; font-size: 1rem; font-weight: bold; cursor: pointer;">取消</button>
        <button id="ozon-submit-btn" style="padding: 12px 25px; background: linear-gradient(45deg, #1a2a6c, #2a5298); color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: bold; cursor: pointer;">确定</button>
      </div>
    </div>
    `;

    // 移除 ESC 关闭逻辑，防止误关窗口

    document.body.appendChild(modal);

    // 初始化可拖动行为
    (function makeDraggable() {
        const header = modal.querySelector('#ozon-modal-header');
        if (!header) return;
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;
        const onMouseDown = (e) => {
            isDragging = true;
            const rect = modal.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            modal.style.userSelect = 'none';
            document.body.style.userSelect = 'none';
        };
        const onMouseMove = (e) => {
            if (!isDragging) return;
            const newLeft = Math.min(Math.max(0, e.clientX - offsetX), window.innerWidth - modal.offsetWidth);
            const newTop = Math.min(Math.max(0, e.clientY - offsetY), window.innerHeight - modal.offsetHeight);
            modal.style.left = `${newLeft}px`;
            modal.style.top = `${newTop}px`;
            modal.style.right = 'auto';
            modal.style.bottom = 'auto';
        };
        const onMouseUp = () => {
            isDragging = false;
            modal.style.userSelect = '';
            document.body.style.userSelect = '';
        };
        header.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    })();

    // 图片缩略图渲染与复制/删除
    (function setupImageThumbs() {
        const imageTextarea = modal.querySelector('textarea[data-id="888"]');
        const thumbsContainer = modal.querySelector('#ozon-image-thumbs');
        if (!imageTextarea || !thumbsContainer) return;

        const parseUrls = (text) => {
            return text
                .split(/[,\n]/)
                .map(s => s.trim())
                .filter(Boolean);
        };

        const writeUrls = (urls) => {
            imageTextarea.value = urls.join(',');
        };

        const render = () => {
            const urls = parseUrls(imageTextarea.value);
            if (urls.length === 0) {
                thumbsContainer.innerHTML = '<div style="color:#888;">暂无图片链接</div>';
                return;
            }
            thumbsContainer.innerHTML = urls.map(url => `
              <div style="border:1px solid #eee; border-radius:8px; padding:8px; background:#fff; display:flex; flex-direction:column; gap:8px;">
                <div style="width:100%; aspect-ratio:1/1; overflow:hidden; border-radius:6px; background:#f7f7f7; display:flex; align-items:center; justify-content:center;">
                  <img src="${url}" alt="thumb" style="max-width:100%; max-height:100%; object-fit:contain;"/>
                </div>
                <div style="display:flex; gap:8px;">
                  <button data-act="copy" data-url="${url}" style="flex:1; padding:6px 8px; border:1px solid #d0d0d0; background:#fafafa; border-radius:6px; cursor:pointer;">复制</button>
                  <button data-act="delete" data-url="${url}" style="flex:1; padding:6px 8px; border:1px solid #ffcccc; background:#ffecec; color:#d60000; border-radius:6px; cursor:pointer;">删除</button>
                </div>
              </div>
            `).join('');
        };

        thumbsContainer.addEventListener('click', async (e) => {
            const target = e.target;
            if (!(target instanceof HTMLElement)) return;
            const action = target.getAttribute('data-act');
            const url = target.getAttribute('data-url');
            if (!action || !url) return;
            const urls = parseUrls(imageTextarea.value);
            if (action === 'copy') {
                try { await navigator.clipboard.writeText(url); } catch (_) {}
            } else if (action === 'delete') {
                const next = urls.filter(u => u !== url);
                writeUrls(next);
                render();
            }
        });

        // 拖拽排序
        let draggedIndex = null;
        thumbsContainer.addEventListener('dragstart', (e) => {
            const item = e.target.closest('[data-index]');
            if (!item) return;
            draggedIndex = Number(item.getAttribute('data-index'));
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                try { e.dataTransfer.setData('text/plain', String(draggedIndex)); } catch (_) {}
            }
        });
        thumbsContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        });
        thumbsContainer.addEventListener('drop', (e) => {
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
            render();
        });

        imageTextarea.addEventListener('input', render);
        render();
    })();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase(); // 生成4位字母数字组合
    document.getElementById("offerInput").value = `${sku}-${randomSuffix}`;

    // 渲染属性列表
    const attributeList = document.getElementById('ozon-attribute-list');
    const excludeKeywords = ['PDF文件名称', 'Ozon.视频封面：链接', 'Ozon.视频：视频中的产品', 'PDF 文件', 'Ozon.视频： 名称', 'Ozon视频： 链接', '为命名模板用的型号名称', '品牌', '欧亚经济联盟对外经济活动商品命名代码', '最高温度', '最低温度', '卖家代码', '#主题标签', '制造国', '名称', '商品保修，月', '保质期（天）'];
    data.result.forEach(attr => {
        // 检查描述字段是否包含"pdf"（不区分大小写）
        const nameZh = attr.name_zh || '';  // 安全处理空值
        const hasExcludedKeyword = excludeKeywords.some(keyword => nameZh === (keyword));

        if (hasExcludedKeyword) return;

        const attributeItem = document.createElement('div');
        attributeItem.style.cssText = `
		  background: #f9f9ff;
		  border-radius: 10px;
		  padding: 20px;
		  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
		`;
        if (nameZh.includes('简介')) {
            attributeItem.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px; align-items: center;">
        <div>
          <div style="font-weight: bold; font-size: 1.2rem; color: #333;">${attr.name}</div>
          <div style="font-size: 1.1rem; color: #e52e71; margin-top: 5px;">${attr.name_zh}</div>
        </div>
        <div style="background: #1a2a6c; color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.9rem;">ID: ${attr.id}</div>
      </div>
      <div style="color: #666; margin: 10px 0; line-height: 1.5;">${attr.description}</div>
      <div style="color: #666; margin: 10px 0; line-height: 1.5;">${attr.description_zh}</div>
      <textarea type="text" style="width: 100%; padding: 12px 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; margin-top: 10px;" placeholder="请输入" data-id="${attr.id}">${descHtml}</textarea>`;

            attributeList.appendChild(attributeItem);
        } else if (nameZh.toLowerCase().includes("json富内容")) {
            console.log(descJson)
            attributeItem.innerHTML = `
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px; align-items: center;">
                <div>
                  <div style="font-weight: bold; font-size: 1.2rem; color: #333;">${attr.name}</div>
                  <div style="font-size: 1.1rem; color: #e52e71; margin-top: 5px;">${attr.name_zh}</div>
                </div>
                <div style="background: #1a2a6c; color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.9rem;">ID: ${attr.id}</div>
              </div>
              <div style="color: #666; margin: 10px 0; line-height: 1.5;">${attr.description}</div>
              <div style="color: #666; margin: 10px 0; line-height: 1.5;">${attr.description_zh}</div>
              <textarea style="width: 100%; padding: 12px 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; margin-top: 10px;" 
                     placeholder="请输入" data-id="${attr.id}">${descJson}</textarea>`;

            attributeList.appendChild(attributeItem);
        } else if (attr.attributeValues) {
            attributeItem.innerHTML = `
  <div style="display: flex; justify-content: space-between; margin-bottom: 15px; align-items: center;">
    <div>
      <div style="font-weight: bold; font-size: 1.2rem; color: #333;">${attr.name}</div>
      <div style="font-size: 1.1rem; color: #e52e71; margin-top: 5px;">${attr.name_zh}</div>
    </div>
    <div style="background: #1a2a6c; color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.9rem;">ID: ${attr.id}</div>
  </div>
  <div style="color: #666; margin: 10px 0; line-height: 1.5;">${attr.description}</div>
  <div style="color: #666; margin: 10px 0; line-height: 1.5;">${attr.description_zh}</div>
  <select multiple 
          style="width: 100%; padding: 10px 12px; border: 2px solid #aab4d4; border-radius: 10px; font-size: 1rem; margin-top: 8px; height: 180px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.04);" 
          data-id="${attr.id}">
    ${(() => {
                const selectedValues = (characteristics[attr.name] && characteristics[attr.name].length > 0) ? characteristics[attr.name] : (characteristics['Цвет'] || '');


                return (attr.attributeValues || []).map(opt => `
          <option id=${opt.id} value="${opt.value_zh}" 
                  ${selectedValues.trim().toLowerCase().includes(opt.value.trim().toLowerCase()) ? 'selected' : ''}>
            ${opt.value_zh}
          </option>
        `).join('');
            })()}
  </select>
`;

            attributeList.appendChild(attributeItem);


        } else if (nameZh.includes("关键字")) {
            attributeItem.innerHTML = `
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px; align-items: center;">
                <div>
                  <div style="font-weight: bold; font-size: 1.2rem; color: #333;">${attr.name}</div>
                  <div style="font-size: 1.1rem; color: #e52e71; margin-top: 5px;">${attr.name_zh}</div>
                </div>
                <div style="background: #1a2a6c; color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.9rem;">ID: ${attr.id}</div>
              </div>
              <div style="color: #666; margin: 10px 0; line-height: 1.5;">${attr.description}</div>
              <div style="color: #666; margin: 10px 0; line-height: 1.5;">${attr.description_zh}</div>
              <textarea style="width: 100%; padding: 12px 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; margin-top: 10px;" 
                     placeholder="请输入" data-id="${attr.id}">${keywordRes}</textarea>`;

            attributeList.appendChild(attributeItem);
        } else if (nameZh.includes("颜色")) {
            attributeItem.innerHTML = `
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px; align-items: center;">
                <div>
                  <div style="font-weight: bold; font-size: 1.2rem; color: #333;">${attr.name}</div>
                  <div style="font-size: 1.1rem; color: #e52e71; margin-top: 5px;">${attr.name_zh}</div>
                </div>
                <div style="background: #1a2a6c; color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.9rem;">ID: ${attr.id}</div>
              </div>
              <div style="color: #666; margin: 10px 0; line-height: 1.5;">${attr.description}</div>
              <div style="color: #666; margin: 10px 0; line-height: 1.5;">${attr.description_zh}</div>
              <textarea style="width: 100%; padding: 12px 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; margin-top: 10px;" 
                     placeholder="请输入" data-id="${attr.id}">${characteristics['Цвет'] || characteristics[attr.name] || ''}</textarea>`;

            attributeList.appendChild(attributeItem);
        } else {
            attributeItem.innerHTML = `
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px; align-items: center;">
                <div>
                  <div style="font-weight: bold; font-size: 1.2rem; color: #333;">${attr.name}</div>
                  <div style="font-size: 1.1rem; color: #e52e71; margin-top: 5px;">${attr.name_zh}</div>
                </div>
                <div style="background: #1a2a6c; color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.9rem;">ID: ${attr.id}</div>
              </div>
              <div style="color: #666; margin: 10px 0; line-height: 1.5;">${attr.description}</div>
              <div style="color: #666; margin: 10px 0; line-height: 1.5;">${attr.description_zh}</div>
              <textarea type="text" style="width: 100%; padding: 12px 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; margin-top: 10px;" 
                     placeholder="请输入" data-id="${attr.id}">${characteristics[attr.name] || ''}</textarea>`;

            attributeList.appendChild(attributeItem);
        }
    });

    // 增强所有多选下拉框：添加可搜索输入并优化样式
    (function enhanceMultiSelects() {
        const multiSelects = modal.querySelectorAll('select[multiple]');
        multiSelects.forEach((selectEl) => {
            // 搜索输入框
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = '输入以搜索';
            searchInput.style.cssText = 'width:100%; box-sizing:border-box; margin-top:8px; margin-bottom:8px; padding:8px 12px; border:2px solid #aab4d4; border-radius:8px; font-size:0.95rem;';

            // 将搜索框插入到 select 前
            selectEl.parentNode.insertBefore(searchInput, selectEl);

            // 缓存所有选项
            const allOptions = Array.from(selectEl.options).map(o => ({
                id: o.getAttribute('id') || '',
                value: o.value || '',
                text: (o.textContent || '').trim(),
            }));

            const normalize = (s) => (s || '').toLowerCase();

            const renderOptions = (term) => {
                const selectedIds = new Set(Array.from(selectEl.options).filter(o => o.selected).map(o => o.getAttribute('id') || ''));
                const matched = term ? allOptions.filter(opt => normalize(opt.text).includes(term) || normalize(opt.value).includes(term)) : allOptions;
                // 保证已选项始终可见
                const selectedList = allOptions.filter(opt => selectedIds.has(opt.id));
                const unionMap = new Map();
                [...selectedList, ...matched].forEach(opt => unionMap.set(opt.id + '|' + opt.value, opt));
                const finalList = Array.from(unionMap.values());
                selectEl.innerHTML = finalList.map(opt => `<option id="${opt.id}" value="${opt.value}" ${selectedIds.has(opt.id) ? 'selected' : ''}>${opt.value}</option>`).join('');
            };

            searchInput.addEventListener('input', () => {
                renderOptions(normalize(searchInput.value));
            });
        });
    })();

    // 关闭面板
    document.getElementById('ozon-close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    document.getElementById('ozon-cancel-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // 提交表单
    document.getElementById('ozon-submit-btn').addEventListener('click', () => {
        const results = {
            new_description_category_id: 0, dimension_unit: "mm", currency_code: "CNY", weight_unit: "g", attributes: [{
                "id": 4389, "values": [{
                    "dictionary_value_id": 90296, "value": "中国"
                }]
            }, {
                "id": 10351, "values": [{
                    "value": "-20"
                }]
            }, {
                "id": 4164, "values": [{
                    "value": "1"
                }]
            }, {
                "id": 7578, "values": [{
                    "value": "180"
                }]
            }, {
                "id": 85, "values": [{
                    "dictionary_value_id": "972266067", "value": "PleasureCove"
                }]
            }, {
                "id": 10350, "values": [{
                    "value": "40"
                }]
            }]
        };

        // 收集 textarea 值
        const textareas = modal.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            const attrId = textarea.getAttribute('data-id');
            const value = textarea.value;

            if (!attrId || value === "") return;

            if (attrId === "888") {
                // 特殊处理 id 为 888 的 textarea
                const imagesArray = value.split(',').map(v => v.trim()).filter(v => v);
                results.images = imagesArray;
                results.primary_image = imagesArray.length > 0 ? imagesArray[0] : "";
            } else {
                // 其他 textarea 正常加入 attributes
                results.attributes.push({
                    id: parseInt(attrId), values: [{value}]
                });
            }
        });

        // 收集 input 值 -> 直接放到最外层
        const inputs = modal.querySelectorAll('input');
        inputs.forEach(input => {
            const attrId = input.getAttribute('data-id');
            const value = input.value;
            if (attrId && value !== "") {
                results[attrId] = value;
            }
        });

        // 收集 select 值 -> 加入 attributes 中（支持多选）
        const selects = modal.querySelectorAll('select');
        selects.forEach(select => {
            const selectId = select.getAttribute('data-id');
            const selectedOptions = Array.from(select.options)
                .filter(option => option.selected)
                .map(option => ({
                    dictionary_value_id: option.getAttribute('id'), value: option.value
                }));

            if (selectId && selectedOptions.length > 0) {
                results.attributes.push({
                    id: parseInt(selectId), values: selectedOptions
                });
            }
        });

        // 打印最终 JSON
        // console.log('生成的 JSON:', results);
        response_json = {"items": []}

        response_json.items.push(results)

        const importHeaders = new Headers();
        importHeaders.append("Client-Id", clientId);
        importHeaders.append("Api-Key", apiKey);
        importHeaders.append("Content-Type", "application/json");
        importHeaders.append("Cookie", "__Secure-ETC=xxx..."); // 省略cookie内容以保持简洁

        const importBody = JSON.stringify(response_json);

        const importOptions = {
            method: "POST", headers: importHeaders, body: importBody, redirect: "follow"
        };

// 发起第一个请求
        fetch("https://api-seller.ozon.ru/v3/product/import", importOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("上传失败");
                }
                return response.json(); // 解析为 JSON
            })
            .then((data) => {
                // 假设返回格式为：{ "task_id": "1234567890" }
                const taskId = data?.result?.task_id;

                if (!taskId) {
                    throw new Error("未获取到 task_id");
                }

                // 第二个请求：查询导入状态
                const infoHeaders = new Headers();
                infoHeaders.append("Client-Id", clientId);
                infoHeaders.append("Api-Key", apiKey);
                infoHeaders.append("Content-Type", "application/json");

                const infoBody = JSON.stringify({task_id: taskId});

                const infoOptions = {
                    method: "POST", headers: infoHeaders, body: infoBody, redirect: "follow"
                };

                return fetch("https://api-seller.ozon.ru/v1/product/import/info", infoOptions);
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("查询导入结果失败");
                }
                return response.json();
            })
            .then((infoData) => {
                // 你可以根据 infoData 的结构决定要怎么处理
                // 这里只是简单示例，可以改为展示在页面中
                alert("导入信息查询成功，状态：" + JSON.stringify(infoData));
            })
            .catch((error) => {
                console.error(error);
                alert("操作失败：" + error.message);
            });


        navigator.clipboard.writeText(JSON.stringify(results))
            .then(() => {
                alert("JSON 已复制到剪贴板！");
            })
            .catch(err => {
                console.error("复制失败:", err);
                alert("复制失败，请查看控制台日志。");
            });

        // 关闭模态框
        document.body.removeChild(modal);
    });


}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        addcommButton();
        addDownImageButton();
    });
} else {
    addcommButton();
    addDownImageButton();
}