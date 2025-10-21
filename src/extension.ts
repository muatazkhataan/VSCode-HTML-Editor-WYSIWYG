import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

let currentPanel: vscode.WebviewPanel | undefined = undefined;
let currentDocument: vscode.TextDocument | undefined = undefined;
let isUpdatingFromWebview = false;
let isUpdatingFromDocument = false;

export function activate(context: vscode.ExtensionContext) {
    console.log('HTML WYSIWYG Extension activated');

    // تسجيل الأمر لفتح المحرر المرئي
    const disposable = vscode.commands.registerCommand('wysiwyg.open', () => {
        const editor = vscode.window.activeTextEditor;
        
        if (!editor) {
            vscode.window.showErrorMessage('لا يوجد ملف مفتوح');
            return;
        }

        const document = editor.document;
        
        if (document.languageId !== 'html') {
            vscode.window.showErrorMessage('يرجى فتح ملف HTML أولاً');
            return;
        }

        currentDocument = document;
        
        if (currentPanel) {
            currentPanel.reveal(vscode.ViewColumn.Beside);
            // تحديث الـ HTML للمحرر مع CSS الجديد
            currentPanel.webview.html = getWebviewContent(currentPanel.webview, context, currentDocument);
            // إرسال المحتوى الجديد
            setTimeout(() => {
                if (currentPanel && currentDocument) {
                    sendInitMessage(currentPanel.webview, currentDocument);
                }
            }, 500);
        } else {
            currentPanel = createWebviewPanel(context, document);
        }
    });

    context.subscriptions.push(disposable);

    // الاستماع لتغييرات الملف
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            if (!currentPanel || !currentDocument || event.document !== currentDocument) {
                return;
            }

            // تجنب الحلقة اللانهائية
            if (isUpdatingFromWebview) {
                return;
            }

            isUpdatingFromDocument = true;
            
            // إرسال المحتوى المحدث إلى Webview
            setTimeout(() => {
                if (currentPanel && currentDocument) {
                    currentPanel.webview.postMessage({
                        type: 'externalChange',
                        html: currentDocument.getText()
                    });
                }
                isUpdatingFromDocument = false;
            }, 100);
        })
    );

    // الاستماع لتغيير الملف النشط
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            // التحقق من وجود محرر مفتوح ومحرر مرئي نشط
            if (!currentPanel || !editor) {
                return;
            }

            const document = editor.document;
            
            // التحقق من أن الملف الجديد هو HTML
            if (document.languageId !== 'html') {
                return;
            }

            // تحديث المستند الحالي
            currentDocument = document;
            
            console.log('📄 تم التبديل إلى ملف HTML جديد:', document.fileName);
            
            // تحديث محتوى الـ Webview بالكامل مع CSS الجديد
            currentPanel.webview.html = getWebviewContent(currentPanel.webview, context, document);
            
            // إرسال المحتوى الجديد
            setTimeout(() => {
                if (currentPanel && currentDocument) {
                    sendInitMessage(currentPanel.webview, currentDocument);
                }
            }, 500);
        })
    );
}

function createWebviewPanel(context: vscode.ExtensionContext, document: vscode.TextDocument): vscode.WebviewPanel {
    // الحصول على workspace roots للسماح بالوصول لجميع الملفات في المشروع
    const workspaceFolders = vscode.workspace.workspaceFolders || [];
    const localResourceRoots = [
        vscode.Uri.file(path.join(context.extensionPath, 'media')),
        ...workspaceFolders.map(folder => folder.uri)
    ];
    
    const panel = vscode.window.createWebviewPanel(
        'htmlWysiwyg',
        'HTML Visual Editor',
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: localResourceRoots
        }
    );

    panel.webview.html = getWebviewContent(panel.webview, context, document);

    // إرسال المحتوى الأولي بعد تحميل Webview
    setTimeout(() => {
        sendInitMessage(panel.webview, document);
    }, 1000);

    // معالجة الرسائل من Webview
    panel.webview.onDidReceiveMessage(
        async (message) => {
            console.log('Extension received message:', message.type);
            
            // الحصول على الملف النشط الحالي (أكثر موثوقية من currentDocument)
            const activeEditor = vscode.window.activeTextEditor;
            let targetDocument: vscode.TextDocument | undefined;
            
            // إذا كان هناك محرر نشط وهو HTML، استخدمه
            if (activeEditor && activeEditor.document.languageId === 'html') {
                targetDocument = activeEditor.document;
                // تحديث currentDocument للتزامن
                currentDocument = targetDocument;
                console.log('🎯 Using active editor:', targetDocument.fileName);
            } else if (currentDocument) {
                // استخدم currentDocument كخيار احتياطي
                targetDocument = currentDocument;
                console.log('📋 Using current document:', targetDocument.fileName);
            } else {
                console.error('❌ No document available');
                return;
            }
            
            switch (message.type) {
                case 'requestInit':
                    console.log('Sending init message...');
                    sendInitMessage(panel.webview, targetDocument);
                    break;

                case 'updateHtml':
                    console.log('✍️ Updating document:', targetDocument.fileName);
                    await updateDocument(targetDocument, message.html);
                    break;

                case 'saveAsset':
                    console.log('Saving asset...');
                    await saveAsset(panel.webview, targetDocument, message.filename, message.dataUrl);
                    break;

                case 'cursorPosition':
                    console.log('Syncing cursor position:', message.offset);
                    syncCursorToDocument(targetDocument, message.offset);
                    break;
            }
        },
        undefined,
        context.subscriptions
    );

    panel.onDidDispose(() => {
        currentPanel = undefined;
        currentDocument = undefined;
    });

    return panel;
}

function getWebviewContent(webview: vscode.Webview, context: vscode.ExtensionContext, document: vscode.TextDocument): string {
    const mediaPath = vscode.Uri.file(path.join(context.extensionPath, 'media'));
    
    const mediaUri = webview.asWebviewUri(mediaPath);
    const cspSource = webview.cspSource;

    // توليد nonce عشوائي لـ CSP
    const nonce = getNonce();

    // استخراج محتوى <style> من المستند الأصلي وتحويله للمحرر
    const htmlContent = document.getText();
    const documentDir = path.dirname(document.uri.fsPath);
    
    // استخراج وتحميل ملفات CSS الخارجية
    let externalStyles = '';
    const linkMatches = htmlContent.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi);
    
    for (const linkMatch of linkMatches) {
        const linkTag = linkMatch[0];
        const hrefMatch = linkTag.match(/href=["']([^"']+)["']/i);
        
        if (hrefMatch) {
            const href = hrefMatch[1];
            
            // تجاهل الروابط الخارجية (http/https)
            if (!href.startsWith('http://') && !href.startsWith('https://')) {
                try {
                    const cssPath = path.join(documentDir, href);
                    if (fs.existsSync(cssPath)) {
                        const cssContent = fs.readFileSync(cssPath, 'utf-8');
                        
                        // تحويل CSS من body إلى #editor
                        const convertedCss = cssContent
                            .replace(/\bbody\s*\{/g, '#editor {')
                            .replace(/\bbody\s+/g, '#editor ')
                            .replace(/\bbody\s*>/g, '#editor >');
                        
                        externalStyles += '<style>' + convertedCss + '</style>\n';
                        console.log(`✅ تم تحميل ملف CSS: ${href}`);
                    } else {
                        console.warn(`⚠️ ملف CSS غير موجود: ${cssPath}`);
                    }
                } catch (error) {
                    console.error(`❌ خطأ في تحميل ملف CSS ${href}:`, error);
                }
            } else {
                // للروابط الخارجية، احتفظ بها كما هي
                externalStyles += `<link rel="stylesheet" href="${href}">\n`;
                console.log(`🌐 تم إضافة رابط CSS خارجي: ${href}`);
            }
        }
    }
    
    // استخراج محتوى <style> الداخلي
    const styleMatch = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    let inlineStyles = '';
    
    if (styleMatch) {
        // استخراج محتوى CSS فقط
        const cssContent = styleMatch.map(style => {
            const match = style.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
            return match ? match[1] : '';
        }).join('\n');
        
        // تحويل CSS من body إلى #editor
        const convertedCss = cssContent
            .replace(/\bbody\s*\{/g, '#editor {')
            .replace(/\bbody\s+/g, '#editor ')
            .replace(/\bbody\s*>/g, '#editor >');
        
        inlineStyles = '<style>' + convertedCss + '</style>';
    }
    
    // دمج جميع الأنماط
    const allStyles = externalStyles + inlineStyles;

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="
        default-src 'none';
        img-src ${cspSource} data: blob: https:;
        script-src ${cspSource} 'nonce-${nonce}' https:;
        style-src ${cspSource} 'unsafe-inline' https:;
        font-src ${cspSource} https: data:;
        connect-src https:;
    ">
    <title>HTML Visual Editor</title>
    <link rel="stylesheet" href="${mediaUri}/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    ${allStyles}
</head>
<body>
    <div id="toolbar" class="toolbar"></div>
    <div class="editor-container">
        <div id="editor" class="editor"></div>
    </div>
    
    <script nonce="${nonce}" src="${mediaUri}/webview.js"></script>
</body>
</html>`;
}

function sendInitMessage(webview: vscode.Webview, document: vscode.TextDocument) {
    const htmlContent = document.getText();
    console.log('Sending init message with HTML:', htmlContent.substring(0, 100) + '...');
    
    webview.postMessage({
        type: 'init',
        html: htmlContent,
        fileUri: document.uri.toString()
    });
}

async function updateDocument(document: vscode.TextDocument, html: string) {
    if (isUpdatingFromDocument) {
        return;
    }

    isUpdatingFromWebview = true;

    try {
        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
        );
        
        edit.replace(document.uri, fullRange, html);
        await vscode.workspace.applyEdit(edit);
        
        // الانتظار قليلاً قبل إعادة تفعيل الاستماع
        setTimeout(() => {
            isUpdatingFromWebview = false;
        }, 200);
    } catch (error) {
        console.error('Error updating document:', error);
        isUpdatingFromWebview = false;
    }
}

async function saveAsset(webview: vscode.Webview, document: vscode.TextDocument, filename: string, dataUrl: string): Promise<void> {
    try {
        // استخراج البيانات من dataUrl
        const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
            throw new Error('Invalid data URL');
        }

        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        // تحديد الامتداد من MIME type
        let extension = '.png';
        if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
            extension = '.jpg';
        } else if (mimeType.includes('png')) {
            extension = '.png';
        } else if (mimeType.includes('gif')) {
            extension = '.gif';
        } else if (mimeType.includes('webp')) {
            extension = '.webp';
        }

        // إنشاء اسم فريد للملف
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const uniqueFilename = `img_${timestamp}${extension}`;

        // إنشاء مجلد assets بجوار الملف
        const documentDir = path.dirname(document.uri.fsPath);
        const assetsDir = path.join(documentDir, 'assets');
        
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
        }

        // حفظ الملف
        const assetPath = path.join(assetsDir, uniqueFilename);
        fs.writeFileSync(assetPath, new Uint8Array(buffer));

        // إرسال المسار النسبي إلى Webview
        const relativePath = `assets/${uniqueFilename}`;
        webview.postMessage({
            type: 'assetSaved',
            url: relativePath,
            originalFilename: filename
        });

    } catch (error) {
        console.error('Error saving asset:', error);
        vscode.window.showErrorMessage(`فشل حفظ الصورة: ${error}`);
    }
}

function syncCursorToDocument(document: vscode.TextDocument, offset: number) {
    try {
        // البحث عن موضع body في المستند
        const fullText = document.getText();
        const bodyMatch = fullText.match(/<body[^>]*>/i);
        
        if (!bodyMatch) {
            return;
        }
        
        // حساب الموضع الفعلي في المستند
        const bodyStartIndex = bodyMatch.index! + bodyMatch[0].length;
        const actualOffset = bodyStartIndex + offset;
        
        // التأكد من أن الموضع ضمن المستند
        if (actualOffset >= 0 && actualOffset <= fullText.length) {
            const position = document.positionAt(actualOffset);
            
            // تحريك المؤشر وعرض المنطقة
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document === document) {
                editor.selection = new vscode.Selection(position, position);
                editor.revealRange(
                    new vscode.Range(position, position),
                    vscode.TextEditorRevealType.InCenterIfOutsideViewport
                );
            }
        }
    } catch (error) {
        console.error('Error syncing cursor:', error);
    }
}

function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export function deactivate() {
    if (currentPanel) {
        currentPanel.dispose();
    }
}

