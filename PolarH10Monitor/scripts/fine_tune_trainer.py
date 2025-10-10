#!/usr/bin/env python3
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
