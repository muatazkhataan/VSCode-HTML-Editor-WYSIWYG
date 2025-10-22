# دليل محرر الروابط السريع | Quick Link Editor Guide

[العربية](#العربية) | [English](#english)

---

## العربية

### كيفية استخدام محرر الروابط المتقدم

#### 🔗 إضافة رابط جديد

1. **حدد النص** الذي تريد تحويله لرابط
2. **انقر زر الرابط** 🔗 في شريط الأدوات
3. **املأ النموذج**:
   - **عنوان الرابط**: ضع الرابط هنا (مثال: `https://google.com`)
   - **نص الرابط**: النص الذي سيظهر (افتراضياً النص المحدد)
   - **عنوان الرابط**: نص tooltip عند تمرير الماوس (اختياري)
   - **فتح الرابط في**: نافذة جديدة أو نفس النافذة
4. **اضغط Enter** أو انقر "حفظ"

#### ✏️ تحرير رابط موجود

1. **ضع المؤشر** على الرابط الذي تريد تحريره
2. **انقر زر الرابط** 🔗 (سيظهر بلون مميز)
3. **عدّل** أي حقل تريده
4. **احفظ** التغييرات

#### 🗑️ إزالة رابط

1. **ضع المؤشر** على الرابط
2. **انقر زر الرابط** 🔗
3. **انقر زر "إزالة"** الأحمر
4. الرابط سيُحذف والنص سيبقى

#### ⌨️ اختصارات لوحة المفاتيح

- **Enter**: حفظ الرابط
- **Escape**: إلغاء وإغلاق النافذة

### مثال عملي

```html
<!-- قبل -->
<p>اذهب إلى جوجل للبحث</p>

<!-- بعد إضافة الرابط -->
<p>اذهب إلى <a href="https://google.com" target="_blank" title="محرك بحث جوجل">جوجل</a> للبحث</p>
```

### نصائح 💡

- إذا لم تحدد نصاً قبل النقر على زر الرابط، سيتم إنشاء رابط بنص افتراضي
- يمكنك تعديل نص الرابط حتى بعد إنشائه
- استخدم "عنوان الرابط" لإضافة معلومات إضافية تظهر عند تمرير الماوس
- اختر "نافذة جديدة" للروابط الخارجية

---

## English

### How to Use the Advanced Link Editor

#### 🔗 Add a New Link

1. **Select the text** you want to turn into a link
2. **Click the link button** 🔗 in the toolbar
3. **Fill in the form**:
   - **Link URL**: Enter the URL (e.g., `https://google.com`)
   - **Link Text**: The text to display (defaults to selected text)
   - **Link Title**: Tooltip text on hover (optional)
   - **Open Link In**: New window or same window
4. **Press Enter** or click "Save"

#### ✏️ Edit an Existing Link

1. **Place cursor** on the link you want to edit
2. **Click the link button** 🔗 (it will show as active)
3. **Modify** any field you want
4. **Save** the changes

#### 🗑️ Remove a Link

1. **Place cursor** on the link
2. **Click the link button** 🔗
3. **Click the red "Remove" button**
4. Link will be removed, text will remain

#### ⌨️ Keyboard Shortcuts

- **Enter**: Save link
- **Escape**: Cancel and close dialog

### Practical Example

```html
<!-- Before -->
<p>Go to Google to search</p>

<!-- After adding link -->
<p>Go to <a href="https://google.com" target="_blank" title="Google Search Engine">Google</a> to search</p>
```

### Tips 💡

- If you don't select text before clicking the link button, a default text will be used
- You can edit the link text even after creating it
- Use "Link Title" to add extra information that appears on hover
- Choose "New Window" for external links

---

## Test File | ملف الاختبار

Use `test-link-editor.html` to try all features.

استخدم `test-link-editor.html` لتجربة جميع المميزات.

```bash
# In VS Code | في VS Code
1. Open test-link-editor.html
2. Ctrl+Shift+P > "Open HTML Visual Editor"
3. Try adding, editing, and removing links
```

---

## Screenshots | لقطات الشاشة

### Adding a New Link | إضافة رابط جديد
```
┌─────────────────────────────────────┐
│ إضافة رابط جديد                    │
├─────────────────────────────────────┤
│ عنوان الرابط:                      │
│ [https://example.com            ] │
│                                     │
│ نص الرابط:                         │
│ [Example Link                   ] │
│                                     │
│ عنوان الرابط (title):              │
│ [Visit Example                  ] │
│                                     │
│ فتح الرابط في:                     │
│ [نافذة جديدة ▼                  ] │
├─────────────────────────────────────┤
│        [إلغاء]        [حفظ ✓]      │
└─────────────────────────────────────┘
```

### Editing an Existing Link | تحرير رابط موجود
```
┌─────────────────────────────────────┐
│ تحرير الرابط                       │
├─────────────────────────────────────┤
│ عنوان الرابط:                      │
│ [https://google.com             ] │
│                                     │
│ نص الرابط:                         │
│ [Google                         ] │
│                                     │
│ عنوان الرابط (title):              │
│ [Search Engine                  ] │
│                                     │
│ فتح الرابط في:                     │
│ [نافذة جديدة ▼                  ] │
├─────────────────────────────────────┤
│ [إزالة 🗑]   [إلغاء]    [حفظ ✓]   │
└─────────────────────────────────────┘
```

---

**Version**: 0.0.2+  
**Last Updated**: October 22, 2025

