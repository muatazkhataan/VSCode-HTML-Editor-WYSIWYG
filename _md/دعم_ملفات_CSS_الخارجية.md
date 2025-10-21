# دعم ملفات CSS و Script الخارجية 🎨

## نظرة عامة

تم تطوير محرر HTML المرئي ليدعم الآن قراءة وتطبيق ملفات CSS الخارجية المرتبطة بملف HTML. هذا يعني أن أي ملف CSS تستخدمه في مشروعك سيتم تطبيقه تلقائياً في المعاينة المرئية!

## الميزات الجديدة ✨

### 1. دعم ملفات CSS المحلية

يمكنك الآن استخدام ملفات CSS محلية في مشروعك:

```html
<head>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="../shared/styles.css">
</head>
```

المحرر سيقوم بـ:
- ✅ قراءة محتوى الملف من القرص
- ✅ تطبيق الأنماط في معاينة المحرر
- ✅ تحويل الأنماط المطبقة على `body` لتعمل مع المحرر

### 2. دعم مكتبات CSS الخارجية

يمكنك أيضاً استخدام مكتبات CSS من الإنترنت:

```html
<head>
    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
</head>
```

### 3. دمج الأنماط الداخلية والخارجية

يمكنك استخدام كلاً من الأنماط الخارجية والداخلية معاً:

```html
<head>
    <!-- ملف خارجي -->
    <link rel="stylesheet" href="main.css">
    
    <!-- أنماط داخلية -->
    <style>
        .special {
            color: red;
        }
    </style>
</head>
```

المحرر سيدمج كل الأنماط بشكل صحيح!

## كيفية العمل 🔧

### التحويل التلقائي للأنماط

عندما تستخدم أنماط CSS على عنصر `body`، يقوم المحرر بتحويلها تلقائياً لتطبيقها على منطقة المحرر `#editor`:

**قبل:**
```css
body {
    font-family: Arial;
    background-color: #f5f5f5;
}

body > h1 {
    color: red;
}
```

**بعد التحويل (داخل المحرر):**
```css
#editor {
    font-family: Arial;
    background-color: #f5f5f5;
}

#editor > h1 {
    color: red;
}
```

### معالجة الأخطاء

- إذا كان ملف CSS غير موجود، سيتم عرض تحذير في Console ولن يتوقف المحرر
- إذا فشلت قراءة الملف، سيتم عرض رسالة خطأ في Console
- الروابط الخارجية (http/https) تُترك كما هي للمتصفح

## مثال عملي 📝

### 1. إنشاء ملف CSS

أنشئ ملف `styles.css` بجانب ملف HTML:

```css
body {
    font-family: 'Cairo', sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f8f9fa;
}

h1 {
    color: #2c3e50;
    border-bottom: 3px solid #3498db;
}

p {
    line-height: 1.8;
    color: #34495e;
}
```

### 2. ربط الملف في HTML

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>مستندي</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>مرحباً بالعالم</h1>
    <p>هذا نص تجريبي.</p>
</body>
</html>
```

### 3. افتح المحرر

1. افتح ملف HTML في VS Code أو Cursor
2. اضغط `Ctrl+Shift+P` (أو `Cmd+Shift+P` على Mac)
3. اختر `WYSIWYG: Open Visual Editor`
4. ستظهر المعاينة مع جميع الأنماط مطبقة! ✨

## التحديثات في سياسة الأمان (CSP)

تم تحديث سياسة أمان المحتوى للسماح بـ:

```
- img-src: data:, blob:, https:
- script-src: https:
- style-src: 'unsafe-inline', https:
- font-src: https:, data:
- connect-src: https:
```

هذا يضمن عمل المكتبات الخارجية والخطوط والموارد من CDN بشكل صحيح.

## ملاحظات مهمة ⚠️

1. **المسارات النسبية**: تأكد من استخدام المسارات الصحيحة نسبةً لموقع ملف HTML
2. **الترتيب**: يتم تطبيق الأنماط بنفس الترتيب الموجود في HTML
3. **التحديثات المباشرة**: حالياً، التغييرات في ملفات CSS الخارجية تتطلب إعادة فتح المحرر
4. **الأداء**: يتم قراءة ملفات CSS عند فتح المحرر فقط، لذا لن يؤثر على أداء التحرير

## الميزات المستقبلية 🚀

نخطط لإضافة:

- [ ] دعم ملفات JavaScript الخارجية `<script src="...">`
- [ ] إعادة تحميل تلقائية عند تغيير ملفات CSS
- [ ] معاينة ملفات SCSS/SASS
- [ ] دعم CSS Modules
- [ ] خيار تعطيل/تفعيل ملفات معينة في المعاينة

## استكشاف الأخطاء 🔍

### المشكلة: الأنماط لا تظهر

**الحلول:**
1. تأكد من صحة مسار الملف
2. افتح Developer Console في VS Code (`Help > Toggle Developer Tools`)
3. ابحث عن رسائل الخطأ أو التحذيرات
4. تحقق من أن الملف موجود فعلاً في المسار المحدد

### المشكلة: بعض الأنماط لا تعمل

**السبب:** الأنماط المطبقة على `html` أو عناصر خارج `body` قد لا تظهر

**الحل:** استخدم الأنماط على عناصر داخل `body` فقط

### المشكلة: الخطوط الخارجية لا تظهر

**الحل:** تأكد من أن لديك اتصال بالإنترنت وأن الروابط صحيحة

## الملفات التجريبية 📁

تم إضافة ملفين للاختبار:

1. `test-styles.css` - ملف أنماط تجريبي مع تصميم جميل
2. `test-with-external-css.html` - ملف HTML يستخدم الملف السابق

جرّب فتح `test-with-external-css.html` في المحرر لرؤية الميزة في العمل!

## الخلاصة 🎉

الآن محرر HTML المرئي أصبح أكثر قوة واحترافية! يمكنك استخدام أي ملفات CSS في مشروعك وستظهر تلقائياً في المعاينة، مما يجعل تجربة التحرير أقرب للنتيجة النهائية.

**استمتع بالتحرير!** ✨

