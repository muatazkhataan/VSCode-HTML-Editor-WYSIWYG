# Build VSIX Package Script
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Building VSIX Package for HTML WYSIWYG Extension" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "[1/6] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Node.js installed: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not installed"
    }
} catch {
    Write-Host "[ERROR] Node.js not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Check npm
Write-Host "[2/6] Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] npm installed: $npmVersion" -ForegroundColor Green
    } else {
        throw "npm not installed"
    }
} catch {
    Write-Host "[ERROR] npm not installed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check node_modules
Write-Host "[3/6] Checking project dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Dependencies not installed, installing..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "[OK] Dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Check vsce
Write-Host "[4/6] Checking vsce..." -ForegroundColor Yellow
try {
    $vsceVersion = vsce --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] vsce installed: $vsceVersion" -ForegroundColor Green
    } else {
        throw "vsce not installed"
    }
} catch {
    Write-Host "[INFO] vsce not installed, installing..." -ForegroundColor Yellow
    npm install -g @vscode/vsce
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install vsce!" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] vsce installed successfully" -ForegroundColor Green
}
Write-Host ""

# Build project
Write-Host "[5/6] Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to build project!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Project built successfully" -ForegroundColor Green
Write-Host ""

# Remove old VSIX
$oldVsix = Get-Item "vscode-html-wysiwyg-*.vsix" -ErrorAction SilentlyContinue
if ($oldVsix) {
    Write-Host "[INFO] Removing old VSIX file..." -ForegroundColor Yellow
    Remove-Item "vscode-html-wysiwyg-*.vsix" -Force
}

# Package VSIX
Write-Host "[6/6] Building VSIX package..." -ForegroundColor Yellow
vsce package
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to build VSIX package!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Show results
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Package built successfully!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$vsixFile = Get-Item "vscode-html-wysiwyg-*.vsix" -ErrorAction SilentlyContinue
if ($vsixFile) {
    Write-Host "Package: $($vsixFile.Name)" -ForegroundColor White
    $sizeKB = [math]::Round($vsixFile.Length / 1KB, 2)
    $sizeMB = [math]::Round($vsixFile.Length / 1MB, 2)
    Write-Host "Size: $sizeMB MB ($sizeKB KB)" -ForegroundColor White
    Write-Host "Path: $($vsixFile.FullName)" -ForegroundColor White
    Write-Host ""
    Write-Host "To install the extension, use one of the following:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  VS Code:" -ForegroundColor Cyan
    Write-Host "  code --install-extension `"$($vsixFile.Name)`"" -ForegroundColor White
    Write-Host ""
    Write-Host "  Cursor:" -ForegroundColor Cyan
    Write-Host "  cursor --install-extension `"$($vsixFile.Name)`"" -ForegroundColor White
    Write-Host ""
}

Write-Host "============================================" -ForegroundColor Cyan