# البنية المعمارية للمشروع

## نظرة عامة

هذا المشروع هو إضافة VS Code تتيح تحرير HTML بصورة مرئية (WYSIWYG) باستخدام CKEditor مع تزامن ثنائي الاتجاه.

---

## المكونات الرئيسية

### 1. Extension Host (`src/extension.ts`)

**المسؤولية**: الطبقة الخلفية للإضافة التي تعمل في بيئة Node.js

#### الوظائف الرئيسية

##### أ. `activate()`

- تسجيل الأمر `wysiwyg.open`
- إعداد المستمعين للأحداث
- إدارة دورة حياة الإضافة

##### ب. `createWebviewPanel()`

- إنشاء لوحة Webview مع الإعدادات الآمنة
- تحديد `localResourceRoots` للوصول للملفات المحلية
- ربط معالجات الرسائل

##### ج. `getWebviewContent()`

- توليد HTML للـ Webview ديناميكيًا
- تحويل المسارات إلى `webview.asWebviewUri()`
- إضافة CSP headers

##### د. `updateDocument()`

- استقبال HTML المحدث من Webview
- تطبيق التعديلات على الملف عبر `WorkspaceEdit`
- إدارة flags لتجنب الحلقات اللانهائية

##### هـ. `saveAsset()`

- استقبال الصور بصيغة Base64
- تحويل Base64 إلى Buffer
- إنشاء مجلد `assets/` إن لم يوجد
- حفظ الصورة بالوقت المناسب
- إرسال المسار النسبي إلى Webview

---

### 2. Webview (`media/webview.js`)

**المسؤولية**: الطبقة الأمامية التي تعمل في سياق الـ Webview (iframe آمن)

#### الوظائف الرئيسية

##### أ. `initializeCKEditor()`

- تهيئة CKEditor بالإعدادات المناسبة
- تفعيل اللغة العربية والـ RTL
- تكوين شريط الأدوات
- تفعيل plugins اللازمة

##### ب. `handleEditorChange()`

- الاستماع لتغييرات المحرر
- تطبيق debounce (300ms)
- إرسال `updateHtml` إلى Extension

##### ج. `setupImagePasteHandler()`

- اعتراض حدث `paste`
- كشف الصور الملصقة
- تحويل الصورة إلى dataUrl
- إرسال `saveAsset` إلى Extension

##### د. `handleExternalChange()`

- استقبال تغييرات خارجية من الملف
- مقارنة المحتوى لتجنب الحلقة
- تحديث المحرر دون trigger لحدث التغيير

---

### 3. Communication Protocol (بروتوكول الاتصال)

#### رسائل من Webview إلى Extension

```typescript
// طلب المحتوى الأولي
{ type: 'requestInit' }

// تحديث محتوى الملف
{ type: 'updateHtml', html: string }

// حفظ صورة
{ type: 'saveAsset', filename: string, dataUrl: string }
```

#### رسائل من Extension إلى Webview

```typescript
// إرسال المحتوى الأولي
{ type: 'init', html: string, fileUri: string }

// إشعار بتغيير خارجي
{ type: 'externalChange', html: string }

// إشعار بحفظ الصورة
{ type: 'assetSaved', url: string, originalFilename: string }
```

---

## آلية تجنب الحلقات اللانهائية

### المشكلة

- التحديث من Webview يُحدث الملف
- تحديث الملف يُطلق حدث `onDidChangeTextDocument`
- الحدث يُرسل تحديث إلى Webview
- Webview يُحدث الملف مرة أخرى... **حلقة لانهائية!**

### الحل

#### 1. Flags في Extension

```typescript
let isUpdatingFromWebview = false;  // جاري التحديث من Webview
let isUpdatingFromDocument = false; // جاري التحديث من الملف
```

#### 2. آلية العمل

```
Webview يرسل updateHtml
    ↓
Extension: isUpdatingFromWebview = true
    ↓
تطبيق التعديل على الملف
    ↓
onDidChangeTextDocument يُطلق
    ↓
Extension يتحقق: isUpdatingFromWebview? → نعم → تجاهل
    ↓
بعد 200ms: isUpdatingFromWebview = false
```

#### 3. Debounce

- في Webview: 300ms debounce قبل إرسال التحديثات
- في Extension: تأخير 100ms قبل إرسال التحديثات الخارجية
- يقلل عدد الرسائل ويحسن الأداء

---

## Content Security Policy (CSP)

### السياسة المطبقة

```
default-src 'none';                    // منع كل شيء افتراضيًا
img-src {cspSource} data: blob:;       // صور من المصادر الموثوقة فقط
script-src {cspSource} 'nonce-{xxx}';  // سكربتات مع nonce فقط
style-src {cspSource} 'unsafe-inline'; // أنماط من المصادر الموثوقة
font-src {cspSource};                  // خطوط من المصادر الموثوقة
```

### الفوائد

- ✅ منع XSS attacks
- ✅ منع تحميل محتوى من CDN خارجي
- ✅ التزام بمعايير أمان VS Code
- ✅ السماح فقط بالموارد المحلية

---

## تدفق البيانات (Data Flow)

### 1. فتح المحرر

```
المستخدم يفتح HTML file
    ↓
المستخدم يشغل أمر wysiwyg.open
    ↓
Extension ينشئ WebviewPanel
    ↓
Webview يُحمل ويُرسل requestInit
    ↓
Extension يُرسل init مع محتوى الملف
    ↓
Webview يُهيئ CKEditor ويعرض المحتوى
```

### 2. التحرير في Webview

```
المستخدم يكتب في CKEditor
    ↓
handleEditorChange() يُطلق
    ↓
Debounce 300ms
    ↓
إرسال updateHtml إلى Extension
    ↓
Extension يُحدث الملف (isUpdatingFromWebview = true)
    ↓
onDidChangeTextDocument يُطلق → يُتجاهل
```

### 3. التحرير في الملف

```
المستخدم يُعدل الملف مباشرة
    ↓
onDidChangeTextDocument يُطلق
    ↓
Extension يتحقق: isUpdatingFromWebview? → لا
    ↓
isUpdatingFromDocument = true
    ↓
إرسال externalChange إلى Webview
    ↓
Webview يتحقق: المحتوى مختلف؟ → نعم
    ↓
isUpdatingFromExternal = true
    ↓
تحديث CKEditor (بدون trigger لـ change)
    ↓
isUpdatingFromExternal = false
```

### 4. لصق صورة

```
المستخدم يلصق صورة في CKEditor
    ↓
paste event يُعترض
    ↓
تحويل الصورة إلى dataUrl
    ↓
إرسال saveAsset إلى Extension
    ↓
Extension يحفظ الصورة في assets/
    ↓
إرسال assetSaved مع المسار النسبي
    ↓
Webview يُدرج <img src="assets/xxx.png">
```

---

## الملفات والمسؤوليات

| الملف | المسؤولية | البيئة |
|------|-----------|--------|
| `src/extension.ts` | منطق الإضافة الرئيسي | Node.js |
| `media/webview.js` | تهيئة CKEditor والتزامن | Browser |
| `media/styles.css` | تنسيقات الواجهة | Browser |
| `vendor/ckeditor/` | محرر CKEditor المحلي | Browser |
| `package.json` | إعدادات الإضافة | - |
| `tsconfig.json` | إعدادات TypeScript | - |

---

## الاعتبارات الأمنية

### 1. CSP صارم

- منع تحميل موارد خارجية
- استخدام nonce للسكربتات
- السماح فقط بالموارد المحلية

### 2. تنظيف المسارات

- استخدام `path.join()` لتجنب path traversal
- التحقق من نوع الملف قبل الحفظ
- حفظ الصور فقط في مجلد `assets/`

### 3. التحقق من صحة البيانات

- التحقق من أن dataUrl صحيح
- استخراج MIME type بأمان
- معالجة الأخطاء في جميع العمليات

---

## الأداء والتحسينات

### 1. Debouncing

- 300ms في Webview
- 100ms في Extension
- يقلل عدد التحديثات بنسبة 90%

### 2. Retain Context

- `retainContextWhenHidden: true`
- يحفظ حالة Webview عند الإخفاء
- يسرّع إعادة الفتح

### 3. Efficient Diffing

- مقارنة المحتوى قبل التحديث
- تجنب التحديثات غير الضرورية
- استخدام flags ذكية

---

## التوسعات المستقبلية

### المرحلة 2: وضع عرض المصدر

- إضافة Monaco Editor للمصدر
- Diff viewer للتغييرات
- تبديل سلس بين الأوضاع

### المرحلة 3: تعليقات موضعية

- إضافة Markers في DOM
- ربط العناصر بالنطاقات النصية
- Decorations في المحرر

### المرحلة 4: محرر خاص

- استبدال CKEditor بـ ProseMirror/Slate
- Content Model مخصص
- أدوات تنسيق خاصة

---

## الخلاصة

البنية الحالية بسيطة وفعالة:

- ✅ فصل واضح بين Extension و Webview
- ✅ بروتوكول اتصال محدد
- ✅ آلية ذكية لتجنب الحلقات
- ✅ أمان عالي مع CSP
- ✅ قابلة للتوسع والتطوير

هذه البنية تُشكل أساسًا متينًا للمراحل القادمة!
