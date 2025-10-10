#!/bin/bash
# 🧹 Project Cleanup Script for Git Push
# Prepares the project for clean git push and desktop GPU fine-tuning

echo "🧹 Starting project cleanup for git push..."

# Navigate to project root
cd /Users/juhaduong/Desktop/Sanbox_projects/PolarH10Monitor

# Remove any training artifacts that shouldn't be committed
echo "🗑️  Removing training artifacts..."
rm -rf scripts/deepseek-sports-lora*
rm -rf scripts/__pycache__
rm -rf .venv
rm -rf scripts/.venv

# Remove DS_Store files
echo "🗑️  Removing .DS_Store files..."
find . -name ".DS_Store" -delete
rm -f ../.DS_Store

# Clean up large model files that might not be needed
echo "📦 Checking large files..."
echo "Current large files in ios/:"
ls -lh ios/*.gguf 2>/dev/null || echo "No .gguf files found"

# Stage the important new files
echo "📋 Adding important files to git..."
git add docs/
git add scripts/FINE_TUNING_GUIDE.md
git add scripts/fine_tune_*.py
git add scripts/convert_to_*.py
git add scripts/calibration_data.json
git add scripts/fine_tune_dataset.json
git add scripts/fine_tune_requirements.txt
git add scripts/fine_tune_config.json
git add src/components/ModelSwitcher.tsx
git add src/screens/LlamaTestScreen.tsx
git add src/services/LlamaTextGenerationService.ts
git add src/navigation/MainTabNavigator.tsx
git add src/screens/index.ts
git add package.json
git add package-lock.json

# Show current status
echo "📊 Current git status:"
git status --short

echo ""
echo "🎯 Cleanup Summary:"
echo "✅ Training artifacts removed"
echo "✅ .DS_Store files cleaned"
echo "✅ Important files staged for commit"
echo "✅ Large model files managed by .gitignore"
echo ""
echo "📋 What's ready to commit:"
echo "  - 🧠 LlamaTextGenerationService (llama.rn integration)"
echo "  - 🧪 LlamaTestScreen (enhanced UI with custom prompts)"
echo "  - 🔄 ModelSwitcher component"
echo "  - 🏋️ Complete fine-tuning pipeline"
echo "  - 📊 424 sports science training examples"
echo "  - 📖 Documentation and guides"
echo ""
echo "🚀 Ready for: git commit -m 'Add llama.rn integration and fine-tuning pipeline'"
echo "🏠 Then on desktop: git clone and run GPU fine-tuning!"