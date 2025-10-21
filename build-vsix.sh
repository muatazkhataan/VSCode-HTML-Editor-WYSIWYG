#!/bin/bash

# Build VSIX Package Script
# Set colors
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}Building VSIX Package for HTML WYSIWYG Extension${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# Check Node.js
echo -e "${YELLOW}[1/6] Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}[OK] Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}[ERROR] Node.js not installed!${NC}"
    echo -e "${YELLOW}Please install Node.js from: https://nodejs.org/${NC}"
    exit 1
fi
echo ""

# Check npm
echo -e "${YELLOW}[2/6] Checking npm...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}[OK] npm installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}[ERROR] npm not installed!${NC}"
    exit 1
fi
echo ""

# Check node_modules
echo -e "${YELLOW}[3/6] Checking project dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[INFO] Dependencies not installed, installing...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] Failed to install dependencies!${NC}"
        exit 1
    fi
    echo -e "${GREEN}[OK] Dependencies installed successfully${NC}"
else
    echo -e "${GREEN}[OK] Dependencies already installed${NC}"
fi
echo ""

# Check vsce
echo -e "${YELLOW}[4/6] Checking vsce...${NC}"
if command -v vsce &> /dev/null; then
    VSCE_VERSION=$(vsce --version)
    echo -e "${GREEN}[OK] vsce installed: $VSCE_VERSION${NC}"
else
    echo -e "${YELLOW}[INFO] vsce not installed, installing...${NC}"
    echo -e "${YELLOW}[INFO] This may require administrator privileges...${NC}"
    sudo npm install -g @vscode/vsce
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] Failed to install vsce!${NC}"
        exit 1
    fi
    echo -e "${GREEN}[OK] vsce installed successfully${NC}"
fi
echo ""

# Build project
echo -e "${YELLOW}[5/6] Building project...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Failed to build project!${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Project built successfully${NC}"
echo ""

# Remove old VSIX
OLD_VSIX=$(ls vscode-html-wysiwyg-*.vsix 2>/dev/null)
if [ -n "$OLD_VSIX" ]; then
    echo -e "${YELLOW}[INFO] Removing old VSIX file...${NC}"
    rm -f vscode-html-wysiwyg-*.vsix
fi

# Package VSIX
echo -e "${YELLOW}[6/6] Building VSIX package...${NC}"
vsce package
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Failed to build VSIX package!${NC}"
    exit 1
fi
echo ""

# Show results
echo -e "${CYAN}============================================${NC}"
echo -e "${GREEN}[SUCCESS] Package built successfully!${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

VSIX_FILE=$(ls vscode-html-wysiwyg-*.vsix 2>/dev/null | head -n 1)
if [ -n "$VSIX_FILE" ]; then
    echo -e "${WHITE}Package: $VSIX_FILE${NC}"
    
    # Get file size
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        SIZE_BYTES=$(stat -f%z "$VSIX_FILE")
    else
        # Linux
        SIZE_BYTES=$(stat -c%s "$VSIX_FILE")
    fi
    
    SIZE_KB=$(echo "scale=2; $SIZE_BYTES / 1024" | bc)
    SIZE_MB=$(echo "scale=2; $SIZE_BYTES / 1024 / 1024" | bc)
    
    echo -e "${WHITE}Size: $SIZE_MB MB ($SIZE_KB KB)${NC}"
    echo -e "${WHITE}Path: $(pwd)/$VSIX_FILE${NC}"
    echo ""
    echo -e "${YELLOW}To install the extension, use one of the following:${NC}"
    echo ""
    echo -e "${CYAN}  VS Code:${NC}"
    echo -e "${WHITE}  code --install-extension \"$VSIX_FILE\"${NC}"
    echo ""
    echo -e "${CYAN}  Cursor:${NC}"
    echo -e "${WHITE}  cursor --install-extension \"$VSIX_FILE\"${NC}"
    echo ""
fi

echo -e "${CYAN}============================================${NC}"

