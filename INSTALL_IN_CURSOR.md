# 🚀 تثبيت الإضافة في Cursor

## الطريقة الصحيحة لتشغيل الإضافة في Cursor

---

## 📦 الخطوة 1: إنشاء حزمة VSIX

نحتاج أولاً لتحويل المشروع إلى ملف `.vsix` لتثبيته في Cursor:

```bash
cd /Users/muataz/Workspace/VSCode-HTML-Editor-WYSIWYG

# 1. تثبيت أداة التحزيم (إذا لم تكن مثبتة)
npm install -g @vscode/vsce

# 2. التأكد من البناء
npm run build

# 3. إنشاء ملف .vsix
vsce package --no-dependencies
```

سيُنشأ ملف: `vscode-html-wysiwyg-0.0.1.vsix`

---

## 📥 الخطوة 2: تثبيت الإضافة في Cursor

### الطريقة 1: من خلال واجهة Cursor

1. افتح Cursor
2. اضغط `Cmd+Shift+P` (أو `Ctrl+Shift+P`)
3. اكتب: `Extensions: Install from VSIX`
4. اختر الملف: `vscode-html-wysiwyg-0.0.1.vsix`
5. انتظر رسالة التأكيد
6. أعد تشغيل Cursor

### الطريقة 2: من Terminal

```bash
# في Cursor (إذا كان مثبت في PATH)
cursor --install-extension vscode-html-wysiwyg-0.0.1.vsix

# أو إذا كان VS Code مثبت
code --install-extension vscode-html-wysiwyg-0.0.1.vsix
```

---

## ✅ الخطوة 3: التحقق من التثبيت

1. افتح Cursor
2. اضغط `Cmd+Shift+P`
3. اكتب: `wysiwyg`
4. يجب أن يظهر: **WYSIWYG: Open HTML Visual Editor**

---

## 🎯 الخطوة 4: الاستخدام

1. **افتح ملف HTML** في Cursor
2. **اضغط** `Cmd+Shift+P`
3. **اكتب**: `wysiwyg`
4. **اختر**: WYSIWYG: Open HTML Visual Editor
5. **🎉 المحرر سيفتح!**

---

## 🔄 تحديث الإضافة بعد التعديل

إذا عدّلت الكود وتريد تحديث الإضافة:

```bash
# 1. أعد البناء
npm run build

# 2. أعد إنشاء الحزمة
vsce package --no-dependencies

# 3. الغِ تثبيت النسخة القديمة
# في Cursor: Cmd+Shift+P → "Extensions: Uninstall Extension"
# ابحث عن "HTML WYSIWYG Editor" واحذفها

# 4. ثبّت النسخة الجديدة
# Cmd+Shift+P → "Extensions: Install from VSIX"
# اختر الملف الجديد

# 5. أعد تشغيل Cursor
```

---

## 🐛 حل المشاكل

### المشكلة 1: `vsce: command not found`

```bash
# ثبّت vsce عالميًا
npm install -g @vscode/vsce

# تحقق من التثبيت
vsce --version
```

### المشكلة 2: خطأ في التحزيم

```bash
# تأكد من صحة package.json
# يجب أن يحتوي على:
# - "publisher": "muataz"
# - "repository": url أو احذف السطر
# - "icon": path أو احذف السطر

# إذا كانت هناك مشاكل، استخدم:
vsce package --no-dependencies --allow-missing-repository
```

### المشكلة 3: الإضافة لا تظهر في Cursor

```bash
# تحقق من الإضافات المثبتة
# في Cursor: اضغط على أيقونة Extensions في الجانب
# ابحث عن "HTML WYSIWYG"

# إذا لم تجدها، أعد التثبيت
```

### المشكلة 4: الأمر لا يظهر

```bash
# تأكد من:
# 1. فتحت ملف HTML
# 2. أعدت تشغيل Cursor بعد التثبيت
# 3. الإضافة مُفعّلة (Enable في قائمة Extensions)
```

---

## 📝 ملاحظات مهمة

### الفرق بين Development و Production

| الوضع | متى تستخدمه | الطريقة |
|-------|-------------|---------|
| **Development** | عند تطوير الإضافة | F5 في VS Code |
| **Production** | للاستخدام العادي | تثبيت .vsix في Cursor |

### لماذا لا يعمل F5 في Cursor؟

- F5 يفتح **Extension Development Host** - بيئة خاصة بالتطوير
- Cursor قد لا يدعم هذه البيئة بنفس طريقة VS Code
- **الحل**: تثبيت الإضافة كملف .vsix

---

## 🔧 سكربت تلقائي للتحزيم

احفظ هذا في `package-for-cursor.sh`:

```bash
#!/bin/bash

echo "🔧 تحزيم الإضافة لـ Cursor"
echo "=============================="

# 1. نظف البناء القديم
echo "🧹 تنظيف..."
rm -rf dist/
rm -f *.vsix

# 2. أعد البناء
echo "🔨 البناء..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ فشل البناء!"
    exit 1
fi

# 3. أنشئ الحزمة
echo "📦 التحزيم..."
npx vsce package --no-dependencies --allow-missing-repository

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ تم إنشاء الحزمة بنجاح!"
    echo ""
    echo "📝 الخطوات التالية:"
    echo "  1. افتح Cursor"
    echo "  2. Cmd+Shift+P"
    echo "  3. Extensions: Install from VSIX"
    echo "  4. اختر الملف: $(ls -t *.vsix | head -1)"
    echo "  5. أعد تشغيل Cursor"
else
    echo "❌ فشل التحزيم!"
    exit 1
fi
```

شغّله:

```bash
chmod +x package-for-cursor.sh
./package-for-cursor.sh
```

---

## ⚡ الطريقة السريعة (الكل في واحد)

```bash
# تشغيل واحد يفعل كل شيء
npm run build && \
npx vsce package --no-dependencies --allow-missing-repository && \
echo "✅ جاهز! الآن ثبّت الملف في Cursor"
```

---

## 🎯 الخلاصة

### للاستخدام في Cursor

```
1. npx vsce package --no-dependencies
2. في Cursor: Cmd+Shift+P
3. Extensions: Install from VSIX
4. اختر vscode-html-wysiwyg-0.0.1.vsix
5. Restart Cursor
6. افتح ملف HTML
7. Cmd+Shift+P → wysiwyg
8. 🎉 يعمل!
```

### للتطوير (في VS Code فقط)

```
F5 لفتح Extension Development Host
```

---

## 🚀 ابدأ الآن

شغّل هذه الأوامر:

```bash
cd /Users/muataz/Workspace/VSCode-HTML-Editor-WYSIWYG

# إذا لم يكن vsce مثبت
npm install -g @vscode/vsce

# أنشئ الحزمة
npm run build
vsce package --no-dependencies --allow-missing-repository
```

ثم ثبّت الملف `.vsix` في Cursor! 🎉
