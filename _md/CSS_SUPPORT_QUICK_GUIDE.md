# دليل سريع: دعم CSS الخارجي 🚀

## التحديث الجديد ✨

المحرر الآن يدعم **تلقائياً** قراءة وتطبيق ملفات CSS الخارجية!

## كيفية الاستخدام

### 1. ملفات CSS محلية

```html
<head>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="css/main.css">
</head>
```

### 2. مكتبات CSS من الإنترنت

```html
<head>
    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Cairo&display=swap" rel="stylesheet">
</head>
```

### 3. دمج الأنماط

```html
<head>
    <link rel="stylesheet" href="external.css">
    <style>
        .custom { color: red; }
    </style>
</head>
```

## التجربة الآن! 🎨

افتح الملف `test-with-external-css.html` في المحرر لرؤية المثال العملي!

```bash
# في VS Code أو Cursor:
1. افتح test-with-external-css.html
2. اضغط Ctrl+Shift+P
3. اختر "WYSIWYG: Open HTML Visual Editor"
4. استمتع! ✨
```

## ماذا تم تحسينه؟

- ✅ قراءة تلقائية لملفات CSS المحلية
- ✅ دعم روابط CSS الخارجية (CDN)
- ✅ تحويل ذكي للأنماط من `body` إلى `#editor`
- ✅ معالجة أخطاء عند عدم وجود الملفات
- ✅ دمج الأنماط الداخلية والخارجية

## التغييرات التقنية

### في `src/extension.ts`:

```typescript
// استخراج وتحميل ملفات CSS الخارجية
const linkMatches = htmlContent.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi);

for (const linkMatch of linkMatches) {
    // قراءة محتوى الملف
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    
    // تحويل من body إلى #editor
    const convertedCss = cssContent
        .replace(/\bbody\s*\{/g, '#editor {')
        .replace(/\bbody\s+/g, '#editor ')
        .replace(/\bbody\s*>/g, '#editor >');
}
```

### تحديثات CSP:

```typescript
style-src ${cspSource} 'unsafe-inline' https:;
font-src ${cspSource} https: data:;
```

## للمزيد من التفاصيل

راجع الملف الكامل: `دعم_ملفات_CSS_الخارجية.md`

---

**نصيحة:** الملفات التجريبية تحتوي على أمثلة جاهزة للاستخدام! 🎯

