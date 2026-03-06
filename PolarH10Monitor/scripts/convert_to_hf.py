#!/usr/bin/env python3
"""
Convert fine-tuned LoRA model to HuggingFace format and provide instructions for GGUF conversion
"""

import os
import json
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

def merge_lora_model():
    """Merge LoRA adapters with base model"""
    
    print("🔄 Merging LoRA adapters with base model...")
    
    base_model_name = "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B"
    lora_model_path = "./deepseek-sports-lora-final"
    output_path = "./deepseek-sports-merged"
    
    if not os.path.exists(lora_model_path):
        print(f"❌ LoRA model not found at {lora_model_path}")
        print("Please run fine_tune_trainer_simple.py first")
        return False
    
    try:
        # Load base model
        print("📥 Loading base model...")
        base_model = AutoModelForCausalLM.from_pretrained(
            base_model_name,
            trust_remote_code=True,
            torch_dtype="auto"
        )
        
        # Load tokenizer
        tokenizer = AutoTokenizer.from_pretrained(base_model_name, trust_remote_code=True)
        
        # Load and merge LoRA
        print("🔗 Loading and merging LoRA adapters...")
        model = PeftModel.from_pretrained(base_model, lora_model_path)
        merged_model = model.merge_and_unload()
        
        # Save merged model
        print("💾 Saving merged model...")
        os.makedirs(output_path, exist_ok=True)
        merged_model.save_pretrained(output_path)
        tokenizer.save_pretrained(output_path)
        
        print(f"✅ Merged model saved to: {output_path}")
        
        # Create model info
        model_info = {
            "model_name": "DeepSeek-R1-Sports-Specialized",
            "base_model": base_model_name,
            "fine_tune_method": "LoRA",
            "specialized_for": "Sports Science and HRV Analysis",
            "training_examples": 424,
            "created_by": "PolarH10Monitor Fine-tuning Pipeline"
        }
        
        with open(f"{output_path}/model_info.json", "w") as f:
            json.dump(model_info, f, indent=2)
        
        return True
    
    except Exception as e:
        print(f"❌ Merge failed: {e}")
        return False

def create_gguf_instructions():
    """Create instructions for GGUF conversion"""
    
    instructions = """
# 🔄 Converting to GGUF Format for llama.rn

Your fine-tuned model has been merged successfully! To use it with llama.rn, you need to convert it to GGUF format.

## Option 1: Using LM Studio (Recommended - Easy)

1. **Download LM Studio**: https://lmstudio.ai/
2. **Open LM Studio** and go to "Import" tab
3. **Select your model**: Browse to `./deepseek-sports-merged`
4. **Choose quantization**: Q4_K_M (best balance of size/quality)
5. **Convert**: LM Studio will create the GGUF file
6. **Copy to iOS**: Move the `.gguf` file to your iOS project

## Option 2: Using llama.cpp (Advanced)

If you have llama.cpp installed:

```bash
# Clone llama.cpp if not already done
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
make

# Convert to GGUF
python convert-hf-to-gguf.py ../deepseek-sports-merged --outfile DeepSeek-R1-Sports-Q4_K_M.gguf --outtype q4_k_m
```

## Option 3: Use Hugging Face Spaces

1. Go to: https://huggingface.co/spaces/ggml-org/gguf-my-repo
2. Upload your `deepseek-sports-merged` folder
3. Select Q4_K_M quantization
4. Download the resulting GGUF file

## Integration with Your App

Once you have the GGUF file:

1. **Copy to iOS project**:
   ```bash
   cp DeepSeek-R1-Sports-Q4_K_M.gguf ../ios/
   ```

2. **Update model path** in your app:
   ```typescript
   const modelPath = `${MainBundlePath}/DeepSeek-R1-Sports-Q4_K_M.gguf`;
   ```

3. **Test the fine-tuned model** with sports science questions!

## Expected Improvements

Your fine-tuned model should now provide:
- ✅ More accurate sports science terminology
- ✅ Better HRV explanations and interpretations  
- ✅ Enhanced training and recovery recommendations
- ✅ More detailed physiological explanations
- ✅ Consistent sports-focused responses

## File Sizes

- Original DeepSeek model: ~1.12GB
- Fine-tuned model: ~1.12GB (same size)
- Both models can coexist in your app bundle

Total storage if keeping both: ~2.24GB
"""
    
    with open("GGUF_CONVERSION_GUIDE.md", "w") as f:
        f.write(instructions)
    
    print("📖 Created GGUF conversion guide: GGUF_CONVERSION_GUIDE.md")

def main():
    """Main conversion process"""
    
    print("🚀 Converting fine-tuned model for llama.rn compatibility...")
    
    # Merge LoRA with base model
    if merge_lora_model():
        print("\n✅ Model merge complete!")
        
        # Create conversion instructions
        create_gguf_instructions()
        
        print("\n🎯 Next steps:")
        print("1. Read GGUF_CONVERSION_GUIDE.md for conversion options")
        print("2. Convert merged model to GGUF format")
        print("3. Copy GGUF file to iOS project")
        print("4. Test fine-tuned model in your app!")
        
    else:
        print("\n❌ Conversion failed. Please check the error messages above.")

if __name__ == "__main__":
    main()