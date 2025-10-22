# ONNX Model Conversion Plan

## Current Situation

- Fine-tuned DistilGPT2 model (424 sports science pairs)
- Converted to GGUF format (200MB)
- Working with llama.rn but having prompt engineering issues

## Goal

Convert the fine-tuned DistilGPT2 to ONNX format compatible with React Native ONNX Runtime

## Steps Required

### 1. Analyze Current ONNX Runtime Setup

- Identify which ONNX Runtime packages were used before
- Check what model format/structure was expected
- Review tokenization requirements

### 2. Model Conversion Process

```python
# Convert fine-tuned PyTorch model to ONNX
import torch
from transformers import DistilGPTForSequenceClassification, DistilGPT2Tokenizer
import onnx

# Load your fine-tuned model
model = DistilGPTForSequenceClassification.from_pretrained('./fine-tuned-model')
tokenizer = DistilGPT2Tokenizer.from_pretrained('./fine-tuned-model')

# Export to ONNX
dummy_input = torch.randint(0, 1000, (1, 512))  # Batch size 1, seq len 512
torch.onnx.export(
    model,
    dummy_input,
    "distilgpt2_sports_science.onnx",
    input_names=['input_ids'],
    output_names=['logits'],
    dynamic_axes={
        'input_ids': {0: 'batch_size', 1: 'sequence'},
        'logits': {0: 'batch_size', 1: 'sequence'}
    }
)
```

### 3. ONNX Runtime Integration

- Install: `onnxruntime-react-native`
- Setup tokenizer for preprocessing
- Create inference pipeline

### 4. React Native Implementation

```typescript
import { InferenceSession, Tensor } from 'onnxruntime-react-native';

class ONNXModelService {
  private session: InferenceSession | null = null;

  async initialize() {
    // Load ONNX model from bundle
    this.session = await InferenceSession.create(modelPath);
  }

  async generateResponse(prompt: string) {
    // Tokenize input
    // Run inference
    // Decode output
  }
}
```

## Advantages of ONNX Approach

1. **Mature Ecosystem**: Better React Native support
2. **Performance**: Optimized for mobile inference
3. **Control**: Full control over tokenization and decoding
4. **Debugging**: Easier to debug inference issues
5. **Format Flexibility**: Can handle different input/output formats

## Challenges to Address

1. **Tokenization**: Need to implement tokenizer in React Native
2. **Text Generation**: ONNX models typically do classification, need generation logic
3. **Model Size**: Ensure ONNX model fits mobile constraints
4. **Bundle Integration**: Proper asset bundling for ONNX files

## Next Steps

1. Research React Native ONNX Runtime packages
2. Convert fine-tuned model to ONNX format
3. Implement tokenizer and generation logic
4. Test inference performance
5. Compare with GGUF approach

## Decision Criteria

- **Performance**: Inference speed and memory usage
- **Quality**: Response quality compared to GGUF
- **Maintainability**: Ease of debugging and updates
- **Bundle Size**: Impact on app size
