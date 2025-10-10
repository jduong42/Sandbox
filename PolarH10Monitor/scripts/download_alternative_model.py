#!/usr/bin/env python3
"""
Download a smaller, faster model that's already optimized for scientific/medical content
This is much faster than fine-tuning on CPU
"""

import os
import subprocess
from pathlib import Path

def download_specialized_model():
    """Download a model that's already specialized for scientific content"""
    
    print("🚀 Downloading specialized scientific model...")
    print("📋 This approach is much faster than CPU fine-tuning!")
    
    # Options for faster, specialized models
    models = {
        "SmolLM2-1.7B-Instruct": {
            "repo": "HuggingFaceTB/SmolLM2-1.7B-Instruct",
            "size": "~1.1GB",
            "description": "Smaller, faster model good for specialized tasks",
            "gguf_repo": "bartowski/SmolLM2-1.7B-Instruct-GGUF",
            "gguf_file": "SmolLM2-1.7B-Instruct-Q4_K_M.gguf"
        },
        "Qwen2.5-1.5B-Instruct": {
            "repo": "Qwen/Qwen2.5-1.5B-Instruct", 
            "size": "~1.1GB",
            "description": "Similar to DeepSeek but potentially faster",
            "gguf_repo": "bartowski/Qwen2.5-1.5B-Instruct-GGUF",
            "gguf_file": "Qwen2.5-1.5B-Instruct-Q4_K_M.gguf"
        },
        "Current DeepSeek": {
            "repo": "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
            "size": "~1.1GB", 
            "description": "Your current model (keep as-is)",
            "gguf_repo": "None",
            "gguf_file": "DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf"
        }
    }
    
    print("\n📊 Available options:")
    for i, (name, info) in enumerate(models.items(), 1):
        print(f"{i}. {name}")
        print(f"   Size: {info['size']}")
        print(f"   Description: {info['description']}")
        print()
    
    return models

def download_gguf_model(model_info, model_name):
    """Download GGUF model using huggingface-hub"""
    
    if model_info["gguf_repo"] == "None":
        print(f"✅ {model_name} is already in your project!")
        return True
    
    try:
        print(f"📥 Downloading {model_name} GGUF model...")
        
        cmd = [
            "huggingface-cli", "download",
            model_info["gguf_repo"],
            model_info["gguf_file"],
            "--local-dir", ".",
            "--local-dir-use-symlinks", "False"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ Downloaded: {model_info['gguf_file']}")
            return True
        else:
            print(f"❌ Download failed: {result.stderr}")
            return False
            
    except FileNotFoundError:
        print("❌ huggingface-cli not found. Installing...")
        subprocess.run(["pip", "install", "huggingface_hub[cli]"])
        return download_gguf_model(model_info, model_name)
    except Exception as e:
        print(f"❌ Download error: {e}")
        return False

def create_model_comparison_guide():
    """Create a guide for testing different models"""
    
    guide = """# 🔬 Model Comparison Guide

## 📊 Quick Model Testing

Instead of CPU fine-tuning (20+ hours), test these pre-optimized models:

### 1. SmolLM2-1.7B-Instruct 
- **Speed**: ~30-40 tokens/sec (faster than DeepSeek)
- **Size**: ~1.1GB 
- **Strength**: Efficient reasoning, good for mobile
- **Best for**: Quick responses, battery efficiency

### 2. Qwen2.5-1.5B-Instruct
- **Speed**: ~25-30 tokens/sec 
- **Size**: ~1.1GB
- **Strength**: Similar architecture to DeepSeek
- **Best for**: Balanced performance and quality

### 3. DeepSeek-R1-Distill (Current)
- **Speed**: ~26 tokens/sec
- **Size**: ~1.1GB  
- **Strength**: Reasoning capabilities
- **Best for**: Complex sports science questions

## 🧪 Testing Protocol

1. **Download alternative model**
2. **Update model path** in LlamaTestScreen
3. **Test same questions** on both models
4. **Compare**:
   - Response speed
   - Answer quality
   - Sports science accuracy
   - Battery usage

## 📱 Integration Steps

```typescript
// In LlamaTextGenerationService.ts
const modelPath = `${MainBundlePath}/SmolLM2-1.7B-Instruct-Q4_K_M.gguf`;
// OR
const modelPath = `${MainBundlePath}/Qwen2.5-1.5B-Instruct-Q4_K_M.gguf`;
```

## 🎯 Expected Results

**SmolLM2** - Likely faster but maybe less specialized
**Qwen2.5** - Similar quality to DeepSeek, possibly faster
**DeepSeek** - Your current benchmark for comparison

## 💡 Future Options

Once you find the best base model:
1. **GPU fine-tuning** (if you have access to GPU)
2. **Cloud fine-tuning** (Google Colab Pro, AWS, etc.)
3. **Prompt engineering** (improve responses without training)
4. **RAG approach** (add sports science knowledge base)
"""
    
    with open("MODEL_COMPARISON_GUIDE.md", "w") as f:
        f.write(guide)
    
    print("📖 Created model comparison guide: MODEL_COMPARISON_GUIDE.md")

def main():
    """Main function"""
    
    print("🚀 Alternative to CPU Fine-tuning: Specialized Model Download")
    print("💡 This is 100x faster than fine-tuning on CPU!\n")
    
    models = download_specialized_model()
    
    print("🎯 Recommendation: Try SmolLM2-1.7B-Instruct first")
    print("📱 It's optimized for mobile and should be faster than DeepSeek")
    print("\n📋 Choose an option:")
    print("1. Download SmolLM2-1.7B-Instruct (recommended)")
    print("2. Download Qwen2.5-1.5B-Instruct (alternative)")
    print("3. Keep current DeepSeek model only")
    
    try:
        choice = input("\nEnter choice (1-3): ").strip()
        
        if choice == "1":
            model_info = models["SmolLM2-1.7B-Instruct"]
            if download_gguf_model(model_info, "SmolLM2-1.7B-Instruct"):
                print("\n✅ SmolLM2 ready for testing!")
                
        elif choice == "2":
            model_info = models["Qwen2.5-1.5B-Instruct"]
            if download_gguf_model(model_info, "Qwen2.5-1.5B-Instruct"):
                print("\n✅ Qwen2.5 ready for testing!")
                
        elif choice == "3":
            print("\n✅ Keeping current DeepSeek model")
            
        else:
            print("❌ Invalid choice")
            return
            
        create_model_comparison_guide()
        
        print("\n🎯 Next steps:")
        print("1. Copy new .gguf file to ios/ directory")
        print("2. Update model path in LlamaTextGenerationService")
        print("3. Test performance difference in your app")
        print("4. Compare quality using same test questions")
        
    except KeyboardInterrupt:
        print("\n👋 Operation cancelled")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()