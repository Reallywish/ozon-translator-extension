// 在页面上添加下载按钮
function addDownloadButton() {
    // 避免重复添加
    if (document.getElementById('m3u8-downloader-button')) return;

    const button = document.createElement('button');
    button.id = 'm3u8-downloader-button';
    button.innerHTML = '下载视频';

    // 按钮样式
    button.style.position = 'fixed';
    button.style.top = '200px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '10px 15px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    button.style.fontFamily = 'Arial, sans-serif';
    button.style.fontSize = '14px';


    // 鼠标悬停效果
    button.addEventListener('mouseover', () => {
        button.style.backgroundColor = '#45a049';
    });

    button.addEventListener('mouseout', () => {
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
    button.innerHTML = '下载大图图片';

    // 按钮样式（可调整位置，这里示例放在视频按钮上方）
    button.style.position = 'fixed';
    button.style.top = '150px';  // 比视频按钮高一点
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '10px 15px';
    button.style.backgroundColor = '#2196F3';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    button.style.fontFamily = 'Arial, sans-serif';
    button.style.fontSize = '14px';

    button.addEventListener('mouseover', () => {
        button.style.backgroundColor = '#1976d2';
    });
    button.addEventListener('mouseout', () => {
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

        chrome.runtime.sendMessage({type: 'images', urls});
    });

    document.body.appendChild(button);
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
    });
} else {
    addDownloadButton();
    addDownloadImageButton();
}