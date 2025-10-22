# سجل التغييرات - محرر الروابط | Changelog - Link Editor

## [التحديث الحالي | Current Update] - 2025-10-22

### ✨ إضافات جديدة | New Features

#### 1. محرر روابط متقدم | Advanced Link Editor
- **نافذة حوار احترافية** بتصميم عصري يتناسق مع VS Code
- **Professional dialog window** with modern design matching VS Code theme

#### 2. خيارات متقدمة | Advanced Options
- ✅ عنوان الرابط (URL) | Link URL
- ✅ نص الرابط (قابل للتعديل) | Link text (editable)
- ✅ عنوان tooltip | Tooltip title
- ✅ Target (نافذة جديدة/_blank أو نفس النافذة/_self) | Target (new window or same)

#### 3. تحرير الروابط الموجودة | Edit Existing Links
- إمكانية النقر على رابط موجود لتحريره
- Ability to click existing links to edit them
- جميع القيم تظهر تلقائياً
- All values auto-populated

#### 4. إزالة الروابط | Remove Links
- زر أحمر لإزالة الرابط مع الحفاظ على النص
- Red button to remove link while keeping text
- عملية unlink بنقرة واحدة
- One-click unlink operation

#### 5. اختصارات لوحة المفاتيح | Keyboard Shortcuts
- **Enter**: حفظ الرابط | Save link
- **Escape**: إلغاء وإغلاق | Cancel and close

#### 6. حالة نشطة في الأدوات | Active State in Toolbar
- زر الرابط يظهر بحالة active عندما يكون المؤشر على رابط
- Link button shows active state when cursor is on a link

### 📝 الملفات المعدلة | Modified Files

#### `media/webview.js`
```diff
+ // فئة لحفظ واستعادة موضع المؤشر
+ class CaretPosition {
+     static savedRange = null;
+     static save() { ... }
+     static restore() { ... }
+ }

+ // دالة لإنشاء/تحرير الرابط
+ function execCreateLinkCommand() {
+     // ~200 سطر من الكود المتقدم
+ }

  async function handleToolbarCommand(command) {
      switch (command) {
          case 'createLink':
-             const url = prompt('أدخل الرابط:', 'https://');
-             if (url) document.execCommand('createLink', false, url);
+             execCreateLinkCommand();
              break;
      }
  }

  function updateToolbarState() {
      // ...
+     case 'createLink':
+         // التحقق إذا كان المؤشر على رابط
+         const sel = window.getSelection();
+         if (sel.rangeCount > 0) {
+             let node = sel.getRangeAt(0).commonAncestorContainer;
+             if (node.nodeType === 3) node = node.parentElement;
+             isActive = node.closest('a') !== null;
+         }
+         break;
  }
```

**الإحصائيات:**
- إضافة: ~210 أسطر
- حذف: 2 أسطر
- تعديل: 1 دالة

#### `media/styles.css`
```diff
+ /* نافذة حوار الروابط */
+ .link-dialog { ... }
+ .link-dialog-content { ... }
+ .form-content { ... }
+ .mb-3 { ... }
+ .form-label { ... }
+ .form-control { ... }
+ .form-select { ... }
+ .dialog-footer { ... }
+ .btn { ... }
+ .btn-primary { ... }
+ .btn-secondary { ... }
+ .btn-danger { ... }
```

**الإحصائيات:**
- إضافة: ~120 أسطر من CSS
- تصميم كامل RTL

### 📁 ملفات جديدة | New Files

1. **test-link-editor.html**
   - ملف اختبار كامل مع أمثلة
   - Complete test file with examples
   - أمثلة على روابط موجودة وجديدة
   - Examples of existing and new links

2. **_md/محرر_الروابط_المتقدم.md**
   - وثائق تقنية كاملة بالعربية
   - Complete technical documentation in Arabic
   - تفاصيل التنفيذ والاستخدام
   - Implementation and usage details

3. **_md/تحديث_محرر_الروابط.md**
   - ملخص التحديث بالعربية
   - Update summary in Arabic
   - مقارنة قبل وبعد
   - Before/after comparison

4. **_md/LINK_EDITOR_UPDATE.md**
   - وثائق التحديث بالإنجليزية
   - Update documentation in English
   - تفاصيل تقنية وأمثلة
   - Technical details and examples

5. **LINK_EDITOR_GUIDE.md**
   - دليل استخدام سريع (عربي + إنجليزي)
   - Quick usage guide (Arabic + English)
   - أمثلة عملية
   - Practical examples

6. **_md/CHANGELOG_LINK_EDITOR.md**
   - هذا الملف
   - This file

### 🔧 التحسينات التقنية | Technical Improvements

#### إدارة المؤشر | Cursor Management
```javascript
// حفظ واستعادة موقع المؤشر
CaretPosition.save();    // حفظ الموضع
CaretPosition.restore(); // استعادة الموضع
```

#### معالجة الأحداث | Event Handling
- معالج Escape لإغلاق النافذة
- معالج Enter لحفظ الرابط
- معالج النقر للأزرار الثلاثة (حفظ، إلغاء، إزالة)

#### تحسين UX | UX Improvements
- التركيز التلقائي على حقل URL
- تحديد النص التلقائي في حقل URL
- تنظيف الـ event listeners عند إغلاق النافذة
- حالة active في شريط الأدوات

### 📊 الإحصائيات | Statistics

| البند | القيمة |
|------|--------|
| أسطر كود JavaScript مضافة | ~210 |
| أسطر CSS مضافة | ~120 |
| ملفات معدلة | 2 |
| ملفات جديدة | 6 |
| مميزات جديدة | 6 |
| دعم اختصارات لوحة المفاتيح | 2 |

### ✅ الاختبارات | Testing

- ✅ إضافة رابط جديد على نص محدد
- ✅ إضافة رابط جديد بدون تحديد نص
- ✅ تحرير رابط موجود
- ✅ تغيير نص الرابط
- ✅ إضافة وتعديل title
- ✅ تغيير target
- ✅ إزالة رابط مع الحفاظ على النص
- ✅ اختصارات لوحة المفاتيح (Enter, Escape)
- ✅ حالة active في شريط الأدوات
- ✅ البناء بدون أخطاء

### 🚀 الأداء | Performance

- حجم bundle الجديد: **13.2kb** (لم يتغير كثيراً)
- وقت البناء: **2ms**
- لا تأثير على أداء المحرر
- النافذة تُنشأ وتُحذف ديناميكياً

### 🔜 تحسينات مستقبلية | Future Enhancements

- [ ] دعم روابط البريد الإلكتروني (mailto:)
- [ ] دعم روابط الهاتف (tel:)
- [ ] معاينة الرابط قبل الحفظ
- [ ] تاريخ الروابط المستخدمة مؤخراً
- [ ] اقتراحات تلقائية للروابط
- [ ] التحقق من صحة URL
- [ ] دعم rel attributes (nofollow, noopener, noreferrer)
- [ ] نسخ الرابط إلى الحافظة
- [ ] معاينة الصفحة المستهدفة (preview)

### 📝 ملاحظات المطورين | Developer Notes

#### الاستخدام في المشاريع الأخرى
هذا الكود يمكن استخدامه في أي محرر contenteditable:

```javascript
// 1. انسخ فئة CaretPosition
class CaretPosition { ... }

// 2. انسخ دالة execCreateLinkCommand
function execCreateLinkCommand() { ... }

// 3. أضف CSS من styles.css
.link-dialog { ... }

// 4. استخدم في معالج الأحداث
button.onclick = () => execCreateLinkCommand();
```

#### التخصيص
يمكن تخصيص النافذة بسهولة:

```javascript
// إضافة حقل جديد
<input type="text" class="form-control" id="link-class" value="">

// قراءة القيمة
const className = document.getElementById('link-class').value;

// تطبيقها
newLink.className = className;
```

### 🐛 المشاكل المعروفة | Known Issues

لا توجد مشاكل معروفة حالياً.

### 📚 الموارد | Resources

- [MDN - Selection API](https://developer.mozilla.org/en-US/docs/Web/API/Selection)
- [MDN - Range API](https://developer.mozilla.org/en-US/docs/Web/API/Range)
- [MDN - contenteditable](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable)
- [MDN - execCommand](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand)

---

## [النسخة السابقة | Previous Version] - قبل 2025-10-22

### محرر الروابط البسيط | Simple Link Editor
- استخدام `prompt()` البسيط
- إدخال URL فقط
- لا يمكن تحرير الروابط الموجودة
- لا يمكن تخصيص target أو title

---

**المؤلف | Author**: Muataz  
**التاريخ | Date**: 22 أكتوبر 2025  
**الإصدار | Version**: 0.0.2+  
**الحالة | Status**: مستقر | Stable ✅

