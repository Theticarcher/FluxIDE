#!/bin/bash

# Update the Flux compiler submodule to the latest version

set -e

cd "$(dirname "$0")/.."

echo "Updating Flux compiler submodule..."

# Update submodule to latest from remote
git submodule update --remote flux-compiler

# Install dependencies if package.json changed
echo "Installing compiler dependencies..."
cd flux-compiler
npm install
cd ..

echo ""
echo "Flux compiler updated successfully!"
echo ""
echo "Changes to commit:"
git status flux-compiler

echo ""
echo "To commit the update, run:"
echo "  git add flux-compiler"
echo "  git commit -m \"Update Flux compiler\""
