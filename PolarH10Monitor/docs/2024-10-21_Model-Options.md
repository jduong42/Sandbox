## Smaller Model Exploration Plan

### Immediate Next Steps

#### 4.1: Test SmolLM2-135M-Instruct (Most Promising)

- **Size**: ~300MB (20x smaller than current)
- **Action**: Download and test with sports science prompts
- **Timeline**: 1-2 hours to evaluate
- **Risk**: Low - just testing

#### 4.2: Try Qwen2.5-0.5B-Instruct (Conservative)

- **Size**: ~2GB (3x smaller than current)
- **Action**: Same architecture, proven smaller version
- **Timeline**: 2-3 hours to test
- **Risk**: Low - same model family

#### 4.3: Evaluate TinyLlama-1.1B (Balanced)

- **Size**: ~600MB (10x smaller)
- **Action**: Popular small model, good community support
- **Timeline**: 2-3 hours to test
- **Risk**: Low - well-tested model

### Testing Protocol

1. **Download model** in ONNX format
2. **Test with your 5 prompts** from comparison script
3. **Evaluate responses** for:
   - Sports science accuracy
   - HRV knowledge retention
   - Response coherence
   - Hallucination frequency

### Decision Matrix

| Model             | Size       | Quality  | iOS Fit    | Complexity | Recommendation      |
| ----------------- | ---------- | -------- | ---------- | ---------- | ------------------- |
| SmolLM2-135M      | ⭐⭐⭐⭐⭐ | ⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Test First**      |
| Qwen2.5-0.5B      | ⭐⭐⭐     | ⭐⭐⭐⭐ | ⭐⭐⭐     | ⭐⭐⭐⭐   | **Safe Option**     |
| TinyLlama-1.1B    | ⭐⭐⭐⭐   | ⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   | **Balanced**        |
| Current Quantized | ⭐⭐⭐⭐   | ⭐⭐     | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | **Not Recommended** |

### Advantages of Option 4

✅ **Immediate results** - Test today, decide tomorrow
✅ **No training required** - Use pre-trained models  
✅ **Low risk** - Easy to test and compare
✅ **Proven models** - Used by thousands of developers
✅ **iOS-friendly sizes** - All under 2GB

### Next Action

**Recommend starting with SmolLM2-135M-Instruct** because:

- Only 300MB (perfect for iOS)
- Modern architecture (2024 model)
- Designed for efficiency
- Quick to test and evaluate
