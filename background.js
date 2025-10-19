// 处理API请求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'get_attribute') {
        const {type_name, clientId, apiKey} = request;


        /**
         * 根据商品类目属性获取type_id和description_category_id
         * @param targetTypeName   属性名称，俄文
         * @returns {{type_id: (number|*), parent_category_id: (number|*)}|null}
         */
        function findCategoryId(targetTypeName) {
            leimu_data = {
                "result": [{
                    "description_category_id": 17027484,
                    "category_name": "Товары для взрослых",
                    "disabled": false,
                    "children": [{
                        "description_category_id": 200001461, "category_name": "БДСМ", "disabled": false, "children": [{
                            "type_name": "Расширитель уретральный",
                            "type_id": 970669701,
                            "disabled": false,
                            "children": []
                        }, {
                            "type_name": "Фиксатор БДСМ", "type_id": 96529, "disabled": false, "children": []
                        }, {
                            "type_name": "Стек БДСМ", "type_id": 96546, "disabled": false, "children": []
                        }, {
                            "type_name": "Кисточка", "type_id": 96519, "disabled": false, "children": []
                        }, {
                            "type_name": "БДСМ набор", "type_id": 96506, "disabled": false, "children": []
                        }, {
                            "type_name": "Секс-машина", "type_id": 96545, "disabled": false, "children": []
                        }, {
                            "type_name": "Насадка для секс-машины",
                            "type_id": 971314469,
                            "disabled": false,
                            "children": []
                        }, {
                            "type_name": "Аксессуар БДСМ", "type_id": 96534, "disabled": false, "children": []
                        }, {
                            "type_name": "Руки", "type_id": 96543, "disabled": false, "children": []
                        }, {
                            "type_name": "Сумка-портплед для аксессуаров БДСМ",
                            "type_id": 971062730,
                            "disabled": false,
                            "children": []
                        }, {
                            "type_name": "Разделитель мошонки", "type_id": 96539, "disabled": false, "children": []
                        }, {
                            "type_name": "Зажим, стимулятор для сосков",
                            "type_id": 96517,
                            "disabled": false,
                            "children": []
                        }, {
                            "type_name": "Плетка", "type_id": 96536, "disabled": false, "children": []
                        }, {
                            "type_name": "Электростимуляция", "type_id": 96559, "disabled": false, "children": []
                        }, {
                            "type_name": "BDSM станок для секса",
                            "type_id": 970956271,
                            "disabled": false,
                            "children": []
                        }, {"type_name": "Растяжитель мошонки", "type_id": 96540, "disabled": false, "children": []}]
                    }, {
                        "description_category_id": 17028960,
                        "category_name": "Интимная косметика",
                        "disabled": false,
                        "children": [{
                            "type_name": "Крем интимный", "type_id": 97194, "disabled": false, "children": []
                        }, {
                            "type_name": "Массажное масло 18+", "type_id": 971749423, "disabled": false, "children": []
                        }, {
                            "type_name": "Пролонгатор", "type_id": 96565, "disabled": false, "children": []
                        }, {"type_name": "Возбуждающее средство", "type_id": 96562, "disabled": false, "children": []}]
                    }, {
                        "description_category_id": 17028959,
                        "category_name": "Секс игрушки",
                        "disabled": false,
                        "children": [{
                            "type_name": "Аксессуар для гидропомпы",
                            "type_id": 970956105,
                            "disabled": false,
                            "children": []
                        }, {
                            "type_name": "Виброяйцо", "type_id": 96515, "disabled": false, "children": []
                        }, {
                            "type_name": "Мастурбатор", "type_id": 96525, "disabled": false, "children": []
                        }, {
                            "type_name": "Эротический набор", "type_id": 96518, "disabled": false, "children": []
                        }, {
                            "type_name": "Насадка для вагинального тренажера",
                            "type_id": 971024817,
                            "disabled": false,
                            "children": []
                        }, {
                            "type_name": "Гидропомпа", "type_id": 96516, "disabled": false, "children": []
                        }, {
                            "type_name": "Комплект для увеличения пениса",
                            "type_id": 97451,
                            "disabled": false,
                            "children": []
                        }, {
                            "type_name": "Эрекционное кольцо", "type_id": 96560, "disabled": false, "children": []
                        }, {
                            "type_name": "Вагинальные шарики", "type_id": 96510, "disabled": false, "children": []
                        }, {
                            "type_name": "Утяжка/лассо", "type_id": 96553, "disabled": false, "children": []
                        }, {
                            "type_name": "Анальный стимулятор", "type_id": 96503, "disabled": false, "children": []
                        }, {
                            "type_name": "Вакуумная помпа", "type_id": 96512, "disabled": false, "children": []
                        }, {
                            "type_name": "Имитатор женской груди",
                            "type_id": 324689473,
                            "disabled": false,
                            "children": []
                        }, {
                            "type_name": "Фаллоимитатор", "type_id": 96554, "disabled": false, "children": []
                        }, {
                            "type_name": "Страпон", "type_id": 96508, "disabled": false, "children": []
                        }, {
                            "type_name": "Аксессуар для ролевых игр",
                            "type_id": 324771396,
                            "disabled": false,
                            "children": []
                        }, {
                            "type_name": "Bluetooth адаптер для секс-игрушек",
                            "type_id": 971096778,
                            "disabled": false,
                            "children": []
                        }, {
                            "type_name": "Анальный крюк", "type_id": 96501, "disabled": false, "children": []
                        }, {
                            "type_name": "Расширитель", "type_id": 96541, "disabled": false, "children": []
                        }, {
                            "type_name": "Вибропуля", "type_id": 96514, "disabled": false, "children": []
                        }, {
                            "type_name": "Анальная пробка", "type_id": 96535, "disabled": false, "children": []
                        }, {
                            "type_name": "Насадки и удлинители эротические",
                            "type_id": 971749404,
                            "disabled": false,
                            "children": []
                        }, {
                            "type_name": "Насос для секс-куклы", "type_id": 96497, "disabled": false, "children": []
                        }, {
                            "type_name": "Аксессуар для вагинального тренажера",
                            "type_id": 971895257,
                            "disabled": false,
                            "children": []
                        }, {
                            "type_name": "Ремень эротический", "type_id": 970877575, "disabled": false, "children": []
                        }, {
                            "type_name": "Комплектующее для помпы",
                            "type_id": 970958669,
                            "disabled": false,
                            "children": []
                        }, {
                            "type_name": "Массажер простаты", "type_id": 96524, "disabled": false, "children": []
                        }, {
                            "type_name": "Тренажер Кегеля", "type_id": 96511, "disabled": false, "children": []
                        }, {"type_name": "Вибратор", "type_id": 96513, "disabled": false, "children": []}]
                    }, {
                        "description_category_id": 85697584,
                        "category_name": "Парфюмерия с феромонами",
                        "disabled": false,
                        "children": [{
                            "type_name": "Духи с феромонами", "type_id": 97674, "disabled": false, "children": []
                        }, {
                            "type_name": "Лосьон с феромонами", "type_id": 971299557, "disabled": false, "children": []
                        }, {
                            "type_name": "Масло парфюмерное с феромонами",
                            "type_id": 970851982,
                            "disabled": false,
                            "children": []
                        }, {
                            "type_name": "Туалетная вода с феромонами",
                            "type_id": 970593521,
                            "disabled": false,
                            "children": []
                        }, {
                            "type_name": "Интимный дезодорант", "type_id": 96563, "disabled": false, "children": []
                        }, {
                            "type_name": "Парфюмерная вода с феромонами",
                            "type_id": 97676,
                            "disabled": false,
                            "children": []
                        }, {"type_name": "Концентрат феромонов", "type_id": 97675, "disabled": false, "children": []}]
                    }, {
                        "description_category_id": 200001505,
                        "category_name": "Сувениры и игры эротические",
                        "disabled": false,
                        "children": [{
                            "type_name": "Эротический сувенир", "type_id": 96561, "disabled": false, "children": []
                        }, {"type_name": "Игра эротическая", "type_id": 268217795, "disabled": false, "children": []}]
                    }, {
                        "description_category_id": 200001500,
                        "category_name": "Уход и хранение секс игрушек",
                        "disabled": false,
                        "children": [{
                            "type_name": "Средство для чистки игрушек",
                            "type_id": 96566,
                            "disabled": false,
                            "children": []
                        }, {
                            "type_name": "Контейнер для обработки секс-игрушек",
                            "type_id": 971102746,
                            "disabled": false,
                            "children": []
                        }, {
                            "type_name": "Сумка-портплед для аксессуаров БДСМ",
                            "type_id": 971062730,
                            "disabled": false,
                            "children": []
                        }]
                    }, {
                        "description_category_id": 200001496,
                        "category_name": "Мебель и текстиль для секса",
                        "disabled": false,
                        "children": [{
                            "type_name": "Виниловая простынь", "type_id": 96538, "disabled": false, "children": []
                        }, {
                            "type_name": "Подушка для любви", "type_id": 98374, "disabled": false, "children": []
                        }, {
                            "type_name": "Виниловый пододеяльник",
                            "type_id": 971855250,
                            "disabled": false,
                            "children": []
                        }, {
                            "type_name": "Кресло-диван для любви",
                            "type_id": 971100782,
                            "disabled": false,
                            "children": []
                        }, {
                            "type_name": "BDSM станок для секса",
                            "type_id": 970956271,
                            "disabled": false,
                            "children": []
                        }, {"type_name": "Секс-качели", "type_id": 96544, "disabled": false, "children": []}]
                    }, {
                        "description_category_id": 200001462,
                        "category_name": "Кондитерские изделия 18+",
                        "disabled": false,
                        "children": [{
                            "type_name": "Кондитерское изделие 18+",
                            "type_id": 971363842,
                            "disabled": false,
                            "children": []
                        }]
                    }]
                }]
            }

            const result = leimu_data.result;

            for (const topLevel of result) {
                for (const secondLevel of topLevel.children) {
                    for (const thirdLevel of secondLevel.children) {
                        if (thirdLevel.type_name === targetTypeName) {
                            return {
                                type_id: thirdLevel.type_id, parent_category_id: secondLevel.description_category_id
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

            secondJson.result.forEach(item => {
                translationMap.set(item.id, {
                    name_zh: item.name, description_zh: item.description
                });
            });

            result.result.forEach(item => {
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

            secondJson.result.forEach(item => {
                translationMap.set(item.id, {
                    name_zh: item.name, description_zh: item.description
                });
            });
            const excludeKeywords = ['PDF文件名称', 'Ozon.视频封面：链接', 'Ozon.视频：视频中的产品', 'PDF 文件', 'Ozon.视频： 名称', 'Ozon视频： 链接', '为命名模板用的型号名称', '品牌', '欧亚经济联盟对外经济活动商品命名代码', '最高温度', '最低温度', '卖家代码', '#主题标签', '制造国', '名称', '商品保修，月', '保质期（天）'];

            for (const item of result.result) {
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
                    item.attributeValues = attributeValues.result;
                }
            }
            result.type_id = type_id;
            result.description_category_id = description_category_id;

            return result;
        }

        // 实现您提供的get_attribute函数
        async function get_attribute(type_name, clientId, apiKey) {
            try {
                const res = findCategoryId(type_name);
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

            const result = JSON.parse(JSON.stringify(values_rub_json));
            const translationMap = new Map();

            values_zh_json.result.forEach(item => {
                translationMap.set(item.id, {
                    value_zh: item.value
                });
            });

            result.result.forEach(item => {
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
