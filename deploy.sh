#!/bin/bash

# Simple deployment script for GitHub Pages
echo "Building React app..."
npm run build

echo "Build complete! 🎉"
echo ""
echo "To deploy to GitHub Pages:"
echo "1. Update package.json homepage field with your GitHub Pages URL"
echo "2. Push to main branch - GitHub Actions will handle deployment"
echo "3. Enable GitHub Pages in repository settings (Source: GitHub Actions)"
echo ""
echo "Your PWA will be available at: https://yourusername.github.io/repository-name"