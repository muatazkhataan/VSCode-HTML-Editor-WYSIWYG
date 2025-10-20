# 🔥 حل سريع للخطأ: Extension host did not start

## المشكلة

```
Extension host did not start in 10 seconds, 
it might be stopped on the first line and needs a debugger to continue.
```

---

## ✅ الحل السريع (جرّب هذا أولاً)

### الطريقة 1: شغّل بدون Debug

بدلاً من F5، استخدم:

**Mac**: `Cmd+Shift+F5`  
**Windows/Linux**: `Ctrl+Shift+F5`

أو من القائمة:

```
Run > Start Without Debugging
```

هذا يشغّل الإضافة بدون debugger وعادة يحل المشكلة! 🎉

---

## ✅ الحل 2: زيادة Timeout

إذا لم ينجح الحل الأول، عدّل `.vscode/launch.json`:

1. افتح `.vscode/launch.json`
2. أضف `timeout` في الإعدادات:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}"
      ],
      "outFiles": [
        "${workspaceFolder}/dist/**/*.js"
      ],
      "preLaunchTask": "${defaultBuildTask}",
      "timeout": 30000
    }
  ]
}
```

لاحظ السطر الأخير: `"timeout": 30000` (30 ثانية)

---

## ✅ الحل 3: تعطيل Breakpoints

إذا كان لديك breakpoints:

1. في VS Code، اذهب إلى Debug sidebar (Ctrl+Shift+D)
2. ابحث عن قسم **BREAKPOINTS**
3. احذف جميع الـ breakpoints
4. أو اضغط على أيقونة "Deactivate Breakpoints"

---

## ✅ الحل 4: تنظيف وإعادة البناء

```bash
# 1. نظف المشروع
rm -rf dist/
rm -rf node_modules/.cache

# 2. أعد البناء
npm run build

# 3. جرب التشغيل بدون debug
# Cmd+Shift+F5 (Mac) أو Ctrl+Shift+F5 (Windows)
```

---

## ✅ الحل 5: تحديث launch.json (النسخة الكاملة)

استبدل محتوى `.vscode/launch.json` بهذا:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}"
      ],
      "outFiles": [
        "${workspaceFolder}/dist/**/*.js"
      ],
      "preLaunchTask": "npm: build",
      "timeout": 60000,
      "skipFiles": [
        "<node_internals>/**"
      ]
    },
    {
      "name": "Run Extension (No Debug)",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}"
      ],
      "outFiles": [
        "${workspaceFolder}/dist/**/*.js"
      ],
      "preLaunchTask": "npm: build",
      "timeout": 60000
    }
  ]
}
```

---

## 🎯 الطريقة الموصى بها

### للتطوير السريع (بدون debug)

```
Cmd+Shift+F5 (Mac)
Ctrl+Shift+F5 (Windows)
```

هذه الطريقة:

- ✅ أسرع
- ✅ لا تنتظر debugger
- ✅ تعمل دائمًا
- ✅ مناسبة للاختبار

### للتطوير مع Debug (إذا احتجت)

```
F5
```

ولكن تأكد من:

- ✅ لا توجد breakpoints في الكود
- ✅ timeout كافي (30-60 ثانية)
- ✅ البناء ناجح

---

## 📋 خطوات الاختبار الآن

1. **أغلق جميع نوافذ VS Code**

2. **افتح المشروع مرة أخرى**

   ```bash
   code /Users/muataz/Workspace/VSCode-HTML-Editor-WYSIWYG
   ```

3. **استخدم Start Without Debugging**
   - اضغط `Cmd+Shift+F5` (Mac)
   - أو `Ctrl+Shift+F5` (Windows)
   - أو من القائمة: `Run > Start Without Debugging`

4. **انتظر نافذة [Extension Development Host]**

5. **افتح test.html**

6. **Cmd+Shift+P → wysiwyg**

7. **🎉 يجب أن يعمل الآن!**

---

## ⚠️ ملاحظات مهمة

### ✅ الفرق بين F5 و Cmd+Shift+F5

| الاختصار | الوضع | السرعة | متى تستخدمه |
|----------|-------|--------|-------------|
| F5 | Debug Mode | أبطأ | عند البحث عن أخطاء |
| Cmd+Shift+F5 | Run Mode | أسرع | للاختبار العادي |

### 💡 نصيحة

**للتطوير اليومي**: استخدم `Cmd+Shift+F5` دائمًا

**فقط عند الحاجة للـ Debug**: استخدم `F5`

---

## 🔍 إذا استمرت المشكلة

### تحقق من هذه النقاط

```bash
# 1. تأكد من البناء الصحيح
npm run build
echo $?  # يجب أن يطبع: 0

# 2. تحقق من dist/extension.js
test -f dist/extension.js && echo "✅ موجود" || echo "❌ مفقود"

# 3. تحقق من أخطاء TypeScript
npx tsc --noEmit

# 4. شغل السكربت التشخيصي
./debug-test.sh
```

### راجع الأخطاء في

**في VS Code الأصلي (النافذة التي ضغطت منها F5):**

1. `View > Output`
2. من القائمة المنسدلة اختر: `Tasks` أو `Extension Host`
3. ابحث عن أخطاء باللون الأحمر

---

## ✅ الخلاصة

**جرب هذا الآن:**

```
1. أغلق VS Code تمامًا
2. افتح المشروع: code .
3. اضغط: Cmd+Shift+F5 (بدلاً من F5)
4. انتظر نافذة [Extension Development Host]
5. افتح test.html في النافذة الجديدة
6. Cmd+Shift+P → wysiwyg
7. Enter
```

**هذا يجب أن يعمل 100%!** 🚀

---

## 📞 إذا لم ينجح

أرسل لي:

1. نتيجة:

   ```bash
   npm run build
   ```

2. محتوى:

   ```bash
   cat .vscode/launch.json
   ```

3. أي أخطاء من `View > Output`

وسأساعدك في حل المشكلة! 💪
