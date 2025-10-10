#!/bin/bash
# 🖥️ Desktop GPU Fine-tuning Setup Script
# Run this on your desktop with RX 9070 XT 16GB

echo "🖥️ Setting up GPU fine-tuning environment..."
echo "🎯 Target: RX 9070 XT 16GB"

# Check if we're in the right directory
if [ ! -f "scripts/fine_tune_trainer_simple.py" ]; then
    echo "❌ Please run this from the PolarH10Monitor project root"
    exit 1
fi

# Create Python virtual environment
echo "🐍 Creating Python virtual environment..."
python3 -m venv .venv
source .venv/bin/activate

# Install PyTorch with ROCm support for AMD GPU
echo "🔥 Installing PyTorch with ROCm support for AMD GPU..."
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm6.0

# Install fine-tuning dependencies
echo "📦 Installing fine-tuning dependencies..."
cd scripts
pip install -r fine_tune_requirements.txt

# Try to install unsloth (might work better on Linux)
echo "⚡ Attempting to install unsloth for faster training..."
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git" || echo "⚠️  unsloth failed, using standard transformers"

# Test GPU availability
echo "🧪 Testing AMD GPU availability..."
python3 -c "
import torch
print(f'PyTorch version: {torch.__version__}')
print(f'CUDA available: {torch.cuda.is_available()}')
if torch.cuda.is_available():
    print(f'GPU device: {torch.cuda.get_device_name()}')
    print(f'GPU memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB')
else:
    print('⚠️  GPU not detected - will use CPU (slow)')
"

# Create GPU-optimized training script
echo "🚀 Creating GPU-optimized training script..."
cat > fine_tune_trainer_gpu.py << 'EOF'
#!/usr/bin/env python3
"""
GPU-optimized fine-tuning for AMD RX 9070 XT 16GB
"""

import json
import torch
from transformers import (
    AutoModelForCausalLM, 
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from peft import LoraConfig, get_peft_model, TaskType
from datasets import Dataset
import os

def main():
    print("🚀 Starting GPU fine-tuning for AMD RX 9070 XT...")
    
    # Check GPU
    if torch.cuda.is_available():
        device = torch.cuda.current_device()
        gpu_name = torch.cuda.get_device_name(device)
        gpu_memory = torch.cuda.get_device_properties(device).total_memory / 1e9
        print(f"🎯 Using GPU: {gpu_name} ({gpu_memory:.1f} GB)")
    else:
        print("⚠️  No GPU detected - training will be slow!")
    
    # Load model with GPU optimization
    model_name = "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B"
    
    print("📥 Loading model and tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16,  # Use half precision for efficiency
        device_map="auto",          # Automatically use GPU
        trust_remote_code=True
    )
    
    # Configure LoRA for GPU
    lora_config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        inference_mode=False,
        r=32,                    # Higher rank for better quality with GPU
        lora_alpha=64,          # Scaled accordingly
        lora_dropout=0.1,
        target_modules=[
            "q_proj", "k_proj", "v_proj", "o_proj",
            "gate_proj", "up_proj", "down_proj"
        ]
    )
    
    model = get_peft_model(model, lora_config)
    print(f"✅ Model loaded with LoRA - {model.num_parameters(only_trainable=True)} trainable params")
    
    # Load and process dataset
    with open("fine_tune_dataset.json", "r") as f:
        data = json.load(f)
    
    def format_prompts(examples):
        template = """<|im_start|>system
You are an expert sports science assistant specializing in athletic performance, training, and recovery.
<|im_end|>
<|im_start|>user
{instruction}
<|im_end|>
<|im_start|>assistant
{output}<|im_end|>"""
        
        texts = [template.format(instruction=inst, output=out) 
                for inst, out in zip(examples["instruction"], examples["output"])]
        
        tokenized = tokenizer(texts, truncation=True, padding=False, max_length=2048)
        tokenized["labels"] = tokenized["input_ids"].copy()
        return tokenized
    
    dataset = Dataset.from_list(data)
    tokenized_dataset = dataset.map(format_prompts, batched=True, remove_columns=dataset.column_names)
    
    # GPU-optimized training arguments
    training_args = TrainingArguments(
        output_dir="./deepseek-sports-gpu",
        overwrite_output_dir=True,
        num_train_epochs=3,              # More epochs with GPU
        per_device_train_batch_size=4,   # Larger batch size
        gradient_accumulation_steps=2,   # Less accumulation needed
        learning_rate=2e-4,
        weight_decay=0.01,
        logging_steps=5,
        save_steps=50,
        warmup_steps=50,
        lr_scheduler_type="cosine",
        optim="adamw_torch",
        fp16=True,                       # Use half precision
        dataloader_pin_memory=True,      # GPU optimization
        remove_unused_columns=False,
        report_to=None,
    )
    
    data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
        data_collator=data_collator,
        tokenizer=tokenizer,
    )
    
    print("🏋️ Starting GPU training (should take 10-20 minutes)...")
    trainer.train()
    
    print("💾 Saving fine-tuned model...")
    trainer.save_model("./deepseek-sports-gpu-final")
    tokenizer.save_pretrained("./deepseek-sports-gpu-final")
    
    print("✅ GPU fine-tuning complete!")
    print("🎯 Next: Run convert_to_hf.py to prepare for GGUF conversion")

if __name__ == "__main__":
    main()
EOF

echo ""
echo "✅ Desktop GPU setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Run: source .venv/bin/activate"
echo "2. Run: cd scripts && python fine_tune_trainer_gpu.py"
echo "3. Wait 10-20 minutes for GPU training ⚡"
echo "4. Convert to GGUF and test on iOS!"
echo ""
echo "🔥 With your RX 9070 XT 16GB, this should be MUCH faster!"