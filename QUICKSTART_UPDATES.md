# 🚀 دليل البدء السريع | Quick Start Guide

[العربية](#العربية) | [English](#english)

---

## العربية

### التحديثات الجديدة في نظرة سريعة

تم إضافة **3 مميزات جديدة** قوية للمحرر:

#### 1. محرر روابط محترف 🔗
**الاستخدام**: حدد نص → انقر 🔗 → املأ النموذج → Enter

#### 2. منع فتح الروابط 🚫
**الفائدة**: انقر على أي رابط بأمان دون فتحه في المتصفح

#### 3. وضع التمييز ✨
**الاستخدام**: انقر 🖍️ (أول زر) → شاهد جميع العناصر مميزة

---

### 📝 البدء السريع

#### الخطوة 1: فتح المحرر
```
1. افتح ملف HTML في VS Code
2. Ctrl+Shift+P
3. اكتب: "Open HTML Visual Editor"
4. أو انقر أيقونة 👁️ في شريط العنوان
```

#### الخطوة 2: تجربة محرر الروابط
```
1. حدد أي نص
2. انقر زر 🔗 في شريط الأدوات
3. أدخل الرابط: https://example.com
4. عدّل النص إذا أردت
5. اختر "نافذة جديدة" أو "نفس النافذة"
6. اضغط Enter للحفظ
```

#### الخطوة 3: تحرير رابط موجود
```
1. ضع المؤشر على أي رابط
2. انقر زر 🔗 (سيظهر باللون الأزرق)
3. عدّل أي حقل
4. احفظ أو احذف الرابط
```

#### الخطوة 4: تفعيل وضع التمييز
```
1. انقر زر 🖍️ (أول زر في الأدوات)
2. شاهد العناوين بألوان مختلفة
3. لاحظ الروابط مع أيقونة 🔗
4. مرر الماوس على أي عنصر
5. انقر الزر مرة أخرى للإلغاء
```

---

### 🧪 ملفات الاختبار

#### اختبار محرر الروابط
```
1. افتح: test-link-editor.html
2. جرب إضافة روابط جديدة
3. جرب تحرير الروابط الموجودة
4. جرب حذف الروابط
```

#### اختبار وضع التمييز
```
1. افتح: test-highlight-mode.html
2. فعّل زر التمييز 🖍️
3. لاحظ الألوان المختلفة
4. مرر على العناصر
```

---

### ⌨️ اختصارات لوحة المفاتيح

#### محرر الروابط
- **Enter**: حفظ الرابط
- **Escape**: إلغاء وإغلاق النافذة

#### عامة
- **Ctrl+Shift+V**: فتح المحرر المرئي
- **Ctrl+B**: عريض
- **Ctrl+I**: مائل
- **Ctrl+U**: تسطير

---

### 💡 نصائح سريعة

1. ✅ **استخدم التمييز** عند تحرير مستندات كبيرة
2. ✅ **محرر الروابط** يحفظ آخر موضع المؤشر
3. ✅ **انقر على الروابط بأمان** - لن تفتح في المتصفح
4. ✅ **اختصارات لوحة المفاتيح** توفر الوقت

---

### ❓ حل المشاكل السريع

**المشكلة**: زر التمييز لا يظهر
```
الحل: أعد بناء الإضافة
> npm run build
> أعد تحميل VS Code
```

**المشكلة**: محرر الروابط لا يفتح
```
الحل: تأكد من تحديث webview.js
> تحقق من وجود دالة execCreateLinkCommand
```

**المشكلة**: الروابط تفتح في المتصفح
```
الحل: معالج منع النقر موجود في webview.js
> ابحث عن: editor.addEventListener('click'
```

---

## English

### New Updates at a Glance

**3 powerful new features** added:

#### 1. Professional Link Editor 🔗
**Usage**: Select text → Click 🔗 → Fill form → Enter

#### 2. Prevent Link Navigation 🚫
**Benefit**: Click any link safely without opening it

#### 3. Highlight Mode ✨
**Usage**: Click 🖍️ (first button) → See all elements highlighted

---

### 📝 Quick Start

#### Step 1: Open Editor
```
1. Open HTML file in VS Code
2. Ctrl+Shift+P
3. Type: "Open HTML Visual Editor"
4. Or click 👁️ icon in title bar
```

#### Step 2: Try Link Editor
```
1. Select any text
2. Click 🔗 button in toolbar
3. Enter URL: https://example.com
4. Modify text if needed
5. Choose "New Window" or "Same Window"
6. Press Enter to save
```

#### Step 3: Edit Existing Link
```
1. Place cursor on any link
2. Click 🔗 button (will show blue)
3. Modify any field
4. Save or remove link
```

#### Step 4: Enable Highlight Mode
```
1. Click 🖍️ button (first in toolbar)
2. See headings with different colors
3. Notice links with 🔗 icon
4. Hover over any element
5. Click again to toggle off
```

---

### 🧪 Test Files

#### Test Link Editor
```
1. Open: test-link-editor.html
2. Try adding new links
3. Try editing existing links
4. Try removing links
```

#### Test Highlight Mode
```
1. Open: test-highlight-mode.html
2. Enable highlight button 🖍️
3. Notice different colors
4. Hover over elements
```

---

### ⌨️ Keyboard Shortcuts

#### Link Editor
- **Enter**: Save link
- **Escape**: Cancel and close dialog

#### General
- **Ctrl+Shift+V**: Open visual editor
- **Ctrl+B**: Bold
- **Ctrl+I**: Italic
- **Ctrl+U**: Underline

---

### 💡 Quick Tips

1. ✅ **Use highlight mode** when editing large documents
2. ✅ **Link editor** preserves cursor position
3. ✅ **Click links safely** - won't open in browser
4. ✅ **Keyboard shortcuts** save time

---

### ❓ Quick Troubleshooting

**Issue**: Highlight button not showing
```
Solution: Rebuild extension
> npm run build
> Reload VS Code
```

**Issue**: Link editor not opening
```
Solution: Verify webview.js is updated
> Check for execCreateLinkCommand function
```

**Issue**: Links open in browser
```
Solution: Click handler exists in webview.js
> Search for: editor.addEventListener('click'
```

---

## Visual Guide | دليل مرئي

### Link Editor Dialog | نافذة محرر الروابط

```
┌─────────────────────────────────────┐
│ Add New Link | إضافة رابط جديد      │
├─────────────────────────────────────┤
│ Link URL | عنوان الرابط:           │
│ [https://example.com            ] │
│                                     │
│ Link Text | نص الرابط:             │
│ [Example Link                   ] │
│                                     │
│ Link Title | عنوان الرابط:         │
│ [Visit Example                  ] │
│                                     │
│ Open in | فتح الرابط في:            │
│ [New Window ▼                   ] │
├─────────────────────────────────────┤
│        [Cancel | إلغاء]   [Save ✓] │
└─────────────────────────────────────┘
```

### Highlight Mode Examples | أمثلة وضع التمييز

```
H1 │ Heading 1 - Light Blue      │
H2 │ Heading 2 - Teal            │
H3 │ Heading 3 - Green           │

🔗 │ Link with icon              │

┌─────┬─────┬─────┐
│  H  │  H  │  H  │ Table with borders
├─────┼─────┼─────┤
│  D  │  D  │  D  │
└─────┴─────┴─────┘

• List item with background
• Another list item
```

---

## One-Minute Demo | عرض دقيقة واحدة

### 60 seconds to see everything:

```
[0:00] Open test-link-editor.html
[0:05] Ctrl+Shift+P > "Open HTML Visual Editor"
[0:10] Click 🖍️ - See highlight mode
[0:20] Select text
[0:25] Click 🔗
[0:30] Fill form
[0:35] Press Enter - Link created!
[0:40] Click on link
[0:45] Click 🔗 again
[0:50] Modify or remove
[0:55] Click 🖍️ to toggle off
[1:00] Done! ✅
```

---

## Summary | الملخص

### What You Get | ما ستحصل عليه

| Feature | Status | Time to Learn |
|---------|--------|---------------|
| Link Editor | ✅ Ready | 1 min |
| No Link Opening | ✅ Ready | Automatic |
| Highlight Mode | ✅ Ready | 30 sec |

### Files to Explore | ملفات للاستكشاف

```
📄 test-link-editor.html        - Try link editor
📄 test-highlight-mode.html     - Try highlight mode
📚 LINK_EDITOR_GUIDE.md         - Full guide
📚 RECENT_UPDATES.md            - All updates
```

---

**Ready? Let's Go! | جاهز؟ هيا نبدأ!** 🚀

---

**Version**: 0.0.2+  
**Date**: October 22, 2025  
**Status**: Production Ready ✅

