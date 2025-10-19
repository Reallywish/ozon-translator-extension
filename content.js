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
            }

            const keyword = jsonData.widgetStates['tagList-3460535-pdpPage2column-2'] || '';
            if (keyword) {
                const keywordDesc = keyword.replace(/\\"/g, '"').replace(/^"|"$/g, '');
                const keywordJson = JSON.parse(keywordDesc);
                keywordRes = keywordJson.items.map(item => item.name).join(';');
            }

            // 特性部分
            const webCharsRaw = jsonData.widgetStates['webCharacteristics-3282540-pdpPage2column-2'] || '';
            if (webCharsRaw) {
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

// 显示属性面板（非模态，允许同时操作原网页与面板）
function showAttributesModal(data, characteristics, imageUrls, descJson, descHtml, keywordRes, sku, clientId, apiKey) {
    // console.log(data)
    const type_id = data.type_id
    const description_category_id = data.description_category_id
    // 如果已有面板，先移除，避免重复
    const existingPanel = document.getElementById('ozon-attribute-modal');
    if (existingPanel) existingPanel.remove();

    // 创建侧边面板（非遮罩）
    const modal = document.createElement('div');
    modal.id = 'ozon-attribute-modal';
    modal.style.cssText = `
          position: fixed;
          top: 0;
          right: 0;
          width: 480px;
          max-width: 90vw;
          height: 100vh;
          background: #ffffff;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          box-shadow: -6px 0 24px rgba(0,0,0,0.15);
          border-left: 1px solid #e9e9ef;
        `;

    modal.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; padding: 14px 16px; border-bottom: 1px solid #eee;">
        <h2 style="margin: 0; color: #1a2a6c; font-size: 1.2rem;">商品属性补全</h2>
        <button id="ozon-close-modal" style="background: none; border: none; font-size: 1.6rem; cursor: pointer; color: #888; line-height: 1;">&times;</button>
      </div>
      <div id="ozon-panel-content" style="flex:1; overflow-y:auto; padding: 14px 16px;">
        <div id="ozon-attribute-list" style="display:grid; grid-template-columns: 1fr; gap: 16px;">
          <div style="background: #f9f9ff; border-radius: 10px; padding: 16px; box-shadow: 0 3px 10px rgba(0,0,0,0.08);">
            <div style="font-weight: bold; font-size: 1.05rem; color: #333;">图片链接</div>
            <div style="font-size: 0.95rem; color: #e52e71; margin-top: 6px;">可填写多个链接，按逗号分隔</div>
            <textarea style="width: 100%; padding: 10px 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 0.95rem; margin-top: 10px;" 
                      placeholder="请输入图片链接，多个用逗号分隔" data-id="888">${imageUrls}</textarea>
          </div>

          <!-- 基础信息与价格 -->
          <div style="background: #f9f9ff; border-radius: 10px; padding: 16px; box-shadow: 0 3px 10px rgba(0,0,0,0.08); display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
            <input type="number" placeholder="长度 (mm)" data-id="depth" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 0.95rem;">
            <input type="number" placeholder="宽度 (mm)" data-id="width" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 0.95rem;">
            <input type="number" placeholder="高度 (mm)" data-id="height" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 0.95rem;">
            <input type="number" placeholder="重量 (g)" data-id="weight" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 0.95rem;">
            <input id="offerInput" type="text" placeholder="货号" data-id="offer_id" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 0.95rem;">
            <input type="number" placeholder="old_price" data-id="old_price" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 0.95rem;" value=188>
            <input type="number" placeholder="price" data-id="price" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 0.95rem;" value="111">
            <input type="text" placeholder="type_id" data-id="type_id" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 0.95rem;" value="${type_id}">
            <input type="text" placeholder="description_category_id" data-id="description_category_id" style="padding: 10px; border: 2px solid #ddd; border-radius: 8px; font-size: 0.95rem;" value="${description_category_id}">
          </div>

          <!-- 页面描述预览（HTML / JSON） -->
          <div style="background: #fff; border-radius: 10px; padding: 16px; box-shadow: 0 3px 10px rgba(0,0,0,0.06); border: 1px solid #eee;">
            <div style="font-weight: bold; font-size: 1.05rem; color: #333; margin-bottom: 8px;">页面描述预览</div>
            <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
              <div>
                <div style="font-weight: 600; color:#666; margin-bottom:6px;">HTML</div>
                <div id="ozon-desc-html-view" style="max-height: 160px; overflow: auto; border: 1px dashed #ddd; padding: 10px; border-radius: 8px; background: #fafafa;"></div>
              </div>
              <div>
                <div style="font-weight: 600; color:#666; margin-bottom:6px;">JSON 富内容</div>
                <textarea id="ozon-desc-json-view" readonly style="width:100%; height: 120px; padding:10px 12px; border:1px dashed #ddd; border-radius:8px; background:#fafafa; font-family: monospace; font-size: 12px;"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end; gap: 10px; padding: 12px 16px; border-top: 1px solid #eee;">
        <button id="ozon-cancel-btn" style="padding: 10px 18px; background: #f0f0f0; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: bold; cursor: pointer;">取消</button>
        <button id="ozon-submit-btn" style="padding: 10px 18px; background: linear-gradient(45deg, #1a2a6c, #2a5298); color: white; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: bold; cursor: pointer;">确定</button>
      </div>
    `;

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            const panel = document.getElementById('ozon-attribute-modal');
            if (panel) panel.remove();
        }
    });

    document.body.appendChild(modal);

    // 填充描述预览内容
    try {
        const htmlPreview = document.getElementById('ozon-desc-html-view');
        if (htmlPreview && descHtml) {
            htmlPreview.innerHTML = descHtml;
        }
        const jsonPreview = document.getElementById('ozon-desc-json-view');
        if (jsonPreview && descJson) {
            jsonPreview.value = descJson;
        }
    } catch (e) {
        // 忽略预览填充异常
    }
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
          style="width: 100%; padding: 12px 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; margin-top: 10px; height: 120px;" 
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

    // 关闭模态框
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