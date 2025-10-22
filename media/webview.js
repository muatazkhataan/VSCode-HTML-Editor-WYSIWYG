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
    
    // منع فتح الروابط في المحرر - معالج شامل
    const preventLinkNavigation = (e) => {
        // البحث عن عنصر الرابط في السلسلة
        let target = e.target;
        while (target && target !== editor) {
            if (target.tagName === 'A') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('🔗 Prevented link navigation on', e.type);
                return false;
            }
            target = target.parentElement;
        }
    };
    
    // منع فتح الروابط على حدث النقر فقط (نسمح بـ mousedown/mouseup لوضع المؤشر)
    editor.addEventListener('click', preventLinkNavigation, true);

    // فتح محرر الرابط عند النقر المزدوج على رابط
    editor.addEventListener('dblclick', (e) => {
        let target = e.target;
        while (target && target !== editor) {
            if (target.tagName === 'A') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                // ضع المؤشر داخل الرابط حتى يظهر كعنصر محدد للتحرير
                try {
                    const range = document.createRange();
                    if (target.firstChild) {
                        range.setStart(target.firstChild, 0);
                    } else {
                        range.selectNode(target);
                    }
                    range.collapse(true);
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                } catch {}

                // افتح نافذة محرر الرابط فوراً
                execCreateLinkCommand();
                return false;
            }
            target = target.parentElement;
        }
    }, true);
    
    // معالج إضافي على مستوى document كنسخة احتياطية
    document.addEventListener('click', (e) => {
        if (editor && editor.contains(e.target)) {
            let target = e.target;
            while (target && target !== document.body) {
                if (target.tagName === 'A' && editor.contains(target)) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    console.log('🔗 [Document] Prevented link navigation');
                    return false;
                }
                target = target.parentElement;
            }
        }
    }, true);
    
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

// فئة لحفظ واستعادة موضع المؤشر
class CaretPosition {
    static savedRange = null;
    
    static save() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            this.savedRange = selection.getRangeAt(0).cloneRange();
        }
    }
    
    static restore() {
        if (this.savedRange) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.savedRange);
        }
    }
}

// دالة لتعطيل جميع الروابط في المحرر
function disableAllLinks() {
    if (!editor) return;
    
    const links = editor.querySelectorAll('a');
    links.forEach(link => {
        // لا نزيل href، فقط نمنع الأحداث
        link.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        };
        
        link.style.cursor = 'text';
    });
}

// دالة لاستعادة الروابط عند الحفظ (لم تعد ضرورية لكن نبقيها للتوافق)
function restoreAllLinks() {
    // لا نحتاج لفعل شيء الآن
    return;
}

// دالة لتفعيل/إلغاء وضع التمييز
function toggleHighlightMode() {
    if (!editor) return;
    
    if (editor.classList.contains('custom-editor')) {
        // إلغاء وضع التمييز
        editor.classList.remove('custom-editor');
        console.log('✨ Highlight mode disabled');
    } else {
        // تفعيل وضع التمييز
        editor.classList.add('custom-editor');
        console.log('✨ Highlight mode enabled');
    }
    
    // تحديث حالة الأزرار
    updateToolbarState();
}

// دالة لإنشاء/تحرير الرابط
function execCreateLinkCommand() {
    // الحصول على التحديد الحالي
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    let linkElement = range.commonAncestorContainer;
    
    // إذا كان العنصر نصاً، نحصل على العنصر الأب
    if (linkElement.nodeType === 3) {
        linkElement = linkElement.parentElement;
    }

    // البحث عن أقرب رابط
    const existingLink = linkElement.closest('a');
    const selectedText = selection.toString().trim();
    
    // تحديد النص والرابط الافتراضي
    let defaultText = selectedText;
    let defaultUrl = 'http://';
    
    // إذا كان هناك رابط موجود
    if (existingLink) {
        defaultUrl = existingLink.href;
        defaultText = existingLink.textContent;
    }
    
    // إنشاء نافذة حوار لتحرير الرابط
    const linkDialog = document.createElement('div');
    linkDialog.className = 'link-dialog';
    linkDialog.innerHTML = `
        <div class="link-dialog-content">
            <h5>${existingLink ? 'تحرير الرابط' : 'إضافة رابط جديد'}</h5>
            <div class="form-content">
                <div class="mb-3">
                    <label for="link-url" class="form-label">عنوان الرابط:</label>
                    <input type="text" class="form-control" id="link-url" value="${defaultUrl}">
                </div>
                <div class="mb-3">
                    <label for="link-text" class="form-label">نص الرابط:</label>
                    <input type="text" class="form-control" id="link-text" value="${defaultText}">
                </div>
                <div class="mb-3">
                    <label for="link-title" class="form-label">عنوان الرابط (title):</label>
                    <input type="text" class="form-control" id="link-title" value="${existingLink ? existingLink.title || '' : ''}">
                </div>
                <div class="mb-3">
                    <label for="link-target" class="form-label">فتح الرابط في:</label>
                    <select class="form-select" id="link-target">
                        <option value="_self" ${existingLink && existingLink.target !== '_blank' ? 'selected' : ''}>نفس النافذة</option>
                        <option value="_blank" ${existingLink && existingLink.target === '_blank' ? 'selected' : ''}>نافذة جديدة</option>
                    </select>
                </div>
            </div>
            <div class="dialog-footer">
                ${existingLink ? '<button class="btn btn-danger" id="link-remove"><i class="fas fa-trash-can"></i> إزالة</button>' : ''}
                <button class="btn btn-secondary" id="link-cancel"><i class="fas fa-xmark"></i> إلغاء</button>
                <button class="btn btn-primary" id="link-save"><i class="fas fa-check"></i> حفظ</button>
            </div>
        </div>
    `;
    
    // إضافة نافذة الحوار للمستند
    document.body.appendChild(linkDialog);
    
    // التركيز على حقل عنوان الرابط
    setTimeout(() => {
        document.getElementById('link-url').focus();
        document.getElementById('link-url').select();
    }, 100);
    
    // معالجة حدث الحفظ
    document.getElementById('link-save').addEventListener('click', () => {
        const url = document.getElementById('link-url').value;
        const text = document.getElementById('link-text').value;
        const title = document.getElementById('link-title').value;
        const target = document.getElementById('link-target').value;
        
        if (url) {
            // حفظ موقع المؤشر
            CaretPosition.save();
            
            if (existingLink) {
                // تحديث الرابط الموجود
                existingLink.href = url;
                existingLink.textContent = text;
                existingLink.title = title;
                existingLink.target = target;
            } else {
                // إنشاء رابط جديد
                if (selectedText) {
                    // إذا كان هناك نص محدد، نستخدم الأمر العادي
                    document.execCommand('createLink', false, url);
                    
                    // الحصول على الرابط الذي تم إنشاؤه
                    const newLink = selection.anchorNode.parentElement.closest('a');
                    if (newLink) {
                        // تحديث نص الرابط إذا كان مختلفاً عن النص المحدد
                        if (text !== selectedText) {
                            newLink.textContent = text;
                        }
                        
                        // إضافة العنوان والهدف
                        newLink.title = title;
                        newLink.target = target;
                    }
                } else {
                    // إذا لم يكن هناك نص محدد، ننشئ رابطاً جديداً يدوياً
                    const newLink = document.createElement('a');
                    newLink.href = url;
                    newLink.textContent = text || 'رابط جديد';
                    newLink.title = title;
                    newLink.target = target;
                    
                    // إدراج الرابط في الموضع الحالي
                    range.deleteContents();
                    range.insertNode(newLink);
                    
                    // تحديد الرابط الجديد
                    const newRange = document.createRange();
                    newRange.selectNodeContents(newLink);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
            }
            
            // استعادة موقع المؤشر
            CaretPosition.restore();
            
            // إشعار بالتغيير
            handleEditorChange();
            
            // تعطيل الروابط بعد الإنشاء/التحرير
            setTimeout(() => {
                disableAllLinks();
            }, 100);
        }
        
        // إزالة نافذة الحوار
        document.body.removeChild(linkDialog);
    });
    
    // معالجة حدث الإلغاء
    document.getElementById('link-cancel').addEventListener('click', () => {
        document.body.removeChild(linkDialog);
    });
    
    // معالجة حدث إزالة الرابط (إذا كان موجوداً)
    if (existingLink) {
        document.getElementById('link-remove').addEventListener('click', () => {
            // تحديد الرابط
            const removeRange = document.createRange();
            removeRange.selectNode(existingLink);
            selection.removeAllRanges();
            selection.addRange(removeRange);
            
            // إزالة الرابط مع الحفاظ على النص
            document.execCommand('unlink');
            
            // إشعار بالتغيير
            handleEditorChange();
            
            // تعطيل الروابط بعد الإزالة
            setTimeout(() => {
                disableAllLinks();
            }, 100);
            
            // إزالة نافذة الحوار
            document.body.removeChild(linkDialog);
        });
    }
    
    // إضافة معالج لمفتاح Escape لإغلاق النافذة
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            if (document.body.contains(linkDialog)) {
                document.body.removeChild(linkDialog);
            }
            document.removeEventListener('keydown', handleEscape);
        }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    // إضافة معالج لمفتاح Enter لحفظ الرابط
    const handleEnter = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.getElementById('link-save').click();
            document.removeEventListener('keydown', handleEnter);
        }
    };
    
    // إضافة معالج Enter على حقول الإدخال فقط
    const inputs = linkDialog.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('keydown', handleEnter);
    });
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
        { icon: '<i class="fas fa-highlighter"></i>', command: 'toggleHighlight', title: 'تمييز العناصر' },
        { type: 'separator' },
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
                case 'createLink':
                    // التحقق إذا كان المؤشر على رابط
                    const sel = window.getSelection();
                    if (sel.rangeCount > 0) {
                        let node = sel.getRangeAt(0).commonAncestorContainer;
                        if (node.nodeType === 3) {
                            node = node.parentElement;
                        }
                        isActive = node.closest('a') !== null;
                    }
                    break;
                case 'toggleHighlight':
                    // التحقق إذا كان وضع التمييز مفعلاً
                    isActive = editor && editor.classList.contains('custom-editor');
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
        case 'toggleHighlight':
            toggleHighlightMode();
            break;
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
            execCreateLinkCommand();
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
        // محاولة قراءة HTML المنسق من الحافظة
        const clipboardItems = await navigator.clipboard.read();
        
        for (const item of clipboardItems) {
            // البحث عن HTML أولاً
            if (item.types.includes('text/html')) {
                const blob = await item.getType('text/html');
                const html = await blob.text();
                
                // تنظيف HTML قبل اللصق
                const cleanedHtml = cleanPastedHtml(html);
                document.execCommand('insertHTML', false, cleanedHtml);
                console.log('📌 Paste HTML completed (cleaned)');
                return;
            }
            // إذا لم يكن هناك HTML، استخدم النص العادي
            else if (item.types.includes('text/plain')) {
                const blob = await item.getType('text/plain');
                const text = await blob.text();
                document.execCommand('insertText', false, text);
                console.log('📌 Paste text completed');
                return;
            }
        }
    } catch (err) {
        // إذا فشل، استخدم الطريقة القديمة للنص العادي
        console.error('Paste with clipboard API failed, using fallback:', err);
        try {
            const text = await navigator.clipboard.readText();
            document.execCommand('insertText', false, text);
        } catch (fallbackErr) {
            console.error('Fallback paste also failed:', fallbackErr);
        }
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
        
        // تعطيل الروابط مرة أخرى بعد الحفظ
        setTimeout(() => {
            disableAllLinks();
        }, 50);
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

// دالة لتنظيف HTML الملصق من Word وبرامج أخرى
function cleanPastedHtml(html) {
    // إنشاء عنصر مؤقت لمعالجة HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // كشف إذا كان من Word
    const isFromWord = html.includes('urn:schemas-microsoft-com:office') || 
                       html.includes('MsoNormal') || 
                       html.includes('<!--[if') ||
                       /<(\w+):[^>]+>/i.test(html);
    
    if (isFromWord) {
        console.log('📄 Detected Word content, cleaning...');
        
        // إزالة عناصر Word الخاصة
        const wordElements = temp.querySelectorAll('o\\:p, w\\:sdt, w\\:sdtpr, m\\:omath, v\\:shape, style, meta, link');
        wordElements.forEach(el => el.remove());
        
        // إزالة التعليقات
        removeComments(temp);
        
        // إزالة XML namespaces من العناصر
        cleanElement(temp);
    }
    
    // تنظيف عام للـ HTML (حتى لو لم يكن من Word)
    cleanElement(temp);
    
    // إزالة div الخارجي الغير ضروري إذا كان موجودًا
    // إذا كان المحتوى كله داخل div واحد فقط، استخرج محتواه
    if (temp.children.length === 1 && temp.children[0].tagName.toLowerCase() === 'div') {
        const singleDiv = temp.children[0];
        // تحقق إذا كان div بدون صفات مهمة أو له صفات قليلة
        const hasMinimalAttributes = !singleDiv.hasAttribute('class') && 
                                     !singleDiv.hasAttribute('id') &&
                                     (!singleDiv.hasAttribute('style') || singleDiv.getAttribute('style').trim() === '');
        
        if (hasMinimalAttributes) {
            return singleDiv.innerHTML;
        }
    }
    
    return temp.innerHTML;
}

// إزالة التعليقات من HTML
function removeComments(element) {
    const iterator = document.createNodeIterator(
        element,
        NodeFilter.SHOW_COMMENT,
        null
    );
    
    const comments = [];
    let comment;
    while (comment = iterator.nextNode()) {
        comments.push(comment);
    }
    
    comments.forEach(c => c.remove());
}

// تنظيف العنصر وأبنائه
function cleanElement(element) {
    const allowedTags = [
        'p', 'div', 'span', 'br', 'hr',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
        'ul', 'ol', 'li', 'dl', 'dt', 'dd',
        'a', 'img',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption', 'colgroup', 'col',
        'blockquote', 'pre', 'code',
        'sup', 'sub', 'mark', 'small'
    ];
    
    const allowedAttributes = [
        'href', 'src', 'alt', 'title',
        'style', 'dir', 'align',
        // صفات الجداول
        'colspan', 'rowspan', 'scope', 'headers',
        // صفات القوائم
        'type', 'start', 'reversed'
    ];
    
    const allowedStyles = [
        'color', 'background-color',
        'font-weight', 'font-style', 'text-decoration',
        'text-align', 'direction',
        'margin-left', 'margin-right', 'padding-left', 'padding-right',
        // styles للجداول
        'border', 'border-collapse', 'border-spacing',
        'border-top', 'border-bottom', 'border-left', 'border-right',
        'border-color', 'border-width', 'border-style',
        'width', 'height', 'min-width', 'max-width',
        'vertical-align',
        // styles للقوائم
        'list-style-type', 'list-style-position', 'list-style'
    ];
    
    // معالجة جميع العناصر
    const elements = element.querySelectorAll('*');
    
    elements.forEach(el => {
        const tagName = el.tagName.toLowerCase();
        
        // إزالة العناصر غير المسموح بها
        if (!allowedTags.includes(tagName)) {
            // نقل المحتوى إلى الأب بدلاً من حذفه
            while (el.firstChild) {
                el.parentNode.insertBefore(el.firstChild, el);
            }
            el.remove();
            return;
        }
        
        // تنظيف الصفات
        const attributes = Array.from(el.attributes);
        attributes.forEach(attr => {
            const attrName = attr.name.toLowerCase();
            
            // إزالة صفات XML namespace (مثل w:, o:, v:)
            if (attrName.includes(':')) {
                el.removeAttribute(attr.name);
                return;
            }
            
            // إزالة الصفات غير المسموح بها
            if (!allowedAttributes.includes(attrName)) {
                // استثناء: احتفظ بـ class إذا كان مفيداً
                if (attrName !== 'class' || el.className.includes('Mso')) {
                    el.removeAttribute(attr.name);
                }
            }
        });
        
        // تنظيف classes من Word
        if (el.className) {
            const classes = el.className.split(' ')
                .filter(c => !c.startsWith('Mso') && !c.startsWith('ms-') && c.trim());
            
            if (classes.length === 0) {
                el.removeAttribute('class');
            } else {
                el.className = classes.join(' ');
            }
        }
        
        // تنظيف styles
        if (el.hasAttribute('style')) {
            const currentStyle = el.getAttribute('style');
            const cleanedStyles = [];
            
            // تحليل الـ styles
            currentStyle.split(';').forEach(style => {
                const [property, value] = style.split(':').map(s => s.trim());
                if (property && value && allowedStyles.includes(property.toLowerCase())) {
                    cleanedStyles.push(`${property}: ${value}`);
                }
            });
            
            if (cleanedStyles.length > 0) {
                el.setAttribute('style', cleanedStyles.join('; '));
            } else {
                el.removeAttribute('style');
            }
        }
        
        // تحويل span فارغ إلى br أو حذفه
        if (tagName === 'span' && !el.hasAttributes() && el.textContent.trim() === '') {
            el.remove();
        }
        
        // تنظيف فقرات فارغة من Word (لكن احتفظ بالجداول والقوائم)
        const keepTags = ['table', 'ul', 'ol', 'dl', 'thead', 'tbody', 'tfoot', 'tr'];
        if ((tagName === 'p' || tagName === 'div') && 
            el.textContent.trim() === '' && 
            !el.querySelector('img, br, table, ul, ol, dl') &&
            !keepTags.includes(tagName)) {
            el.remove();
        }
    });
}

function handlePaste(evt) {
    const items = evt.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // معالجة لصق الصور
        if (item.type.startsWith('image/')) {
            evt.preventDefault();
            
            const file = item.getAsFile();
            handleImageUpload(file);
            return;
        }
    }
    
    // السماح بلصق HTML المنسق بشكل طبيعي
    // إذا كان هناك HTML في الحافظة، سيتم لصقه مع التنسيق الأصلي
    const htmlData = evt.clipboardData.getData('text/html');
    if (htmlData) {
        evt.preventDefault();
        
        // تنظيف HTML إذا كان من Word أو برامج أخرى
        const cleanedHtml = cleanPastedHtml(htmlData);
        document.execCommand('insertHTML', false, cleanedHtml);
        console.log('📌 Pasted HTML content with formatting');
    }
    // إذا لم يكن هناك HTML، سيتم لصق النص العادي تلقائياً
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
        
        // تعطيل جميع الروابط
        setTimeout(() => {
            disableAllLinks();
        }, 50);
        
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
    
    // تعطيل جميع الروابط
    setTimeout(() => {
        disableAllLinks();
    }, 50);
    
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

