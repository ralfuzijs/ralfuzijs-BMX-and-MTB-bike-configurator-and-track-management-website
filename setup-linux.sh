#!/bin/bash

# BMX/MTB Website - Linux Setup Script
# This script installs all necessary dependencies for the project

set -e  # Exit on error

echo "=================================="
echo "BMX/MTB Website Setup for Linux"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check Node.js
echo "Checking Node.js installation..."
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is not installed!"
    echo "Please install Node.js >= 16.0.0 from:"
    echo "  https://nodejs.org/"
    echo "Or use a package manager:"
    echo "  Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
    echo "  Fedora: sudo dnf install nodejs"
    echo "  Arch: sudo pacman -S nodejs npm"
    exit 1
fi

# Check npm
echo "Checking npm installation..."
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm is installed: $NPM_VERSION"
else
    print_error "npm is not installed!"
    echo "npm should come with Node.js. Please reinstall Node.js."
    exit 1
fi

# Check SQLite (optional, as it comes with most Linux distributions)
echo "Checking SQLite installation..."
if command_exists sqlite3; then
    SQLITE_VERSION=$(sqlite3 --version | cut -d' ' -f1)
    print_success "SQLite is installed: $SQLITE_VERSION"
else
    print_warning "SQLite CLI is not installed (optional)."
    echo "SQLite library is included with Node.js sqlite3 package."
    echo "To install SQLite CLI (optional):"
    echo "  Ubuntu/Debian: sudo apt-get install sqlite3"
    echo "  Fedora: sudo dnf install sqlite"
    echo "  Arch: sudo pacman -S sqlite"
    echo ""
fi

print_success "Database: Using SQLite (file-based, no service required)"

echo ""
echo "=================================="
echo "Installing Project Dependencies"
echo "=================================="
echo ""

# Install backend dependencies
echo "Installing backend dependencies..."
cd map-tracks-api
if [ -f "package.json" ]; then
    npm install
    chmod +x node_modules/.bin/* 2>/dev/null || true
    print_success "Backend dependencies installed"
else
    print_error "map-tracks-api/package.json not found!"
    exit 1
fi
cd ..

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
cd vue-project
if [ -f "package.json" ]; then
    npm install
    chmod +x node_modules/.bin/* 2>/dev/null || true
    print_success "Frontend dependencies installed"
else
    print_error "vue-project/package.json not found!"
    exit 1
fi
cd ..

# Install root dependencies (if any)
if [ -f "package.json" ]; then
    echo ""
    echo "Installing root dependencies..."
    npm install
    chmod +x node_modules/.bin/* 2>/dev/null || true
    print_success "Root dependencies installed"
fi

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Configure your environment variables:"
echo "   - Copy map-tracks-api/.env.example to map-tracks-api/.env (if exists)"
echo "   - Update configuration settings as needed"
echo ""
echo "2. Start the development servers:"
echo "   ./start-dev.sh"
echo ""
echo "Or start them manually:"
echo "   Backend:  cd map-tracks-api && npm run dev"
echo "   Frontend: cd vue-project && npm run dev"
echo ""
print_success "Setup completed successfully!"
