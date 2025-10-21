# 🎉 تحديث مهم: دعم CSS الخارجي!

## النسخة 0.0.2 - 21 أكتوبر 2025

---

## ✨ الآن المحرر يدعم ملفات CSS الخارجية!

هل كنت تستخدم ملفات CSS منفصلة في مشروعك؟ الآن المحرر سيقرأها تلقائياً! 🎨

### مثال بسيط

**ملف HTML:**
```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>مرحباً</h1>
</body>
</html>
```

**ملف styles.css:**
```css
body {
    background: linear-gradient(to right, #667eea, #764ba2);
}

h1 {
    color: white;
    font-size: 3em;
}
```

**النتيجة:** كل الأنماط ستظهر في المحرر! ✨

---

## 🚀 جرب الآن!

### الطريقة السريعة

1. افتح **test-with-external-css.html** في VS Code أو Cursor
2. اضغط `Ctrl+Shift+P`
3. اكتب `WYSIWYG` واختر "Open HTML Visual Editor"
4. شاهد الأنماط الجميلة! 🎨

### مع Bootstrap

افتح **test-with-bootstrap.html** لترى مثال متقدم مع Bootstrap كامل!

---

## 📦 التثبيت

### في Cursor

```bash
cursor --install-extension vscode-html-wysiwyg-0.0.2.vsix
```

أو يدوياً:
1. Extensions → ⋯ → Install from VSIX
2. اختر `vscode-html-wysiwyg-0.0.2.vsix`

### في VS Code

```bash
code --install-extension vscode-html-wysiwyg-0.0.2.vsix
```

---

## 🎯 ما يعمل الآن

✅ ملفات CSS المحلية (`styles.css`)  
✅ مكتبات CSS من الإنترنت (Bootstrap, Font Awesome, إلخ)  
✅ Google Fonts  
✅ الأنماط الداخلية `<style>`  
✅ دمج كل ما سبق معاً  

---

## 📚 المزيد من التفاصيل

- **دليل سريع**: `CSS_SUPPORT_QUICK_GUIDE.md`
- **توثيق شامل**: `دعم_ملفات_CSS_الخارجية.md`
- **ملخص فني**: `ملخص_التحديث_v0.0.2.md`
- **سجل التغييرات**: `CHANGELOG.md`

---

## 💡 نصائح

1. استخدم **المسارات النسبية** لملفات CSS المحلية
2. تأكد من **اتصالك بالإنترنت** للمكتبات الخارجية
3. لرؤية تغييرات CSS، **أعد فتح المحرر**

---

## 🐛 مشاكل؟

إذا واجهت أي مشاكل:

1. افتح **Developer Console** (`Help > Toggle Developer Tools`)
2. ابحث عن رسائل تبدأ بـ ✅ أو ⚠️ أو ❌
3. راجع `TROUBLESHOOTING.md`

---

**استمتع بالتحرير!** 🎨✨

---

*التحديث القادم: دعم ملفات JavaScript!* 🚀

