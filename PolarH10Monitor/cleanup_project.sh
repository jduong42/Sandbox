#!/bin/bash

# Project Cleanup Script
# Remove all development artifacts and keep only production-ready files

echo "🧹 Starting project cleanup..."

# Remove all Python development scripts
echo "Removing Python development scripts..."
rm -f *.py

# Remove experimental services files
echo "Cleaning up experimental services files..."
rm -f src/services/FineTunedModelTestService.ts
rm -f src/services/FineTunedONNXService.ts
rm -f src/services/FineTunedSportsAIService.ts
rm -f src/services/HybridSportsAI.ts
rm -f src/services/LightweightSportsAI.ts
rm -f src/services/LocalModelService.ts
rm -f src/services/ModelService.ts
rm -f src/services/ModelService_clean.ts
rm -f src/services/ModelService_corrupted.ts
rm -f src/services/ONNXModelService.ts
rm -f src/services/ONNXModelService_enhanced.ts
rm -f src/services/ONNXModelService_old.ts
rm -f src/services/ONNXModelService_production.ts
rm -f src/services/ONNXModelService_simplified.ts
rm -f src/services/ONNXModelService_v2.ts
rm -f src/services/ONNXSportsAIService.ts
rm -f src/services/ONNXSportsAIService_fixed.ts
rm -f src/services/ONNXTestService.ts
rm -f src/services/SportsAIService.ts
rm -f src/services/TextGenerationService.ts
rm -f src/services/CustomQWenTokenizer.ts
rm -f src/services/QwenTokenizerService.ts
rm -f src/services/qwen2_tokenizer_vocab.ts

# Remove experimental screens
echo "Cleaning up experimental screens..."
rm -f src/screens/ONNXSMLScreen.tsx

# Remove development directories that aren't needed
echo "Removing development directories..."
rm -rf python_server/
rm -rf qwen-sports-science-lora/
rm -rf qwen-sports-science-merged/
rm -rf optimum-onnx-output/
rm -rf test_models/
rm -rf training_data/

# Remove temporary requirement files
echo "Removing temporary requirement files..."
rm -f requirements_*.txt

# Remove development documentation files
echo "Removing development documentation..."
rm -f FINETUNED_MODEL_INTEGRATION.md
rm -f FINE_TUNING_GUIDE.md
rm -f HUGGINGFACE_SEARCH_GUIDE.md
rm -f ONNX_INTEGRATION_STATUS.md
rm -f ONNX_INTEGRATION_TEST_CHECKLIST.md
rm -f SPORTS_SCIENCE_FINETUNING_OPTIONS.md
rm -f VERIFICATION_GUIDE.md

# Clean up models folder
echo "Cleaning up models folder..."
rm -f models/IMPLEMENTATION_SUMMARY.md
rm -f models/ONNX_IMPLEMENTATION_GUIDE.md
rm -f models/ONNX_INTEGRATION_STATUS.md
rm -f models/PHASE4_MOBILE_INTEGRATION_PLAN.md
rm -f models/REACT_NATIVE_INTEGRATION_CODE.md
rm -f models/convert_to_onnx.py
rm -f models/requirements.txt
rm -f models/config.json
rm -f models/generation_config.json
rm -f models/model_metadata_onnx.json
rm -rf models/fine-tuned/

# Clean up onnx_models folder
echo "Cleaning up onnx_models folder..."
rm -f onnx_models/qwen_minimal_test.onnx
rm -f onnx_models/minimal_model_metadata.json

# Clean up src folder development files
echo "Cleaning up src development files..."
rm -f src/QuickONNXTest.tsx
rm -f src/SportsKnowledgeTester.ts

# Remove development scripts
echo "Removing development scripts..."
rm -f SportsKnowledgeTester.ts
rm -f check_gemini_requirements.js
rm -f copy_model_to_assets.sh
rm -f fix_ios_model_bundle.sh
rm -f testing_commands.sh
rm -f verify_onnx_workflow.sh

# Remove .DS_Store files
echo "Removing .DS_Store files..."
find . -name ".DS_Store" -delete

echo "✅ Cleanup completed!"
echo ""
echo "📁 Remaining important files:"
echo "  ✅ src/ - Main application code"
echo "  ✅ models/ - Fine-tuned model files"
echo "  ✅ onnx_models/ - ONNX runtime models"
echo "  ✅ package.json - Dependencies"
echo "  ✅ React Native project files"
echo ""
echo "🚀 Ready for git commit!"
