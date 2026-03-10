# LLM Chat — Streaming Pipeline

Covers model initialisation (with lazy-load guard), the token streaming loop,
the 60 ms batched-flush render strategy, and the three render states of
`ChatMessage`.

## Model initialisation

```mermaid
sequenceDiagram
    participant Nav as Navigation
    participant Screen as FigmaAIChatScreen
    participant Llama as LlamaTextGenerationService
    participant Native as llama.rn (native)
    participant GPU as Metal GPU

    Nav->>Screen: mount (user taps Chat tab)

    Screen->>Llama: initialize()

    alt already initialised (guard: isInitialized && context)
        Llama-->>Screen: true (immediate return — no I/O)
    else first call
        Llama->>Native: initLlama({ model, n_ctx:2048, n_threads:6,\nn_batch:512, n_gpu_layers:-1, use_mmap:true })
        Native->>GPU: offload all layers to Metal
        GPU-->>Native: layers loaded
        Native-->>Llama: LlamaContext handle
        Llama->>Llama: isInitialized = true
        Llama-->>Screen: true
    end

    Screen->>Screen: setIsModelReady(true)
```

## Message send & streaming render

```mermaid
sequenceDiagram
    participant User
    participant Screen as FigmaAIChatScreen
    participant Ref as accumulatedRef\n(in-memory string)
    participant Timer as flushTimer\n(60 ms interval)
    participant State as React state\n(messages[])
    participant Llama as LlamaTextGenerationService
    participant Msg as ChatMessage

    User->>Screen: tap Send

    Screen->>Screen: append placeholder message\n{ id, role:'assistant', content:'', isStreaming:true }
    Screen->>Ref: accumulatedRef.current = ''
    Screen->>Timer: setInterval(flush, 60ms)

    Screen->>Llama: generateTextStreaming(prompt, config, onToken)

    loop for each generated token (~10 tok/s)
        Llama-->>Screen: onToken(token)
        Screen->>Ref: accumulatedRef.current += token
        note over Ref: No React state update per token
    end

    loop every 60 ms while streaming
        Timer->>Screen: flush()
        Screen->>State: setMessages — update assistant message\ncontent = parseJsonResponse(accumulatedRef)
        State-->>Msg: re-render
        note over Msg: isStreaming=true → renders plain <Text>\n(avoids expensive Markdown parse on partial content)
    end

    Llama-->>Screen: completion done (LlamaGenerationResult)
    Screen->>Timer: clearInterval
    Screen->>State: setMessages — isStreaming = false\ncontent = final parsed text
    State-->>Msg: final re-render
    note over Msg: isStreaming=false → renders <Markdown>\n(full formatting applied once)
```

## ChatMessage render states

```mermaid
stateDiagram-v2
    [*] --> Thinking : message appended\n(content = '')

    Thinking : isStreaming=true\ncontent=''
    Thinking --> Streaming : first token arrives\n(content ≠ '')

    Streaming : isStreaming=true\ncontent ≠ ''
    note right of Streaming
        Renders plain &lt;Text&gt; + cursor ▌
        No Markdown parser — avoids
        jank on partial content
    end note

    Streaming --> Done : generation complete\n(isStreaming=false)

    Done : isStreaming=false
    note right of Done
        Renders &lt;Markdown&gt;
        Full formatting applied
        once on stable content
    end note
```

## Key design decisions

| Decision | Reason |
|---|---|
| `accumulatedRef` instead of state per token | Avoids ~300 React re-renders per reply; ref write is synchronous and free |
| 60 ms flush interval (~12 renders per reply) | Smooth enough for perception; coarse enough to batch many tokens per render |
| Plain `<Text>` while streaming | `react-native-markdown-display` parses the full string on every render — too expensive on incomplete/changing content |
| `<Markdown>` only once done | Content is stable; one parse pass produces correct formatting |
| `n_gpu_layers: -1` (Metal offload) | ~10.7 tok/s vs ~5.1 tok/s CPU-only on A-series — 2× throughput |
| Init guard (`isInitialized && context`) | 3B model loads once when Chat tab is first opened; re-navigation is free |
| `use_mmap: true` | Model pages loaded on demand from bundle; lower peak memory vs full `mlock` |
