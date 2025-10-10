# 🧹 Model Cleanup Analysis

## 📊 Current Model Storage Analysis

### ✅ **Active Model (Keep)**
- `ios/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf` - **1.0GB** - Currently used in app

### 🔄 **Duplicates Found (Can Remove)**

#### DeepSeek Model Duplicates:
- `deepseek_models/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf` - **1.0GB** ❌ DUPLICATE
- **Savings: 1.0GB**

#### Old Qwen Models (Backup/Archive):
- `models/model-quantized.onnx` - **1.7GB** 
- `models/model-original-32bit.onnx_data` - **5.8GB** 
- `models/model.onnx` - **112MB**
- `models/model.onnx_data` - **0B** (empty)
- **Total: ~7.6GB**

#### Old DistilGPT2 Models (Archive):
- `models/distilgpt2_sports_science.gguf` - **87MB**
- `assets/models/distilgpt2_sports_science.gguf` - **87MB** ❌ DUPLICATE
- `android/app/src/main/assets/models/distilgpt2_sports_science.gguf` - **87MB** ❌ DUPLICATE
- **Duplicates: 174MB**

#### Massive ONNX Archive (onnx_models/):
- `onnx_models/qwen25_preconverted/onnx/model_q4.onnx` - **1.7GB**
- `onnx_models/qwen25_preconverted/onnx/model_q4f16.onnx` - **1.1GB**
- `onnx_models/qwen25_preconverted/onnx/model_bnb4.onnx` - **1.6GB**
- `onnx_models/qwen25_preconverted/onnx/model_int8.onnx` - **1.5GB**
- `onnx_models/qwen25_preconverted/onnx/model.onnx_data` - **5.8GB**
- `onnx_models/qwen25_preconverted/onnx/model_uint8.onnx` - **1.5GB**
- `onnx_models/qwen25_preconverted/onnx/model_fp16.onnx_data` - **2.9GB**
- `onnx_models/qwen25_preconverted/onnx/model_quantized.onnx` - **1.5GB**
- **Total: ~17.6GB**

#### Android Archive Models:
- `android/app/src/main/assets/models/model_q4f16.onnx` - **1.1GB**
- **Total: 1.1GB**

#### Other Archive:
- `assets/models/qwen-sports-science-merged/model.safetensors` - **2.9GB**

## 💾 **Total Storage Summary**

### Current Total: **~32GB** of model files
- **Active Model**: 1.0GB (DeepSeek in iOS)
- **Archive/Backup Models**: ~31GB
- **Clear Duplicates**: ~1.2GB immediate savings

### Recommended Actions:

1. **🗑️ Remove Clear Duplicates** (~1.2GB savings):
   - `deepseek_models/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf`
   - `assets/models/distilgpt2_sports_science.gguf`
   - `android/app/src/main/assets/models/distilgpt2_sports_science.gguf`

2. **📦 Archive Old Experiments** (optional ~26GB savings):
   - Move `onnx_models/` to external storage/cloud
   - Move old `models/` folder to external storage
   - Keep one backup copy of original model

3. **✅ Keep as Backup** (recommended):
   - `models/distilgpt2_sports_science.gguf` (87MB - small, first working model)
   - `ios/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf` (1.0GB - current active)

## 🎯 **Git-Ready Cleanup Plan**

### Immediate (Safe for Git Push):
```bash
# Remove clear duplicates only
rm deepseek_models/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf
rm assets/models/distilgpt2_sports_science.gguf
rm android/app/src/main/assets/models/distilgpt2_sports_science.gguf
```

### Optional (Archive Cleanup):
```bash
# Archive large experiment folders
tar -czf backup_onnx_models_$(date +%Y%m%d).tar.gz onnx_models/
tar -czf backup_old_models_$(date +%Y%m%d).tar.gz models/
# Then remove after backup verification
```

This keeps your working DeepSeek model while removing unnecessary duplicates!