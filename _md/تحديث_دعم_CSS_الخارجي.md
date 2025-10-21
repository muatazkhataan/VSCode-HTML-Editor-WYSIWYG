# 🎉 تحديث جديد: دعم ملفات CSS الخارجية!

## ما الجديد؟

المحرر الآن يدعم **تلقائياً** قراءة وتطبيق أي ملفات CSS مرتبطة بملف HTML!

## أمثلة سريعة

### 1️⃣ ملفات CSS محلية

```html
<head>
    <link rel="stylesheet" href="styles.css">
</head>
```

المحرر سيقرأ محتوى `styles.css` ويطبقه في المعاينة! ✨

### 2️⃣ مكتبات من الإنترنت

```html
<head>
    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
```

كل المكتبات الخارجية تعمل الآن! 🚀

### 3️⃣ دمج الأنماط

```html
<head>
    <link rel="stylesheet" href="external.css">
    <style>
        .my-style { color: red; }
    </style>
</head>
```

يمكنك استخدام الأنماط الخارجية والداخلية معاً! 🎨

## جرب الآن!

### الطريقة الأولى: الملفات التجريبية

افتح أحد الملفات التجريبية الجديدة:

1. **test-with-external-css.html** - مثال بسيط مع ملف CSS محلي
2. **test-with-bootstrap.html** - مثال متقدم مع Bootstrap

ثم:
```
Ctrl+Shift+P → "WYSIWYG: Open Visual Editor"
```

### الطريقة الثانية: ملفاتك الخاصة

إذا كان لديك مشروع HTML موجود بالفعل مع ملفات CSS، فقط افتح أي ملف HTML في المحرر وسترى جميع الأنماط مطبقة! 🎉

## ما الذي يتم دعمه؟

✅ ملفات CSS محلية (نسبية للملف HTML)  
✅ روابط CSS خارجية (http/https)  
✅ الأنماط الداخلية `<style>`  
✅ تحويل تلقائي من `body` إلى `#editor`  
✅ دعم الخطوط من Google Fonts وغيرها  
✅ Bootstrap, Tailwind, Font Awesome, وأي مكتبة CSS أخرى  

## التحسينات التقنية

- 🔧 قراءة تلقائية لملفات CSS من القرص
- 🔧 تحويل ذكي للأنماط لتعمل في المحرر
- 🔧 تحديث Content Security Policy لدعم الموارد الخارجية
- 🔧 معالجة أخطاء عند عدم وجود الملفات

## الإصدار

تم رفع الإصدار إلى **v0.0.2**

## التوثيق الكامل

للمزيد من التفاصيل، راجع:

- 📖 **دعم_ملفات_CSS_الخارجية.md** - توثيق شامل
- 📋 **CSS_SUPPORT_QUICK_GUIDE.md** - دليل سريع
- 📝 **CHANGELOG.md** - سجل التغييرات الكامل

---

## ملاحظات

- الأنماط تُقرأ عند فتح المحرر فقط
- لرؤية التغييرات في ملف CSS خارجي، أعد فتح المحرر
- الروابط الخارجية تتطلب اتصال بالإنترنت

**استمتع بالتحرير مع الأنماط الكاملة!** 🎨✨

