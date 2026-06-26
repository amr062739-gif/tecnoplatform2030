export const decodeBase64UTF8 = (base64Data) => {
    try {
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
        console.error("Failed to decode base64 utf-8:", e);
        return "";
    }
};

export const getBase64Data = (dataURI) => {
    if (!dataURI || !dataURI.includes('base64,')) return dataURI;
    return dataURI.split('base64,')[1];
};

export const openFileInNewTab = (fileData, fileName) => {
    if (!fileData) return;

    let content = fileData;
    let mimeType = 'text/plain;charset=utf-8';

    const isPdf = content.includes('application/pdf') || fileName?.toLowerCase().endsWith('.pdf') || (content.includes('base64,') && content.split('base64,')[1].startsWith('JVBER'));
    const isHtml = content.includes('html') || fileName?.toLowerCase().endsWith('.html') || content.includes('<!DOCTYPE html>') || (content.includes('base64,') && (content.split('base64,')[1].startsWith('PGh0bW') || content.split('base64,')[1].startsWith('PCFET0')));
    const isImage = content.startsWith('data:image');

    if (isPdf) mimeType = 'application/pdf';
    else if (isHtml) mimeType = 'text/html;charset=utf-8';
    else if (isImage) {
        const mimeMatch = content.match(/^data:([^;]+);/);
        mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    }

    try {
        if (content.includes('base64,')) {
            const base64Data = content.split('base64,')[1];

            // For text or HTML, we decode to string first to ensure UTF-8 handling via Blob constructor
            if (isHtml || (!isPdf && !isImage)) {
                let decodedText = decodeBase64UTF8(base64Data);

                // For HTML, ensure meta charset is present
                if (isHtml && !decodedText.toLowerCase().includes('charset=')) {
                    if (decodedText.toLowerCase().includes('<head>')) {
                        decodedText = decodedText.replace(/<head>/i, '<head><meta charset="UTF-8">');
                    } else {
                        decodedText = `<meta charset="UTF-8">` + decodedText;
                    }
                }

                const blob = new Blob([decodedText], { type: mimeType });
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
            } else {
                // For binary files like PDF and images
                const binaryString = atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: mimeType });
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
            }
        } else {
            // Content is already a string
            let finalContent = content;
            if (isHtml && !finalContent.toLowerCase().includes('charset=')) {
                if (finalContent.toLowerCase().includes('<head>')) {
                    finalContent = finalContent.replace(/<head>/i, '<head><meta charset="UTF-8">');
                } else {
                    finalContent = `<meta charset="UTF-8">` + finalContent;
                }
            }
            const blob = new Blob([finalContent], { type: mimeType });
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
        }
    } catch (error) {
        console.error("Error opening file:", error);
        // Fallback to direct data URL if possible
        if (content.startsWith('data:')) {
            window.open(content, '_blank');
        } else {
            alert("تعذر فتح الملف في تبويب جديد. تأكد من جودة الملف أو إعدادات المتصفح.");
        }
    }
};
