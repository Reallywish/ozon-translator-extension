// 处理API请求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 处理存储读取请求
    if (request.action === 'get_storage') {
        chrome.storage.local.get(['clientId', 'apiKey'], (result) => {
            sendResponse(result);
        });
        return true; // 表示异步响应
    }
    
    // 处理存储保存请求
    if (request.action === 'set_storage') {
        chrome.storage.local.set(request.data, () => {
            sendResponse({ success: true });
        });
        return true; // 表示异步响应
    }
    
    if (request.action === 'get_attribute') {
        const {type_name, clientId, apiKey} = request;

        /**
         * 根据商品类目属性获取type_id和description_category_id
         * @param targetTypeName   属性名称，俄文
         * @returns {{type_id: (number|*), parent_category_id: (number|*)}|null}
         */
        let leimuDataCache = null;
        async function loadLeimuData() {
            if (leimuDataCache) return leimuDataCache;
            const url = chrome.runtime.getURL('leimu_data.conf');
            const resp = await fetch(url);
            const text = await resp.text();
            
            // 检查文件内容是否为空或无效
            if (!text || text.trim() === '') {
                throw new Error('文件内容为空');
            }
            
            // 尝试解析JSON
            try {
                leimuDataCache = JSON.parse(text);
                return leimuDataCache;
            } catch (parseError) {
                console.error('JSON解析失败:', parseError);
                console.error('文件内容前100个字符:', text.substring(0, 100));
                throw new Error(`JSON解析失败: ${parseError.message}`);
            }
        }

        async function findCategoryId(targetTypeName) {
            const leimuData = await loadLeimuData();
            const result = (leimuData && Array.isArray(leimuData.result)) ? leimuData.result : [];
            for (const topLevel of result) {
                if (!topLevel || !topLevel.children) continue;
                for (const secondLevel of topLevel.children) {
                    if (!secondLevel || !secondLevel.children) continue;
                    for (const thirdLevel of secondLevel.children) {
                        if (thirdLevel && thirdLevel.type_name === targetTypeName) {
                            return {
                                type_id: thirdLevel.type_id,
                                // 按需返回父父级（顶级）的 description_category_id
                                parent_category_id: secondLevel.description_category_id
                            };
                        }
                    }
                }
            }
            return null; // 如果未找到返回null
        }

        // 实现您提供的mergeJsonTranslations函数
        function mergeJsonTranslations(firstJson, secondJson) {
            const result = JSON.parse(JSON.stringify(firstJson));
            const translationMap = new Map();

            (secondJson && Array.isArray(secondJson.result) ? secondJson.result : []).forEach(item => {
                translationMap.set(item.id, {
                    name_zh: item.name, description_zh: item.description
                });
            });

            (result && Array.isArray(result.result) ? result.result : []).forEach(item => {
                const translation = translationMap.get(item.id);
                if (translation) {
                    item.name_zh = translation.name_zh;
                    item.description_zh = translation.description_zh;
                }
            });

            return result;
        }

        async function get_res_json(firstJson, secondJson, description_category_id, type_id) {
            const result = JSON.parse(JSON.stringify(firstJson));
            const translationMap = new Map();

            (secondJson && Array.isArray(secondJson.result) ? secondJson.result : []).forEach(item => {
                translationMap.set(item.id, {
                    name_zh: item.name, description_zh: item.description
                });
            });
            const excludeKeywords = ['PDF文件名称', 'Ozon.视频封面：链接', 'Ozon.视频：视频中的产品', 'PDF 文件', 'Ozon.视频： 名称', 'Ozon视频： 链接', '为命名模板用的型号名称', '品牌', '欧亚经济联盟对外经济活动商品命名代码', '最高温度', '最低温度', '卖家代码', '#主题标签', '制造国', '名称', '商品保修，月', '保质期（天）'];

            for (const item of (result && Array.isArray(result.result) ? result.result : [])) {
                const translation = translationMap.get(item.id);
                if (translation) {
                    item.name_zh = translation.name_zh;
                    item.description_zh = translation.description_zh;
                }
                const nameZh = item.name_zh || '';  // 安全处理空值
                const hasExcludedKeyword = excludeKeywords.some(keyword => nameZh === (keyword));
                if ((item.dictionary_id !== 0) && !hasExcludedKeyword) {
                    const attributeValues = await get_attribute_values(item.id, description_category_id, type_id);
                    // console.log(JSON.stringify(attributeValues.result, null, 2).replace("\n",""))
                    item.attributeValues = (attributeValues && Array.isArray(attributeValues.result)) ? attributeValues.result : [];
                }
            }
            result.type_id = type_id;
            result.description_category_id = description_category_id;

            return result;
        }

        // 实现您提供的get_attribute函数
        async function get_attribute(type_name, clientId, apiKey) {
            try {
                const res = await findCategoryId(type_name);
                if (!res) {
                    return { error: `未在类目映射中找到该 type_name: ${type_name}` };
                }
                const description_category_id = res.parent_category_id;
                const type_id = res.type_id;
                const response_rub = await fetch("https://api-seller.ozon.ru/v1/description-category/attribute", {
                    method: "POST", headers: {
                        "Client-Id": clientId, "Api-Key": apiKey, "Content-Type": "application/json"
                    }, body: JSON.stringify({
                        description_category_id: description_category_id, language: "default", type_id: type_id
                    })
                });

                const response_zh = await fetch("https://api-seller.ozon.ru/v1/description-category/attribute", {
                    method: "POST", headers: {
                        "Client-Id": clientId, "Api-Key": apiKey, "Content-Type": "application/json"
                    }, body: JSON.stringify({
                        description_category_id: description_category_id, language: "ZH_HANS", type_id: type_id
                    })
                });

                const res_rub_json = await response_rub.json();
                const res_zh_json = await response_zh.json();
                return await get_res_json(res_rub_json, res_zh_json, description_category_id, type_id)
            } catch (error) {
                console.error("API请求失败:", error);
                return {error: error.message};
            }
        }

        async function get_attribute_values(attribute_id, description_category_id, type_id) {

            const values_rub = await fetch("https://api-seller.ozon.ru/v1/description-category/attribute/values/", {
                method: "POST", headers: {
                    "Client-Id": clientId, "Api-Key": apiKey, "Content-Type": "application/json"
                }, body: JSON.stringify({
                    attribute_id: attribute_id,
                    description_category_id: description_category_id,
                    type_id: type_id,
                    limit: 100,
                    language: "default"
                })
            });

            const values_zh = await fetch("https://api-seller.ozon.ru/v1/description-category/attribute/values/", {
                method: "POST", headers: {
                    "Client-Id": clientId, "Api-Key": apiKey, "Content-Type": "application/json"
                }, body: JSON.stringify({
                    attribute_id: attribute_id,
                    description_category_id: description_category_id,
                    type_id: type_id,
                    limit: 100,
                    language: "ZH_HANS"
                })
            });
            const values_rub_json = await values_rub.json();
            const values_zh_json = await values_zh.json();

            const result = JSON.parse(JSON.stringify(values_rub_json || {}));
            const translationMap = new Map();

            (values_zh_json && Array.isArray(values_zh_json.result) ? values_zh_json.result : []).forEach(item => {
                translationMap.set(item.id, {
                    value_zh: item.value
                });
            });

            (result && Array.isArray(result.result) ? result.result : []).forEach(item => {
                const translation = translationMap.get(item.id);
                if (translation) {
                    item.value_zh = translation.value_zh;
                }
            });
            return result;

        }


        // 调用API
        get_attribute(type_name, clientId, apiKey)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({error}));

        return true; // 表示异步响应
    } else if (request.action === 'get_attribute_direct') {
        const {type_id, description_category_id, clientId, apiKey} = request;

        // 直接使用传入的 type_id 和 description_category_id，不需要映射查找
        async function get_attribute_direct(type_id, description_category_id, clientId, apiKey) {
            try {
                console.log('直接获取属性:', { type_id, description_category_id });
                
                const response_rub = await fetch("https://api-seller.ozon.ru/v1/description-category/attribute", {
                    method: "POST", headers: {
                        "Client-Id": clientId, "Api-Key": apiKey, "Content-Type": "application/json"
                    }, body: JSON.stringify({
                        description_category_id: description_category_id, language: "default", type_id: type_id
                    })
                });

                const response_zh = await fetch("https://api-seller.ozon.ru/v1/description-category/attribute", {
                    method: "POST", headers: {
                        "Client-Id": clientId, "Api-Key": apiKey, "Content-Type": "application/json"
                    }, body: JSON.stringify({
                        description_category_id: description_category_id, language: "ZH_HANS", type_id: type_id
                    })
                });

                const res_rub_json = await response_rub.json();
                const res_zh_json = await response_zh.json();
                
                // 复用现有的 get_res_json 函数
                return await get_res_json_direct(res_rub_json, res_zh_json, description_category_id, type_id, clientId, apiKey);
            } catch (error) {
                console.error("API请求失败:", error);
                return {error: error.message};
            }
        }

        async function get_res_json_direct(firstJson, secondJson, description_category_id, type_id, clientId, apiKey) {
            const result = JSON.parse(JSON.stringify(firstJson));
            const translationMap = new Map();

            (secondJson && Array.isArray(secondJson.result) ? secondJson.result : []).forEach(item => {
                translationMap.set(item.id, {
                    name_zh: item.name, description_zh: item.description
                });
            });
            const excludeKeywords = ['PDF文件名称', 'Ozon.视频封面：链接', 'Ozon.视频：视频中的产品', 'PDF 文件', 'Ozon.视频： 名称', 'Ozon视频： 链接', '为命名模板用的型号名称', '品牌', '欧亚经济联盟对外经济活动商品命名代码', '最高温度', '最低温度', '卖家代码', '#主题标签', '制造国', '名称', '商品保修，月', '保质期（天）'];

            for (const item of (result && Array.isArray(result.result) ? result.result : [])) {
                const translation = translationMap.get(item.id);
                if (translation) {
                    item.name_zh = translation.name_zh;
                    item.description_zh = translation.description_zh;
                }
                const nameZh = item.name_zh || '';  // 安全处理空值
                const hasExcludedKeyword = excludeKeywords.some(keyword => nameZh === (keyword));
                if ((item.dictionary_id !== 0) && !hasExcludedKeyword) {
                    const attributeValues = await get_attribute_values_direct(item.id, description_category_id, type_id, clientId, apiKey);
                    item.attributeValues = (attributeValues && Array.isArray(attributeValues.result)) ? attributeValues.result : [];
                }
            }
            result.type_id = type_id;
            result.description_category_id = description_category_id;

            return result;
        }

        async function get_attribute_values_direct(attribute_id, description_category_id, type_id, clientId, apiKey) {
            const values_rub = await fetch("https://api-seller.ozon.ru/v1/description-category/attribute/values/", {
                method: "POST", headers: {
                    "Client-Id": clientId, "Api-Key": apiKey, "Content-Type": "application/json"
                }, body: JSON.stringify({
                    attribute_id: attribute_id,
                    description_category_id: description_category_id,
                    type_id: type_id,
                    limit: 100,
                    language: "default"
                })
            });

            const values_zh = await fetch("https://api-seller.ozon.ru/v1/description-category/attribute/values/", {
                method: "POST", headers: {
                    "Client-Id": clientId, "Api-Key": apiKey, "Content-Type": "application/json"
                }, body: JSON.stringify({
                    attribute_id: attribute_id,
                    description_category_id: description_category_id,
                    type_id: type_id,
                    limit: 100,
                    language: "ZH_HANS"
                })
            });
            const values_rub_json = await values_rub.json();
            const values_zh_json = await values_zh.json();

            const result = JSON.parse(JSON.stringify(values_rub_json || {}));
            const translationMap = new Map();

            (values_zh_json && Array.isArray(values_zh_json.result) ? values_zh_json.result : []).forEach(item => {
                translationMap.set(item.id, {
                    value_zh: item.value
                });
            });

            (result && Array.isArray(result.result) ? result.result : []).forEach(item => {
                const translation = translationMap.get(item.id);
                if (translation) {
                    item.value_zh = translation.value_zh;
                }
            });
            return result;
        }

        // 调用直接获取属性的API
        get_attribute_direct(type_id, description_category_id, clientId, apiKey)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({error}));

        return true; // 表示异步响应
    } else if (request.action === 'upload_product') {
        const {productData, clientId, apiKey} = request;
        
        async function uploadProduct(productData, clientId, apiKey) {
            try {
                console.log('开始上传商品:', productData);
                
                const response = await fetch("https://api-seller.ozon.ru/v3/product/import", {
                    method: "POST",
                    headers: {
                        "Client-Id": clientId,
                        "Api-Key": apiKey,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(productData)
                });

                const result = await response.json();
                console.log('商品上传API响应:', result);
                
                if (!response.ok) {
                    return { error: `上传失败: ${result.message || '未知错误'}` };
                }
                
                return { result: result };
            } catch (error) {
                console.error("商品上传API请求失败:", error);
                return { error: error.message };
            }
        }

        // 调用上传商品API
        uploadProduct(productData, clientId, apiKey)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({error}));

        return true; // 表示异步响应
    } else if (request.action === 'query_product_status') {
        const {taskId, clientId, apiKey} = request;
        
        async function queryProductStatus(taskId, clientId, apiKey) {
            try {
                console.log('开始查询商品状态:', taskId);
                
                const response = await fetch("https://api-seller.ozon.ru/v1/product/import/info", {
                    method: "POST",
                    headers: {
                        "Client-Id": clientId,
                        "Api-Key": apiKey,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        task_id: taskId
                    })
                });

                const result = await response.json();
                console.log('商品状态查询API响应:', result);
                
                if (!response.ok) {
                    return { error: `查询失败: ${result.message || '未知错误'}` };
                }
                
                return { result: result };
            } catch (error) {
                console.error("商品状态查询API请求失败:", error);
                return { error: error.message };
            }
        }

        // 调用查询商品状态API
        queryProductStatus(taskId, clientId, apiKey)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({error}));

        return true; // 表示异步响应
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'images') {
        const downloaded = new Set(); // 用于去重

        for (const url of message.urls) {
            if (downloaded.has(url)) continue; // 如果已经下载过，则跳过
            downloaded.add(url); // 记录已下载

            // 提取中间的动态文件夹名，如 223799901
            const match = url.match(/\/(\d+)\/images\//);
            const folderName = match ? match[1] : 'images';

            const filename = `${folderName}/${url.split('/').pop()}`;
            chrome.downloads.download({
                url: url, filename: filename, saveAs: false
            });
        }
    } else if (message.type === 'images_ozon') {
        const downloaded = new Set(); // 用于去重
        const imageUrls = message.imageUrls;
        const videoCoverUrl = message.videoCoverUrl;
        const videoUrls = message.videoUrls;
        const sku = message.sku;
        for (const url of imageUrls) {
            if (downloaded.has(url)) continue; // 如果已经下载过，则跳过
            downloaded.add(url); // 记录已下载

            // 提取中间的动态文件夹名，如 223799901
            const folderName = sku;

            const filename = `${folderName}/${url.split('/').pop()}`;
            chrome.downloads.download({
                url: url, filename: filename, saveAs: false
            });
        }
        if (videoUrls) {
            for (let i = 0; i < videoUrls.length; i++) {
                const videourl = videoUrls[i];
                const folderName = sku;

                const filename = `${folderName}/${i + 1}.mp4`;
                chrome.downloads.download({
                    url: videourl, filename: filename, saveAs: false
                });
            }
        }

        if (videoCoverUrl) {
            const folderName = sku;
            const filename = `${folderName}/videoCover.mp4`;
            chrome.downloads.download({
                url: videoCoverUrl, filename: filename, saveAs: false
            });
        }
    }
});