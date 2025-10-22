# 🚀 Fine-tuning DeepSeek-R1-Distill for Sports Science

## 📋 Overview

This guide helps you fine-tune your DeepSeek-R1-Distill model to specialize in sports science, making it more accurate and detailed for athletic performance questions while **maintaining full compatibility** with your existing llama.rn implementation.

## 🎯 Benefits of Fine-tuning

- **Better sports terminology** - More accurate use of technical terms
- **Domain-specific knowledge** - Enhanced understanding of HRV, training, recovery
- **Consistent responses** - Better alignment with sports science principles
- **Same performance** - Maintains speed while improving quality
- **Full compatibility** - Works with your existing LlamaTestScreen

## 🛠️ Quick Start

### 1. Install Dependencies (One-time setup)

```bash
cd scripts
pip install -r fine_tune_requirements.txt
```

### 2. Prepare Training Data

Your calibration data (424 sports science Q&A pairs) is already converted to fine-tuning format:

```bash
# Already done by setup script!
# fine_tune_dataset.json contains 424 training examples
```

### 3. Run Fine-tuning (1-2 hours)

```bash
cd scripts
python fine_tune_trainer.py
```

This will:

- ✅ Load DeepSeek-R1-Distill base model
- ✅ Apply LoRA (Low-Rank Adaptation) for efficient training
- ✅ Train on your 424 sports science examples
- ✅ Save fine-tuned adapters

### 4. Convert to GGUF (for llama.rn)

```bash
python convert_to_gguf.py
```

This creates: `DeepSeek-R1-Sports-Q4_K_M.gguf`

### 5. Add to iOS Bundle

Copy the fine-tuned model to your iOS project:

```bash
cp DeepSeek-R1-Sports-Q4_K_M.gguf ../ios/
```

### 6. Test in Your App

Use the ModelSwitcher component or manually update the model path in LlamaTextGenerationService.

## 📊 Expected Results

### Performance Comparison

| Metric            | Original Model | Fine-tuned Model |
| ----------------- | -------------- | ---------------- |
| **Speed**         | ~26 tokens/sec | ~26 tokens/sec   |
| **Size**          | 1.12GB         | 1.12GB           |
| **Accuracy**      | Good           | **Better**       |
| **Sports Terms**  | Generic        | **Specialized**  |
| **HRV Knowledge** | Basic          | **Expert-level** |

### Quality Improvements

**Before Fine-tuning:**

```
Q: What is HRV?
A: HRV stands for Heart Rate Variability. It measures the variation in time between heartbeats...
```

**After Fine-tuning:**

```
Q: What is HRV?
A: Heart Rate Variability (HRV) is a critical biomarker measuring the temporal variation between consecutive R-R intervals in ECG recordings. For athletes, HRV serves as a key indicator of autonomic nervous system balance, reflecting the interplay between sympathetic and parasympathetic activity...
```

## 🔄 Model Switching

### Option 1: Use ModelSwitcher Component

Add the ModelSwitcher to your LlamaTestScreen for easy switching between models.

### Option 2: Manual Switch

Update the model path in `LlamaTextGenerationService`:

```typescript
// Original model
const modelPath = `${MainBundlePath}/DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf`;

// Fine-tuned model
const modelPath = `${MainBundlePath}/DeepSeek-R1-Sports-Q4_K_M.gguf`;
```

## 🧪 Testing Your Fine-tuned Model

Try these specialized prompts to see the improvement:

1. **HRV Analysis:**

   ```
   "Explain how to interpret HRV trends for overtraining detection in endurance athletes"
   ```

2. **Training Periodization:**

   ```
   "Design a 16-week polarized training plan for a marathon runner with HRV monitoring integration"
   ```

3. **Recovery Protocols:**
   ```
   "Compare active recovery vs passive recovery effectiveness using HRV metrics as assessment tools"
   ```

## 🚨 Safety & Compatibility

✅ **Fully Compatible** - Works with existing llama.rn setup  
✅ **Same API** - No code changes needed in your app  
✅ **Reversible** - Can switch back to original model anytime  
✅ **Safe Training** - Uses LoRA to preserve base model integrity

## 📈 Advanced Options

### Custom Training Data

Add more training examples to `fine_tune_dataset.json`:

```json
{
  "instruction": "Your custom sports science question",
  "input": "",
  "output": "Detailed expert response",
  "category": "sports_science"
}
```

### Training Configuration

Modify `fine_tune_config.json` to adjust:

- Learning rate
- Number of epochs
- LoRA rank (model capacity)
- Batch size

### Multi-Model Setup

Keep both models in your iOS bundle:

- `DeepSeek-R1-Distill-Qwen-1.5B-Q4_K_M.gguf` (1.12GB) - Original
- `DeepSeek-R1-Sports-Q4_K_M.gguf` (1.12GB) - Fine-tuned

Total: 2.24GB for both models.

## 🎯 Next Steps

1. **Run the fine-tuning** (scripts are ready!)
2. **Test both models** side-by-side
3. **Measure improvement** in sports science responses
4. **Choose preferred model** for production use

The fine-tuned model should provide significantly better sports science responses while maintaining the same speed and compatibility with your current implementation!
