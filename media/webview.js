// الحصول على VS Code API
const vscode = acquireVsCodeApi();

let editor;
let currentHtml = '';
let isUpdatingFromExternal = false;
let debounceTimer;

// تهيئة المحرر عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    initializeEditor();
});

function initializeEditor() {
    editor = document.getElementById('editor');
    
    if (!editor) {
        console.error('Editor element not found');
        return;
    }
    
    console.log('✅ Simple Editor initialized');
    
    // جعل المحرر قابلاً للتعديل
    editor.contentEditable = true;
    editor.dir = 'rtl';
    
    // الاستماع لتغييرات المحتوى
    editor.addEventListener('input', handleEditorChange);
    
    // معالجة لصق الصور
    editor.addEventListener('paste', handlePaste);
    
    // تحديث حالة الأزرار عند تحريك المؤشر
    editor.addEventListener('keyup', () => {
        updateToolbarState();
        syncCursorPosition();
    });
    editor.addEventListener('mouseup', () => {
        updateToolbarState();
        syncCursorPosition();
    });
    editor.addEventListener('focus', updateToolbarState);
    
    // إضافة دعم اختصارات لوحة المفاتيح المخصصة
    editor.addEventListener('keydown', handleKeyboardShortcuts);
    
    // إضافة معالج عام على مستوى document لضمان التقاط الاختصارات
    document.addEventListener('keydown', handleKeyboardShortcuts, true);
    window.addEventListener('keydown', handleKeyboardShortcuts, true);
    
    // إضافة أزرار شريط الأدوات
    setupToolbar();
}

function setupToolbar() {
    const toolbar = document.getElementById('toolbar');
    if (!toolbar) return;
    
    // قائمة منسدلة للعناوين
    const formatSelect = document.createElement('select');
    formatSelect.className = 'toolbar-select';
    formatSelect.id = 'formatSelect';
    formatSelect.title = 'تنسيق الفقرة';
    formatSelect.innerHTML = `
        <option value="p">فقرة (P)</option>
        <option value="h1">عنوان 1 (H1)</option>
        <option value="h2">عنوان 2 (H2)</option>
        <option value="h3">عنوان 3 (H3)</option>
        <option value="h4">عنوان 4 (H4)</option>
        <option value="h5">عنوان 5 (H5)</option>
        <option value="h6">عنوان 6 (H6)</option>
    `;
    formatSelect.onchange = (e) => {
        const value = e.target.value;
        if (value === 'p') {
            document.execCommand('formatBlock', false, 'p');
        } else {
            document.execCommand('formatBlock', false, value);
        }
        editor.focus();
        setTimeout(updateToolbarState, 50);
    };
    toolbar.appendChild(formatSelect);
    
    // فاصل
    const sep1 = document.createElement('div');
    sep1.className = 'toolbar-separator';
    toolbar.appendChild(sep1);
    
    const buttons = [
        { icon: '<i class="fas fa-cut"></i>', command: 'cut', title: 'قص' },
        { icon: '<i class="fas fa-copy"></i>', command: 'copy', title: 'نسخ' },
        { icon: '<i class="fas fa-paste"></i>', command: 'paste', title: 'لصق' },
        { type: 'separator' },
        { icon: '<i class="fas fa-bold"></i>', command: 'bold', title: 'عريض' },
        { icon: '<i class="fas fa-italic"></i>', command: 'italic', title: 'مائل' },
        { icon: '<i class="fas fa-underline"></i>', command: 'underline', title: 'تسطير' },
        { icon: '<i class="fas fa-strikethrough"></i>', command: 'strikeThrough', title: 'يتوسطه خط' },
        { type: 'separator' },
        { icon: '<i class="fas fa-align-justify"></i>', command: 'justifyFull', title: 'محاذاة مبررة' },
        { icon: '<i class="fas fa-align-right"></i>', command: 'justifyRight', title: 'محاذاة لليمين' },
        { icon: '<i class="fas fa-align-center"></i>', command: 'justifyCenter', title: 'محاذاة للوسط' },
        { icon: '<i class="fas fa-align-left"></i>', command: 'justifyLeft', title: 'محاذاة لليسار' },
        { type: 'separator' },
        { icon: '<i class="fa-solid fa-paragraph fa-flip-horizontal"></i>', command: 'dirRTL', title: 'اتجاه RTL' },
        { icon: '<i class="fa-solid fa-paragraph"></i>', command: 'dirLTR', title: 'اتجاه LTR' },
        { type: 'separator' },
        { icon: '<i class="fas fa-list-ul"></i>', command: 'insertUnorderedList', title: 'قائمة نقطية' },
        { icon: '<i class="fas fa-list-ol"></i>', command: 'insertOrderedList', title: 'قائمة مرقمة' },
        { type: 'separator' },
        { icon: '<i class="fas fa-link"></i>', command: 'createLink', title: 'إضافة رابط' },
        { icon: '<i class="fas fa-image"></i>', command: 'insertImage', title: 'إضافة صورة' },
        { type: 'separator' },
        { icon: '<i class="fas fa-undo"></i>', command: 'undo', title: 'تراجع' },
        { icon: '<i class="fas fa-redo"></i>', command: 'redo', title: 'إعادة' },
    ];
    
    buttons.forEach(btn => {
        if (btn.type === 'separator') {
            const sep = document.createElement('div');
            sep.className = 'toolbar-separator';
            toolbar.appendChild(sep);
        } else {
            const button = document.createElement('button');
            button.className = 'toolbar-btn';
            button.innerHTML = btn.icon;
            button.title = btn.title;
            button.dataset.command = btn.command;
            button.onclick = () => handleToolbarCommand(btn.command);
            toolbar.appendChild(button);
        }
    });
}

// التحقق من محاذاة النص الحالية
function checkTextAlign(align) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;
    
    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer;
    
    // البحث عن أقرب عنصر block
    while (element && element !== editor) {
        if (element.nodeType === Node.ELEMENT_NODE) {
            const tagName = element.nodeName.toLowerCase();
            if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'li', 'blockquote'].includes(tagName)) {
                return element.style.textAlign === align;
            }
        }
        element = element.parentNode;
    }
    
    return false;
}

// التحقق من اتجاه النص الحالي
function checkDirection(dir) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;
    
    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer;
    
    // البحث عن أقرب عنصر block أو span
    while (element && element !== editor) {
        if (element.nodeType === Node.ELEMENT_NODE) {
            const tagName = element.nodeName.toLowerCase();
            if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'li', 'blockquote', 'span'].includes(tagName)) {
                return element.style.direction === dir;
            }
        }
        element = element.parentNode;
    }
    
    return false;
}

// تحديث حالة الأزرار بناءً على الموضع الحالي
function updateToolbarState() {
    const buttons = document.querySelectorAll('.toolbar-btn');
    const formatSelect = document.getElementById('formatSelect');
    
    // تحديث حالة الأزرار
    buttons.forEach(button => {
        const command = button.dataset.command;
        if (!command) return;
        
        let isActive = false;
        
        try {
            switch (command) {
                case 'bold':
                    isActive = document.queryCommandState('bold');
                    break;
                case 'italic':
                    isActive = document.queryCommandState('italic');
                    break;
                case 'underline':
                    isActive = document.queryCommandState('underline');
                    break;
                case 'strikeThrough':
                    isActive = document.queryCommandState('strikeThrough');
                    break;
                case 'insertUnorderedList':
                    isActive = document.queryCommandState('insertUnorderedList');
                    break;
                case 'insertOrderedList':
                    isActive = document.queryCommandState('insertOrderedList');
                    break;
                case 'justifyLeft':
                    isActive = checkTextAlign('left');
                    break;
                case 'justifyCenter':
                    isActive = checkTextAlign('center');
                    break;
                case 'justifyRight':
                    isActive = checkTextAlign('right');
                    break;
                case 'justifyFull':
                    isActive = checkTextAlign('justify');
                    break;
                case 'dirRTL':
                    isActive = checkDirection('rtl');
                    break;
                case 'dirLTR':
                    isActive = checkDirection('ltr');
                    break;
            }
        } catch (e) {
            // تجاهل الأخطاء
        }
        
        if (isActive) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // تحديث القائمة المنسدلة
    if (formatSelect) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            let node = selection.anchorNode;
            let currentFormat = 'p';
            
            // البحث عن العنصر الأب المناسب
            while (node && node !== editor) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const tagName = node.nodeName.toLowerCase();
                    if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
                        currentFormat = tagName;
                        break;
                    }
                }
                node = node.parentNode;
            }
            
            formatSelect.value = currentFormat;
        }
    }
}

// تطبيق محاذاة النص على العنصر الحالي
function applyTextAlign(align) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer;
    
    // البحث عن أقرب عنصر block
    while (element && element !== editor) {
        if (element.nodeType === Node.ELEMENT_NODE) {
            const tagName = element.nodeName.toLowerCase();
            if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'li', 'blockquote'].includes(tagName)) {
                // التحقق من المحاذاة الحالية
                const currentAlign = element.style.textAlign;
                if (currentAlign === align) {
                    // إزالة المحاذاة إذا كانت نفسها
                    element.style.textAlign = '';
                    if (!element.getAttribute('style')) {
                        element.removeAttribute('style');
                    }
                } else {
                    // تطبيق المحاذاة الجديدة
                    element.style.textAlign = align;
                }
                // حفظ التغييرات
                handleEditorChange();
                return;
            }
        }
        element = element.parentNode;
    }
    
    // إذا لم نجد عنصر block، نستخدم execCommand
    const commands = {
        'left': 'justifyLeft',
        'center': 'justifyCenter',
        'right': 'justifyRight',
        'justify': 'justifyFull'
    };
    document.execCommand(commands[align], false, null);
    handleEditorChange();
}

// تطبيق اتجاه النص على العنصر الحالي
function applyDirection(dir) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer;
    
    // البحث عن أقرب عنصر block
    while (element && element !== editor) {
        if (element.nodeType === Node.ELEMENT_NODE) {
            const tagName = element.nodeName.toLowerCase();
            if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'li', 'blockquote'].includes(tagName)) {
                // التحقق من الاتجاه الحالي
                const currentDir = element.style.direction;
                if (currentDir === dir) {
                    // إزالة الاتجاه إذا كان نفسه
                    element.style.direction = '';
                    if (!element.getAttribute('style')) {
                        element.removeAttribute('style');
                    }
                } else {
                    // تطبيق الاتجاه الجديد
                    element.style.direction = dir;
                }
                // حفظ التغييرات
                handleEditorChange();
                return;
            }
        }
        element = element.parentNode;
    }
    
    // إذا لم نجد عنصر block، نلف النص المحدد في span
    if (selection.toString().length > 0) {
        document.execCommand('styleWithCSS', false, true);
        const span = document.createElement('span');
        span.style.direction = dir;
        span.textContent = selection.toString();
        range.deleteContents();
        range.insertNode(span);
        
        // تحديد الـ span الجديد
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        // حفظ التغييرات
        handleEditorChange();
    }
}

async function handleToolbarCommand(command) {
    switch (command) {
        case 'cut':
            await cutSelection();
            break;
        case 'copy':
            await copySelection();
            break;
        case 'paste':
            await pasteFromClipboard();
            break;
        case 'createLink':
            const url = prompt('أدخل الرابط:', 'https://');
            if (url) document.execCommand('createLink', false, url);
            break;
        case 'insertImage':
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) handleImageUpload(file);
            };
            input.click();
            break;
        case 'justifyLeft':
            applyTextAlign('left');
            console.log('📝 Left align applied');
            break;
        case 'justifyCenter':
            applyTextAlign('center');
            console.log('📝 Center align applied');
            break;
        case 'justifyRight':
            applyTextAlign('right');
            console.log('📝 Right align applied');
            break;
        case 'justifyFull':
            applyTextAlign('justify');
            console.log('📝 Justify align applied');
            break;
        case 'dirRTL':
            applyDirection('rtl');
            console.log('📝 RTL direction applied');
            break;
        case 'dirLTR':
            applyDirection('ltr');
            console.log('📝 LTR direction applied');
            break;
        default:
            document.execCommand(command, false, null);
    }
    editor.focus();
    
    // تحديث حالة الأزرار بعد التنفيذ
    setTimeout(updateToolbarState, 50);
}

// معالجة اختصارات لوحة المفاتيح المخصصة
async function handleKeyboardShortcuts(e) {
    // استخدام keyCode (أرقام المفاتيح الفيزيائية) للتوافق مع جميع اللغات
    // يعمل مع Ctrl في Windows/Linux و Cmd في Mac
    const modifier = e.ctrlKey || e.metaKey;
    
    if (!modifier) return;
    
    let handled = false;
    
    switch (e.keyCode) {
        case 66: // B - عريض (Ctrl+B أو Cmd+B)
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            document.execCommand('bold');
            console.log('🔨 Bold applied');
            setTimeout(updateToolbarState, 50);
            handled = true;
            break;
            
        case 73: // I - مائل (Ctrl+I أو Cmd+I)
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            document.execCommand('italic');
            console.log('🔨 Italic applied');
            setTimeout(updateToolbarState, 50);
            handled = true;
            break;
            
        case 85: // U - تسطير (Ctrl+U أو Cmd+U)
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            document.execCommand('underline');
            console.log('🔨 Underline applied');
            setTimeout(updateToolbarState, 50);
            handled = true;
            break;
            
        case 88: // X - قص (Ctrl+X أو Cmd+X)
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            await cutSelection();
            handled = true;
            break;
            
        case 67: // C - نسخ (Ctrl+C أو Cmd+C)
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            await copySelection();
            handled = true;
            break;
            
        case 86: // V - لصق (Ctrl+V أو Cmd+V)
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            await pasteFromClipboard();
            handled = true;
            break;
            
        case 90: // Z - تراجع (Ctrl+Z أو Cmd+Z)
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            document.execCommand('undo');
            handled = true;
            break;
            
        case 89: // Y - إعادة (Ctrl+Y أو Cmd+Y)
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            document.execCommand('redo');
            handled = true;
            break;
    }
    
    if (handled) {
        return false;
    }
}

// دوال Clipboard API الحديثة
async function cutSelection() {
    try {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        await navigator.clipboard.writeText(selection.toString());
        selection.deleteFromDocument();
        console.log('✂️ Cut completed');
    } catch (err) {
        console.error('Cut failed:', err);
    }
}

async function copySelection() {
    try {
        const selection = window.getSelection();
        await navigator.clipboard.writeText(selection.toString());
        console.log('📋 Copy completed');
    } catch (err) {
        console.error('Copy failed:', err);
    }
}

async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        document.execCommand('insertText', false, text);
        console.log('📌 Paste completed');
    } catch (err) {
        console.error('Paste failed:', err);
    }
}

function handleEditorChange() {
    if (isUpdatingFromExternal) {
        return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const newBodyContent = editor.innerHTML;
        
        // إعادة بناء HTML الكامل مع محتوى body الجديد
        const fullHtml = reconstructFullHtml(currentHtml, newBodyContent);
        
        if (fullHtml !== currentHtml) {
            currentHtml = fullHtml;
            console.log('📤 Sending update to extension...');
            vscode.postMessage({
                type: 'updateHtml',
                html: fullHtml
            });
        }
    }, 300);
}

function reconstructFullHtml(originalHtml, newBodyContent) {
    // استبدال محتوى body فقط
    const bodyMatch = originalHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    
    if (bodyMatch) {
        // إذا كان هناك body، استبدل محتواه فقط
        return originalHtml.replace(
            /<body[^>]*>[\s\S]*?<\/body>/i,
            (match) => {
                // احتفظ بتاج body الأصلي مع الصفات
                const bodyTag = match.match(/<body[^>]*>/i)[0];
                return bodyTag + newBodyContent + '</body>';
            }
        );
    }
    
    // إذا لم يكن هناك body، أرجع المحتوى كما هو
    return newBodyContent;
}

function handlePaste(evt) {
    const items = evt.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.type.startsWith('image/')) {
            evt.preventDefault();
            
            const file = item.getAsFile();
            handleImageUpload(file);
        }
    }
}

function handleImageUpload(file) {
    console.log('📷 Uploading image:', file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        
        vscode.postMessage({
            type: 'saveAsset',
            filename: file.name,
            dataUrl: dataUrl
        });
    };
    
    reader.readAsDataURL(file);
}

// الاستماع للرسائل من Extension
window.addEventListener('message', (event) => {
    const message = event.data;
    console.log('📨 Received message:', message.type);

    switch (message.type) {
        case 'init':
            handleInit(message.html);
            break;

        case 'externalChange':
            handleExternalChange(message.html);
            break;

        case 'assetSaved':
            handleAssetSaved(message.url);
            break;
    }
});

function handleInit(html) {
    console.log('🚀 Initializing editor with HTML:', html.substring(0, 100) + '...');
    currentHtml = html;
    
    if (editor) {
        isUpdatingFromExternal = true;
        
        // استخراج محتوى body فقط للعرض
        const bodyContent = extractBodyContent(html);
        editor.innerHTML = bodyContent;
        
        console.log('✅ Editor content set successfully');
        setTimeout(() => {
            isUpdatingFromExternal = false;
        }, 100);
    }
}

function extractBodyContent(html) {
    // محاولة استخراج محتوى body
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
        return bodyMatch[1];
    }
    
    // إذا لم يكن هناك body، استخدم كل المحتوى
    return html;
}

function handleExternalChange(html) {
    if (!editor) {
        return;
    }

    const bodyContent = extractBodyContent(html);
    
    if (editor.innerHTML === bodyContent) {
        return;
    }

    console.log('🔄 Updating from external change...');
    isUpdatingFromExternal = true;
    currentHtml = html;
    editor.innerHTML = bodyContent;
    
    setTimeout(() => {
        isUpdatingFromExternal = false;
    }, 100);
}

function handleAssetSaved(url) {
    if (!editor) {
        return;
    }

    console.log('🖼 Inserting image:', url);
    
    // إدراج الصورة في موضع المؤشر
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'صورة';
    img.style.maxWidth = '100%';
    
    // إدراج الصورة في الموضع الحالي
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(img);
    } else {
        editor.appendChild(img);
    }
}

// مزامنة موضع المؤشر مع محرر VS Code
function syncCursorPosition() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    try {
        const range = selection.getRangeAt(0);
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(editor);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        
        const offset = preSelectionRange.toString().length;
        
        // إرسال الموضع إلى Extension
        vscode.postMessage({
            type: 'cursorPosition',
            offset: offset
        });
    } catch (e) {
        // تجاهل الأخطاء
    }
}
