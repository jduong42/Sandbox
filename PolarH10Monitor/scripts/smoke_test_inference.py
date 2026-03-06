#!/usr/bin/env python3
"""
Smoke test for fine-tuned DeepSeek-R1-Distill model
Tests if the LoRA adapter loads and generates responses
"""

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import os

def test_fine_tuned_model():
    print("🧪 Testing fine-tuned DeepSeek-R1-Distill model...")
    
    # Model paths
    base_model_name = "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B"
    adapter_path = "./deepseek-sports-lora-final"
    
    # Check if adapter exists
    if not os.path.exists(adapter_path):
        print(f"❌ Adapter path not found: {adapter_path}")
        return False
    
    try:
        print("📥 Loading base model and tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(base_model_name, trust_remote_code=True)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        base_model = AutoModelForCausalLM.from_pretrained(
            base_model_name,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto" if torch.cuda.is_available() else None,
            trust_remote_code=True
        )
        
        print("🔄 Loading LoRA adapter...")
        model = PeftModel.from_pretrained(base_model, adapter_path)
        
        # Test prompt
        test_prompt = "I am a beginner runner. How should I structure my training week to improve endurance and avoid injury?"
        
        print(f"❓ Testing with prompt: {test_prompt}")
        
        # Format prompt
        formatted_prompt = f"<|im_start|>system\nYou are an expert sports science assistant.\n<|im_end|>\n<|im_start|>user\n{test_prompt}\n<|im_end|>\n<|im_start|>assistant\n"
        
        # Generate response
        inputs = tokenizer(formatted_prompt, return_tensors="pt")
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=150,
                temperature=0.7,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        response = response.split("<|im_start|>assistant\n")[-1]
        
        print("✅ Model loaded successfully!")
        print(f"🎯 Generated response:\n{response}")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_fine_tuned_model()
    if success:
        print("\n🎉 Smoke test PASSED! Fine-tuned model is working.")
    else:
        print("\n💥 Smoke test FAILED! Check the error above.")