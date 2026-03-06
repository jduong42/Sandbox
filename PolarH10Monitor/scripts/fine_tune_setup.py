#!/usr/bin/env python3
"""
Fine-tuning setup for DeepSeek-R1-Distill with LoRA
Compatible with llama.rn and GGUF format
"""

import os
import json
from pathlib import Path

# Configuration for fine-tuning
FINE_TUNE_CONFIG = {
    "base_model": "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
    "task": "sports_science_specialization",
    "method": "lora",  # Low-Rank Adaptation
    "output_format": "gguf",  # Keep compatible with llama.rn
    
    # LoRA Configuration
    "lora_config": {
        "r": 16,           # Rank - smaller = faster, larger = more capacity
        "alpha": 32,       # LoRA scaling parameter
        "dropout": 0.1,    # Dropout for regularization
        "target_modules": [
            "q_proj", "k_proj", "v_proj", "o_proj",  # Attention layers
            "gate_proj", "up_proj", "down_proj"       # MLP layers
        ]
    },
    
    # Training Configuration
    "training_config": {
        "learning_rate": 2e-4,
        "batch_size": 4,
        "gradient_accumulation_steps": 4,
        "num_epochs": 3,
        "warmup_steps": 100,
        "save_steps": 500,
        "eval_steps": 500,
        "max_seq_length": 2048,
    }
}

def create_sports_science_dataset():
    """Create a sports science fine-tuning dataset"""
    
    # Use your existing calibration data as a starting point
    calibration_path = Path("calibration_data.json")
    
    if calibration_path.exists():
        print(f"✅ Found existing calibration data: {calibration_path}")
        with open(calibration_path, 'r') as f:
            calibration_data = json.load(f)
        
        # Convert to fine-tuning format
        fine_tune_data = []
        
        for item in calibration_data:
            # Convert to instruction-following format
            fine_tune_entry = {
                "instruction": item.get("prompt", ""),
                "input": "",  # Empty for single-turn conversations
                "output": item.get("response", ""),
                "category": "sports_science"
            }
            fine_tune_data.append(fine_tune_entry)
        
        # Save fine-tuning dataset
        output_path = Path("fine_tune_dataset.json")
        with open(output_path, 'w') as f:
            json.dump(fine_tune_data, f, indent=2)
        
        print(f"✅ Created fine-tuning dataset: {output_path}")
        print(f"📊 Dataset size: {len(fine_tune_data)} examples")
        
        return output_path
    else:
        print(f"❌ Calibration data not found at {calibration_path}")
        return None

def create_training_script():
    """Create a training script using unsloth for efficient fine-tuning"""
    
    script_content = '''#!/usr/bin/env python3
"""
Fine-tune DeepSeek-R1-Distill with LoRA using unsloth
Optimized for efficiency and compatibility with llama.rn
"""

import json
from unsloth import FastLanguageModel
from datasets import Dataset
from trl import SFTTrainer
from transformers import TrainingArguments
import torch

def load_model_and_tokenizer():
    """Load the base model with LoRA configuration"""
    
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name="deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
        max_seq_length=2048,
        dtype=None,  # Auto-detect
        load_in_4bit=True,  # 4-bit quantization for efficiency
    )
    
    # Add LoRA adapters
    model = FastLanguageModel.get_peft_model(
        model,
        r=16,           # Rank
        target_modules=[
            "q_proj", "k_proj", "v_proj", "o_proj",
            "gate_proj", "up_proj", "down_proj"
        ],
        lora_alpha=32,
        lora_dropout=0.1,
        bias="none",
        use_gradient_checkpointing="unsloth",
        random_state=42,
    )
    
    return model, tokenizer

def format_prompts(examples):
    """Format training examples for instruction following"""
    
    instruction_template = """<|im_start|>system
You are an expert sports science assistant specializing in athletic performance, training, and recovery.
<|im_end|>
<|im_start|>user
{instruction}
<|im_end|>
<|im_start|>assistant
{output}<|im_end|>"""
    
    texts = []
    for instruction, output in zip(examples["instruction"], examples["output"]):
        text = instruction_template.format(
            instruction=instruction,
            output=output
        )
        texts.append(text)
    
    return {"text": texts}

def main():
    """Main fine-tuning process"""
    
    print("🚀 Starting DeepSeek-R1-Distill fine-tuning...")
    
    # Load model and tokenizer
    print("📥 Loading model and tokenizer...")
    model, tokenizer = load_model_and_tokenizer()
    
    # Load dataset
    print("📊 Loading training dataset...")
    with open("fine_tune_dataset.json", "r") as f:
        data = json.load(f)
    
    dataset = Dataset.from_list(data)
    dataset = dataset.map(format_prompts, batched=True)
    
    # Training arguments
    training_args = TrainingArguments(
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        warmup_steps=100,
        num_train_epochs=3,
        learning_rate=2e-4,
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=1,
        optim="adamw_8bit",
        weight_decay=0.01,
        lr_scheduler_type="linear",
        seed=42,
        output_dir="outputs",
        save_strategy="steps",
        save_steps=500,
        evaluation_strategy="steps",
        eval_steps=500,
    )
    
    # Create trainer
    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=dataset,
        dataset_text_field="text",
        max_seq_length=2048,
        dataset_num_proc=4,
        args=training_args,
    )
    
    # Start training
    print("🏋️ Starting training...")
    trainer.train()
    
    # Save the fine-tuned model
    print("💾 Saving fine-tuned model...")
    model.save_pretrained("deepseek-sports-lora")
    tokenizer.save_pretrained("deepseek-sports-lora")
    
    print("✅ Fine-tuning complete!")

if __name__ == "__main__":
    main()
'''
    
    with open("fine_tune_trainer.py", "w") as f:
        f.write(script_content)
    
    print("✅ Created training script: fine_tune_trainer.py")

def create_conversion_script():
    """Create script to convert fine-tuned model back to GGUF"""
    
    script_content = '''#!/usr/bin/env python3
"""
Convert fine-tuned LoRA model to GGUF format for llama.rn
"""

import subprocess
import os
from pathlib import Path

def merge_lora_and_convert():
    """Merge LoRA adapters and convert to GGUF"""
    
    print("🔄 Merging LoRA adapters with base model...")
    
    # First, merge the LoRA adapters
    merge_cmd = [
        "python", "-m", "unsloth.merge_lora",
        "--base_model", "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
        "--lora_model", "deepseek-sports-lora",
        "--output_dir", "deepseek-sports-merged"
    ]
    
    try:
        subprocess.run(merge_cmd, check=True)
        print("✅ LoRA merge complete")
    except subprocess.CalledProcessError as e:
        print(f"❌ LoRA merge failed: {e}")
        return False
    
    # Convert merged model to GGUF
    print("🔄 Converting to GGUF format...")
    
    convert_cmd = [
        "python", "llama.cpp/convert-hf-to-gguf.py",
        "deepseek-sports-merged",
        "--outfile", "DeepSeek-R1-Sports-Q4_K_M.gguf",
        "--outtype", "q4_k_m"
    ]
    
    try:
        subprocess.run(convert_cmd, check=True)
        print("✅ GGUF conversion complete")
        print("📁 Output: DeepSeek-R1-Sports-Q4_K_M.gguf")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ GGUF conversion failed: {e}")
        return False

if __name__ == "__main__":
    merge_lora_and_convert()
'''
    
    with open("convert_to_gguf.py", "w") as f:
        f.write(script_content)
    
    print("✅ Created conversion script: convert_to_gguf.py")

def main():
    """Main setup function"""
    
    print("🚀 Setting up fine-tuning environment for DeepSeek-R1-Distill...")
    print("📋 This will create a sports science specialized model compatible with llama.rn")
    
    # Create dataset
    dataset_path = create_sports_science_dataset()
    
    if dataset_path:
        # Create training scripts
        create_training_script()
        create_conversion_script()
        
        # Save configuration
        with open("fine_tune_config.json", "w") as f:
            json.dump(FINE_TUNE_CONFIG, f, indent=2)
        
        print("\n✅ Fine-tuning setup complete!")
        print("\n🎯 Next steps:")
        print("1. Install dependencies: pip install unsloth torch datasets trl")
        print("2. Run training: python fine_tune_trainer.py")
        print("3. Convert to GGUF: python convert_to_gguf.py")
        print("4. Test the fine-tuned model in your app")
        
        print(f"\n📊 Training will use {len(json.load(open(dataset_path)))} sports science examples")
        print("🎯 Expected improvements: Better sports terminology, more accurate responses")
        print("⚡ Training time: ~1-2 hours on modern GPU")
        
    else:
        print("❌ Setup failed - calibration data not found")

if __name__ == "__main__":
    main()