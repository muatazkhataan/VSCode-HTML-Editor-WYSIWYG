# دليل بناء المشروع
# Build Guide

## نظرة عامة | Overview

هذا الدليل يشرح كيفية بناء حزمة VSIX لامتداد HTML WYSIWYG Editor.

This guide explains how to build the VSIX package for the HTML WYSIWYG Editor extension.

---

## المتطلبات | Requirements

قبل البدء، تأكد من تثبيت الأدوات التالية:

Before starting, make sure you have the following tools installed:

- **Node.js** (v16 أو أحدث | v16 or newer)
  - تحميل من | Download from: https://nodejs.org/
- **npm** (يأتي مع Node.js | comes with Node.js)
- **@vscode/vsce** (سيتم تثبيته تلقائياً إذا لم يكن موجوداً | will be installed automatically if not present)

---

## طرق البناء | Build Methods

### 1. استخدام PowerShell Script (موصى به لـ Windows)
### Using PowerShell Script (Recommended for Windows)

```powershell
.\build-vsix.ps1
```

**المميزات | Features:**
- ✅ تحقق تلقائي من جميع المتطلبات | Automatic verification of all requirements
- ✅ تثبيت تلقائي للأدوات المفقودة | Automatic installation of missing tools
- ✅ بناء المشروع وحزم VSIX | Builds project and VSIX package
- ✅ عرض تفصيلي للنتائج | Detailed results display
- ✅ رسائل ملونة واضحة | Clear colored messages

---

### 2. استخدام Batch File (بديل لـ Windows)
### Using Batch File (Alternative for Windows)

```cmd
build-vsix.bat
```

**ملاحظة | Note:** 
قد لا يعرض البرنامج النصي Batch جميع الرسائل بشكل صحيح عند تشغيله من PowerShell. يُفضل تشغيله من Command Prompt مباشرة.

The Batch script may not display all messages correctly when run from PowerShell. It's better to run it from Command Prompt directly.

---

### 3. البناء اليدوي | Manual Build

إذا كنت تفضل البناء اليدوي، اتبع الخطوات التالية:

If you prefer manual building, follow these steps:

```bash
# 1. تثبيت التبعيات | Install dependencies
npm install

# 2. بناء المشروع | Build project
npm run build

# 3. تثبيت vsce (إذا لم يكن مثبتاً) | Install vsce (if not installed)
npm install -g @vscode/vsce

# 4. بناء حزمة VSIX | Build VSIX package
vsce package
```

---

## الملفات الناتجة | Output Files

بعد البناء الناجح، ستجد:

After successful build, you will find:

- 📦 **vscode-html-wysiwyg-0.0.1.vsix** - ملف الحزمة الجاهز للتثبيت | Package file ready for installation
- 📁 **dist/** - المجلد الذي يحتوي على الكود المجمّع | Folder containing compiled code
  - **extension.js** - ملف الامتداد المجمّع | Compiled extension file

---

## تثبيت الامتداد | Installing the Extension

بعد بناء الحزمة، يمكنك تثبيتها بإحدى الطرق التالية:

After building the package, you can install it using one of the following methods:

### في VS Code | In VS Code:
```bash
code --install-extension vscode-html-wysiwyg-0.0.1.vsix
```

### في Cursor | In Cursor:
```bash
cursor --install-extension vscode-html-wysiwyg-0.0.1.vsix
```

### عبر الواجهة الرسومية | Via GUI:
1. افتح VS Code أو Cursor | Open VS Code or Cursor
2. اذهب إلى Extensions (Ctrl+Shift+X) | Go to Extensions (Ctrl+Shift+X)
3. انقر على "..." في الأعلى | Click "..." at the top
4. اختر "Install from VSIX..." | Choose "Install from VSIX..."
5. حدد ملف vscode-html-wysiwyg-0.0.1.vsix | Select the vscode-html-wysiwyg-0.0.1.vsix file

---

## استكشاف الأخطاء | Troubleshooting

### مشكلة: "Node.js not found"
**الحل | Solution:**
- تأكد من تثبيت Node.js | Make sure Node.js is installed
- أعد تشغيل Terminal بعد التثبيت | Restart Terminal after installation

### مشكلة: "vsce not found"
**الحل | Solution:**
```bash
npm install -g @vscode/vsce
```

### مشكلة: "Permission denied"
**الحل | Solution:**
- قم بتشغيل Terminal كمسؤول | Run Terminal as Administrator
- أو استخدم | Or use:
```bash
npm install -g @vscode/vsce --force
```

### مشكلة: "Build failed"
**الحل | Solution:**
1. احذف مجلد node_modules | Delete node_modules folder
```bash
rmdir /s /q node_modules     # Windows CMD
rm -rf node_modules          # PowerShell/Linux/Mac
```

2. أعد تثبيت التبعيات | Reinstall dependencies
```bash
npm install
```

3. حاول البناء مرة أخرى | Try building again
```bash
npm run build
```

---

## معلومات إضافية | Additional Information

### حجم الحزمة | Package Size
- الحجم الحالي | Current size: ~1.06 MB
- السبب الرئيسي | Main reason: ملف الأيقونة (icon.png) حجمه 1.03 MB | icon.png file is 1.03 MB

### تحسين الحجم | Size Optimization
إذا كنت ترغب في تقليل حجم الحزمة:

If you want to reduce the package size:
- قم بضغط ملف الأيقونة | Compress the icon file
- أو استخدم أيقونة أصغر | Or use a smaller icon

### البناء للنشر | Building for Publishing
إذا كنت تريد نشر الامتداد على VS Code Marketplace:

If you want to publish the extension to VS Code Marketplace:
```bash
vsce publish
```

---

## الدعم | Support

للمزيد من المعلومات، راجع:

For more information, see:
- [README.md](README.md)
- [INSTALL_IN_CURSOR.md](INSTALL_IN_CURSOR.md)
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

**تم إنشاء البرامج النصية | Scripts Created:**
- ✅ `build-vsix.ps1` - PowerShell script (موصى به | Recommended)
- ✅ `build-vsix.bat` - Batch script (بديل | Alternative)

