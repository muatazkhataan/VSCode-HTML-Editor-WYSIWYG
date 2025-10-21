@echo off
chcp 65001 > nul
echo ============================================
echo بناء حزمة VSIX لامتداد HTML WYSIWYG
echo ============================================
echo.

REM التحقق من وجود Node.js
echo [1/6] التحقق من وجود Node.js...
where node > nul 2>&1
if errorlevel 1 (
    echo ❌ خطأ: Node.js غير مثبت!
    echo يرجى تثبيت Node.js من: https://nodejs.org/
    goto :error
)
node --version
echo ✅ Node.js مثبت
echo.

REM التحقق من وجود npm
echo [2/6] التحقق من وجود npm...
where npm > nul 2>&1
if errorlevel 1 (
    echo ❌ خطأ: npm غير مثبت!
    goto :error
)
npm --version
echo ✅ npm مثبت
echo.

REM التحقق من وجود التبعيات المحلية
echo [3/6] التحقق من تبعيات المشروع...
if not exist "node_modules\" (
    echo ⚠️  التبعيات غير مثبتة، جاري التثبيت...
    npm install
    if errorlevel 1 (
        echo ❌ خطأ في تثبيت التبعيات!
        goto :error
    )
    echo ✅ تم تثبيت التبعيات بنجاح
) else (
    echo ✅ التبعيات مثبتة بالفعل
)
echo.

REM التحقق من وجود vsce
echo [4/6] التحقق من وجود vsce...
where vsce > nul 2>&1
if errorlevel 1 (
    echo ⚠️  vsce غير مثبت، جاري التثبيت...
    npm install -g @vscode/vsce
    if errorlevel 1 (
        echo ❌ خطأ في تثبيت vsce!
        goto :error
    )
    echo ✅ تم تثبيت vsce بنجاح
) else (
    vsce --version
    echo ✅ vsce مثبت
)
echo.

REM بناء المشروع
echo [5/6] بناء المشروع...
npm run build
if errorlevel 1 (
    echo ❌ خطأ في بناء المشروع!
    goto :error
)
echo ✅ تم بناء المشروع بنجاح
echo.

REM حذف ملف VSIX القديم إن وجد
if exist "vscode-html-wysiwyg-*.vsix" (
    echo 🗑️  حذف ملف VSIX القديم...
    del /q vscode-html-wysiwyg-*.vsix
)

REM بناء حزمة VSIX
echo [6/6] بناء حزمة VSIX...
vsce package
if errorlevel 1 (
    echo ❌ خطأ في بناء حزمة VSIX!
    goto :error
)
echo.

REM عرض النتيجة النهائية
echo ============================================
echo ✅ تم بناء الحزمة بنجاح!
echo ============================================
echo.

if exist "vscode-html-wysiwyg-*.vsix" (
    for %%f in (vscode-html-wysiwyg-*.vsix) do (
        echo 📦 الملف: %%f
        echo 📍 المسار: %CD%\%%f
        echo.
        echo لتثبيت الامتداد:
        echo   VS Code:  code --install-extension "%%f"
        echo   Cursor:   cursor --install-extension "%%f"
    )
)
echo.
echo ============================================

if not "%1"=="--no-pause" (
    pause
)
exit /b 0

:error
echo.
echo ============================================
echo ❌ فشل بناء الحزمة!
echo ============================================
if not "%1"=="--no-pause" (
    pause
)
exit /b 1
