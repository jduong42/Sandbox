#!/usr/bin/env python3
"""
Fine-tune DeepSeek-R1-Distill with LoRA using standard transformers
Compatible with Python 3.13 and macOS
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

def load_model_and_tokenizer():
    """Load the base model with LoRA configuration"""
    
    print("📥 Loading DeepSeek-R1-Distill model and tokenizer...")
    
    model_name = "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B"
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    
    # Add pad token if it doesn't exist
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    # Load model
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        device_map="auto" if torch.cuda.is_available() else None,
        trust_remote_code=True
    )
    
    # Configure LoRA
    lora_config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        inference_mode=False,
        r=16,                    # Rank
        lora_alpha=32,          # LoRA scaling parameter
        lora_dropout=0.1,       # Dropout for regularization
        target_modules=[
            "q_proj", "k_proj", "v_proj", "o_proj",  # Attention layers
            "gate_proj", "up_proj", "down_proj"       # MLP layers
        ]
    )
    
    # Add LoRA adapters to model
    model = get_peft_model(model, lora_config)
    
    print(f"✅ Model loaded with LoRA adapters")
    print(f"📊 Trainable parameters: {model.num_parameters()} / {model.num_parameters(only_trainable=False)}")
    
    return model, tokenizer

def format_prompts(examples, tokenizer):
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
    
    # Tokenize the texts
    tokenized = tokenizer(
        texts,
        truncation=True,
        padding=False,
        max_length=1024,  # Smaller context for faster training
        return_tensors=None
    )
    
    # Add labels (copy of input_ids for causal LM)
    tokenized["labels"] = tokenized["input_ids"].copy()
    
    return tokenized

def main():
    """Main fine-tuning process"""
    
    print("🚀 Starting DeepSeek-R1-Distill fine-tuning...")
    
    # Check if dataset exists
    if not os.path.exists("fine_tune_dataset.json"):
        print("❌ fine_tune_dataset.json not found. Run fine_tune_setup.py first.")
        return
    
    # Load model and tokenizer
    print("📥 Loading model and tokenizer...")
    try:
        model, tokenizer = load_model_and_tokenizer()
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return
    
    # Load dataset
    print("📊 Loading training dataset...")
    with open("fine_tune_dataset.json", "r") as f:
        data = json.load(f)
    
    print(f"📋 Dataset size: {len(data)} examples")
    
    # Create dataset
    dataset = Dataset.from_list(data)
    
    # Format and tokenize
    print("🔄 Tokenizing dataset...")
    tokenized_dataset = dataset.map(
        lambda examples: format_prompts(examples, tokenizer),
        batched=True,
        remove_columns=dataset.column_names
    )
    
    # Data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False,  # We're doing causal LM, not masked LM
    )
    
    # Training arguments - optimized for macOS/CPU
    training_args = TrainingArguments(
        output_dir="./deepseek-sports-lora",
        overwrite_output_dir=True,
        num_train_epochs=2,              # Fewer epochs for faster training
        per_device_train_batch_size=1,   # Small batch size for CPU/limited memory
        gradient_accumulation_steps=8,   # Accumulate gradients to simulate larger batch
        learning_rate=2e-4,
        weight_decay=0.01,
        logging_steps=10,
        save_steps=100,
        save_total_limit=2,
        prediction_loss_only=True,
        remove_unused_columns=False,
        dataloader_pin_memory=False,     # Better for CPU training
        dataloader_num_workers=0,        # Single-threaded for stability
        warmup_steps=50,
        lr_scheduler_type="cosine",
        optim="adamw_torch",             # Standard AdamW optimizer
        report_to=None,                  # Disable wandb logging
        run_name="deepseek-sports-finetune",
    )
    
    # Create trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
        data_collator=data_collator,
        tokenizer=tokenizer,
    )
    
    # Start training
    print("🏋️ Starting training...")
    print("⏱️  This may take 30-60 minutes on CPU...")
    
    try:
        trainer.train()
        
        # Save the fine-tuned model
        print("💾 Saving fine-tuned model...")
        trainer.save_model("./deepseek-sports-lora-final")
        tokenizer.save_pretrained("./deepseek-sports-lora-final")
        
        print("✅ Fine-tuning complete!")
        print("📁 Model saved to: ./deepseek-sports-lora-final")
        
    except Exception as e:
        print(f"❌ Training failed: {e}")
        return
    
    print("\n🎯 Next step: Convert to GGUF format using convert_to_gguf.py")

if __name__ == "__main__":
    main()