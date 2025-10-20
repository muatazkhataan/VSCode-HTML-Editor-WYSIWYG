#!/bin/bash

echo "🔍 تشخيص شامل لمشروع VS Code HTML WYSIWYG"
echo "================================================"

cd /Users/muataz/Workspace/VSCode-HTML-Editor-WYSIWYG

echo ""
echo "✅ الخطوة 1: التحقق من البنية الأساسية"
echo "----------------------------------------"
test -d vendor/ckeditor && echo "✅ vendor/ckeditor موجود" || echo "❌ vendor/ckeditor مفقود"
test -d media && echo "✅ media موجود" || echo "❌ media مفقود"
test -d dist && echo "✅ dist موجود" || echo "❌ dist مفقود"
test -d src && echo "✅ src موجود" || echo "❌ src مفقود"

echo ""
echo "✅ الخطوة 2: التحقق من الملفات الحرجة"
echo "----------------------------------------"
test -f dist/extension.js && echo "✅ dist/extension.js موجود" || echo "❌ dist/extension.js مفقود - قم بـ: npm run build"
test -f vendor/ckeditor/ckeditor.js && echo "✅ vendor/ckeditor/ckeditor.js موجود" || echo "❌ vendor/ckeditor/ckeditor.js مفقود"
test -f media/webview.js && echo "✅ media/webview.js موجود" || echo "❌ media/webview.js مفقود"
test -f media/styles.css && echo "✅ media/styles.css موجود" || echo "❌ media/styles.css مفقود"
test -f src/extension.ts && echo "✅ src/extension.ts موجود" || echo "❌ src/extension.ts مفقود"
test -f test.html && echo "✅ test.html موجود" || echo "❌ test.html مفقود"
test -f package.json && echo "✅ package.json موجود" || echo "❌ package.json مفقود"

echo ""
echo "✅ الخطوة 3: التحقق من CKEditor"
echo "----------------------------------------"
test -f vendor/ckeditor/lang/ar.js && echo "✅ اللغة العربية (ar.js) موجودة" || echo "⚠️  اللغة العربية مفقودة"
test -d vendor/ckeditor/plugins && echo "✅ plugins موجود" || echo "❌ plugins مفقود"
test -d vendor/ckeditor/skins && echo "✅ skins موجود" || echo "❌ skins مفقود"

echo ""
echo "✅ الخطوة 4: التحقق من package.json"
echo "----------------------------------------"
grep -q "wysiwyg.open" package.json && echo "✅ الأمر wysiwyg.open مُسجّل" || echo "❌ الأمر غير مُسجّل"
grep -q '"main": "./dist/extension.js"' package.json && echo "✅ main يُشير لـ dist/extension.js" || echo "❌ main خاطئ"
grep -q '"activationEvents"' package.json && echo "✅ activationEvents موجود" || echo "❌ activationEvents مفقود"

echo ""
echo "✅ الخطوة 5: حجم الملفات"
echo "----------------------------------------"
if [ -f dist/extension.js ]; then
    SIZE=$(ls -lh dist/extension.js | awk '{print $5}')
    echo "📦 dist/extension.js: $SIZE"
else
    echo "❌ dist/extension.js غير موجود"
fi

if [ -f vendor/ckeditor/ckeditor.js ]; then
    SIZE=$(ls -lh vendor/ckeditor/ckeditor.js | awk '{print $5}')
    echo "📦 vendor/ckeditor/ckeditor.js: $SIZE"
else
    echo "❌ vendor/ckeditor/ckeditor.js غير موجود"
fi

echo ""
echo "✅ الخطوة 6: التحقق من node_modules"
echo "----------------------------------------"
test -d node_modules && echo "✅ node_modules موجود" || echo "❌ node_modules مفقود - قم بـ: npm install"
test -d node_modules/@types/vscode && echo "✅ @types/vscode مثبت" || echo "❌ @types/vscode مفقود"
test -d node_modules/ckeditor4 && echo "✅ ckeditor4 مثبت" || echo "❌ ckeditor4 مفقود"

echo ""
echo "✅ الخطوة 7: اختبار البناء"
echo "----------------------------------------"
echo "⏳ جاري تشغيل npm run build..."
npm run build > /tmp/build-output.txt 2>&1
if [ $? -eq 0 ]; then
    echo "✅ البناء نجح"
else
    echo "❌ البناء فشل"
    echo "الأخطاء:"
    cat /tmp/build-output.txt
fi

echo ""
echo "================================================"
echo "📊 النتيجة النهائية"
echo "================================================"

# عد النقاط الناجحة
CHECKS=0
PASSED=0

# تحقق من الملفات الأساسية
for file in "dist/extension.js" "vendor/ckeditor/ckeditor.js" "media/webview.js" "src/extension.ts"; do
    CHECKS=$((CHECKS + 1))
    test -f "$file" && PASSED=$((PASSED + 1))
done

echo ""
echo "✅ نسبة النجاح: $PASSED/$CHECKS"

if [ $PASSED -eq $CHECKS ]; then
    echo ""
    echo "🎉 جميع الفحوصات نجحت!"
    echo ""
    echo "📝 خطوات التشغيل:"
    echo "   1. افتح المشروع في VS Code"
    echo "   2. اضغط F5"
    echo "   3. في النافذة الجديدة [Extension Development Host]:"
    echo "      - افتح test.html"
    echo "      - اضغط Cmd+Shift+P"
    echo "      - اكتب: wysiwyg"
    echo "      - اختر: WYSIWYG: Open HTML Visual Editor"
else
    echo ""
    echo "⚠️  توجد مشاكل تحتاج للإصلاح!"
    echo ""
    echo "🔧 قم بالتالي:"
    
    if [ ! -f dist/extension.js ]; then
        echo "   1. npm run build"
    fi
    
    if [ ! -f vendor/ckeditor/ckeditor.js ]; then
        echo "   2. npm install"
        echo "   3. cp -r node_modules/ckeditor4/* vendor/ckeditor/"
    fi
fi

echo ""
echo "================================================"

