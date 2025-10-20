# 🔧 دليل حل المشاكل

## 🚨 إذا لم يعمل التطبيق، اتبع هذه الخطوات بالترتيب

---

## ✅ الخطوة 1: التحقق من البنية الأساسية

قم بتشغيل هذا الأمر:

```bash
cd /Users/muataz/Workspace/VSCode-HTML-Editor-WYSIWYG

# التحقق من الملفات المطلوبة
echo "=== التحقق من الملفات ==="
test -f dist/extension.js && echo "✅ dist/extension.js موجود" || echo "❌ dist/extension.js مفقود"
test -f vendor/ckeditor/ckeditor.js && echo "✅ CKEditor موجود" || echo "❌ CKEditor مفقود"
test -f media/webview.js && echo "✅ webview.js موجود" || echo "❌ webview.js مفقود"
test -f media/styles.css && echo "✅ styles.css موجود" || echo "❌ styles.css مفقود"
test -f test.html && echo "✅ test.html موجود" || echo "❌ test.html مفقود"

# التحقق من اللغة العربية
test -f vendor/ckeditor/lang/ar.js && echo "✅ اللغة العربية موجودة" || echo "❌ اللغة العربية مفقودة"
```

### الحلول

#### إذا كان `dist/extension.js` مفقود

```bash
npm run build
```

#### إذا كان `CKEditor` مفقود

```bash
# إعادة تثبيت CKEditor
npm install
cp -r node_modules/ckeditor4/* vendor/ckeditor/
```

---

## ✅ الخطوة 2: التشغيل الصحيح

### الطريقة الصحيحة

1. **افتح المشروع في VS Code**

   ```bash
   code /Users/muataz/Workspace/VSCode-HTML-Editor-WYSIWYG
   ```

2. **اضغط F5** (أو Run > Start Debugging)
   - يجب أن تظهر نافذة جديدة: **[Extension Development Host]**
   - إذا لم تظهر، راجع الخطوة التالية

3. **في النافذة الجديدة:**
   - افتح `test.html`
   - اضغط `Cmd+Shift+P`
   - اكتب: `wysiwyg`
   - يجب أن يظهر: **WYSIWYG: Open HTML Visual Editor**

---

## ✅ الخطوة 3: فحص الأخطاء

### في نافذة Extension Development Host

1. افتح Developer Tools:
   - `Help > Toggle Developer Tools`
   - أو اضغط `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)

2. افتح تبويب **Console**

3. ابحث عن أخطاء مثل:
   - ❌ `CKEDITOR is not defined`
   - ❌ `Failed to load resource`
   - ❌ `Content Security Policy`
   - ❌ `404 Not Found`

### الحلول حسب الخطأ

#### خطأ: `CKEDITOR is not defined`

**السبب**: CKEditor لم يُحمّل

**الحل**:

```bash
# تحقق من وجود الملف
ls -lh vendor/ckeditor/ckeditor.js

# إذا لم يكن موجود
npm install
cp -r node_modules/ckeditor4/* vendor/ckeditor/

# أعد البناء
npm run build
```

#### خطأ: `Failed to load resource: net::ERR_FILE_NOT_FOUND`

**السبب**: مسارات الملفات غير صحيحة

**الحل**: تأكد من أن بنية المجلدات صحيحة:

```
vendor/ckeditor/ckeditor.js
media/webview.js
media/styles.css
```

#### خطأ: Content Security Policy

**السبب**: CSP صارم جدًا

**الحل**: راجع ملف `extension.ts` في السطر 132-138

---

## ✅ الخطوة 4: اختبار مُبسّط

سأنشئ لك نسخة تشخيص مُبسّطة:

### اختبار 1: هل الأمر مُسجّل؟

في Extension Development Host، افتح Terminal:

```bash
code --list-extensions
```

يجب أن ترى الإضافة في القائمة عند تشغيل F5.

### اختبار 2: هل الأمر يُنفّذ؟

1. افتح أي ملف HTML
2. افتح Command Palette (`Cmd+Shift+P`)
3. اكتب: `wysiwyg`
4. هل يظهر الأمر؟
   - ✅ **نعم**: انتقل لاختبار 3
   - ❌ **لا**: المشكلة في التسجيل (راجع الخطوة 5)

### اختبار 3: هل Webview يفتح؟

1. شغّل الأمر
2. هل تظهر لوحة جانبية؟
   - ✅ **نعم**: المشكلة في CKEditor (راجع الخطوة 6)
   - ❌ **لا**: المشكلة في Webview (راجع الخطوة 5)

---

## ✅ الخطوة 5: إصلاح مشاكل التسجيل

إذا لم يظهر الأمر في Command Palette:

### الحل 1: التحقق من package.json

تأكد من أن `package.json` يحتوي على:

```json
{
  "activationEvents": ["onCommand:wysiwyg.open"],
  "contributes": {
    "commands": [
      {
        "command": "wysiwyg.open",
        "title": "WYSIWYG: Open HTML Visual Editor"
      }
    ]
  },
  "main": "./dist/extension.js"
}
```

### الحل 2: إعادة تحميل النافذة

في Extension Development Host:

- `Cmd+Shift+P` → اكتب: `Reload Window`

### الحل 3: إعادة البناء

```bash
npm run build
# ثم اضغط F5 مرة أخرى
```

---

## ✅ الخطوة 6: إصلاح مشاكل CKEditor

إذا فتح Webview لكن CKEditor لا يظهر:

### المشكلة 1: الملفات لم تُحمّل

**التحقق**: افتح Console وابحث عن:

```
GET vscode-webview://... 404 (Not Found)
```

**الحل**:

```bash
# تأكد من صلاحيات localResourceRoots في extension.ts
# يجب أن تضم:
# - context.extensionPath + '/media'
# - context.extensionPath + '/vendor'
```

### المشكلة 2: CSP يمنع التنفيذ

**التحقق**: ابحث عن:

```
Refused to execute inline script because it violates Content Security Policy
```

**الحل**: تأكد من أن السكربتات تستخدم `nonce` في `extension.ts`

### المشكلة 3: CKEditor لم يُهيّأ

**التحقق**: في Console اكتب:

```javascript
typeof CKEDITOR
```

إذا كانت النتيجة `"undefined"`:

- CKEditor لم يُحمّل
- المسار خاطئ

---

## ✅ الخطوة 7: إنشاء نسخة تشخيص

سأنشئ ملف تشخيص مُبسّط:

```bash
# احفظ هذا في debug-test.sh
#!/bin/bash

echo "=== تشخيص شامل ==="

echo ""
echo "1. التحقق من البنية:"
test -d vendor/ckeditor && echo "✅ vendor/ckeditor موجود" || echo "❌ vendor/ckeditor مفقود"
test -d media && echo "✅ media موجود" || echo "❌ media مفقود"
test -d dist && echo "✅ dist موجود" || echo "❌ dist مفقود"

echo ""
echo "2. التحقق من الملفات:"
test -f dist/extension.js && echo "✅ extension.js مبني" || echo "❌ extension.js مفقود - قم بـ: npm run build"
test -f vendor/ckeditor/ckeditor.js && echo "✅ ckeditor.js موجود" || echo "❌ ckeditor.js مفقود - قم بـ: npm install && cp -r node_modules/ckeditor4/* vendor/ckeditor/"
test -f media/webview.js && echo "✅ webview.js موجود" || echo "❌ webview.js مفقود"
test -f media/styles.css && echo "✅ styles.css موجود" || echo "❌ styles.css مفقود"

echo ""
echo "3. التحقق من package.json:"
grep -q "wysiwyg.open" package.json && echo "✅ الأمر مُسجّل" || echo "❌ الأمر غير مُسجّل"
grep -q "dist/extension.js" package.json && echo "✅ main صحيح" || echo "❌ main خاطئ"

echo ""
echo "4. حجم الملفات:"
ls -lh dist/extension.js 2>/dev/null | awk '{print "dist/extension.js: " $5}'
ls -lh vendor/ckeditor/ckeditor.js 2>/dev/null | awk '{print "ckeditor.js: " $5}'

echo ""
echo "=== إذا كانت جميع النقاط ✅، المشكلة في التشغيل ==="
echo "تأكد من أنك ضغطت F5 وفتحت ملف HTML في النافذة الجديدة"
```

شغّله:

```bash
chmod +x debug-test.sh
./debug-test.sh
```

---

## ✅ الخطوة 8: الحل النهائي (إعادة بناء كاملة)

إذا لم ينجح شيء:

```bash
# 1. نظّف كل شيء
rm -rf dist/
rm -rf node_modules/
rm -rf vendor/ckeditor/
rm package-lock.json

# 2. أعد التثبيت
npm install

# 3. انسخ CKEditor
mkdir -p vendor/ckeditor
cp -r node_modules/ckeditor4/* vendor/ckeditor/

# 4. ابنِ المشروع
npm run build

# 5. تحقق من النتيجة
ls -lh dist/extension.js
ls -lh vendor/ckeditor/ckeditor.js
```

---

## 📋 Checklist سريع

قبل التشغيل، تأكد من:

- [ ] ✅ `npm install` تم تشغيله
- [ ] ✅ `npm run build` تم تشغيله
- [ ] ✅ `vendor/ckeditor/ckeditor.js` موجود
- [ ] ✅ `dist/extension.js` موجود
- [ ] ✅ فتحت المشروع في VS Code
- [ ] ✅ ضغطت **F5** (لا تشغل الملف مباشرة!)
- [ ] ✅ النافذة الجديدة مكتوب عليها **[Extension Development Host]**
- [ ] ✅ فتحت ملف HTML في النافذة الجديدة (مهم!)
- [ ] ✅ ضغطت `Cmd+Shift+P` في النافذة الجديدة
- [ ] ✅ بحثت عن `wysiwyg`

---

## 🎯 أكثر المشاكل شيوعًا

### المشكلة: "الأمر لا يظهر"

**السبب**: لم تفتح ملف HTML
**الحل**: افتح `test.html` أولاً

### المشكلة: "Webview فارغ"

**السبب**: CKEditor لم يُحمّل
**الحل**: افتح Console وراجع الأخطاء

### المشكلة: "الأمر موجود لكن لا يفعل شيء"

**السبب**: خطأ في extension.ts
**الحل**: راجع Console في النافذة الأصلية (ليست Development Host)

---

## 📞 إذا استمرت المشكلة

أرسل لي:

1. **نتيجة السكربت التشخيصي** (`./debug-test.sh`)
2. **صورة شاشة من Console** (بعد فتح Developer Tools)
3. **نص الخطأ** (إن وُجد)
4. **خطوات ما فعلته بالتحديد**

سأساعدك في حل المشكلة!

---

**ملاحظة مهمة**: ❗

الطريقة الصحيحة الوحيدة للتشغيل هي:

1. افتح المشروع في VS Code
2. اضغط **F5**
3. في النافذة الجديدة [Extension Development Host]
4. افتح ملف HTML
5. اضغط Cmd+Shift+P → wysiwyg

**لا تحاول فتح الملفات مباشرة!**
