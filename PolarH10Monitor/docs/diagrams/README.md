# PolarH10Monitor — Architecture Diagrams

All diagrams use [Mermaid](https://mermaid.js.org/) syntax.

## How to view

| Tool        | How                                                                                                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GitHub**  | Renders automatically in any `.md` file — just open the file on github.com                                                                                                 |
| **VS Code** | Install [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid), then open any `.md` file and press `Cmd+Shift+V` |
| **Notion**  | Create a code block, set language to `mermaid`, paste the diagram code between the ` ```mermaid ` fences                                                                   |

> GitHub is the easiest — no setup needed, just push and browse.

---

## Diagram Index

| File                                               | Type      | What it shows                                                          |
| -------------------------------------------------- | --------- | ---------------------------------------------------------------------- |
| [01-db-init-recovery.md](01-db-init-recovery.md)   | Sequence  | SQLCipher DB initialisation + stale-key recovery path                  |
| [02-ble-connection.md](02-ble-connection.md)       | Sequence  | BLE scan → connect → HR stream → disconnect                            |
| [03-session-recording.md](03-session-recording.md) | Sequence  | Start → live timer → stop → persist to SQLite                          |
| [04-wipe-flow.md](04-wipe-flow.md)                 | Sequence  | DevScreen full wipe: close DB → clear Keychain → reinitialise → logout |
| [05-app-navigation.md](05-app-navigation.md)       | Flowchart | Screen hierarchy and navigation paths                                  |
| [06-auth-states.md](06-auth-states.md)             | State     | Auth lifecycle: boot → login/signup → logout/wipe                      |
| [07-ble-states.md](07-ble-states.md)               | State     | BLE manager states: Unknown → Ready → Scanning → Connected             |
| [08-database-schema.md](08-database-schema.md)     | ER        | SQLite tables: sessions, summaries, schema_meta                        |
| [09-data-flow.md](09-data-flow.md)                 | Flowchart | End-to-end: Polar H10 → BLE → SQLite → Analytics → AI coach            |
| [10-llm-chat-streaming.md](10-llm-chat-streaming.md) | Sequence + State | LLM init guard, 60 ms token-batching pipeline, ChatMessage render states |
