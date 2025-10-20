#!/bin/bash

# إنشاء أيقونة SVG بسيطة ثم تحويلها لـ PNG

cat > icon.svg << 'EOF'
<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
  <!-- خلفية -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#007acc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0066b8;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="256" height="256" fill="url(#grad)" rx="32"/>
  
  <!-- رمز HTML -->
  <text x="128" y="100" font-family="monospace" font-size="70" font-weight="bold" 
        fill="white" text-anchor="middle" dominant-baseline="middle">&lt;/&gt;</text>
  
  <!-- رمز القلم -->
  <text x="128" y="180" font-family="sans-serif" font-size="50" 
        fill="white" text-anchor="middle" dominant-baseline="middle">✏️</text>
</svg>
EOF

echo "✅ تم إنشاء icon.svg"
echo ""
echo "لتحويلها إلى PNG، استخدم إحدى هذه الطرق:"
echo ""
echo "1. أونلاين: افتح https://svgtopng.com وحمّل icon.svg"
echo "2. أو استخدم: convert icon.svg -resize 256x256 icon.png (يتطلب ImageMagick)"
echo "3. أو افتح icon.svg في متصفح واحفظها كـ PNG"

