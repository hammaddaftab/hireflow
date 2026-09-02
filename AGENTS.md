# Project Guidelines & Rules

## UI & Design Guidelines

### Emoji & Icon Policy
- **No Emojis**: Emojis are strictly prohibited across the entire UI and codebase.
- **Icon Usage**:
  - **Permitted**:
    - Action buttons (both icon-only and icon + text, e.g., edit, delete, copy, close).
    - Structural UI component indicators and callouts (e.g., an alert status icon preceding an alert message).
  - **Prohibited**:
    - Inline decorative icons embedded into labels, chips, or text (e.g., logo icons next to tech names like `Python`, or decorative inline symbols). Icons must represent actions or component states, never text decoration.

## Workflow & Verification Policy
- **No Automatic Full Builds / Verification Suites**: Do not run full test suites, coverage reports, or production builds (`npm run build`, `verify-all.sh`) automatically on every task/turn.
- **Explicit Approval Required**: Only run full builds or verification pipelines when the user explicitly requests it or after asking the user and receiving their approval.

## File State & Manual Edits Policy
- **Respect User Modifications**: Whenever the agent detects that the current file state is different from what was previously left off (indicating manual edits, deletions, or styling adjustments by the user), the agent MUST NOT silently overwrite or revert those changes.
- **Ask Before Overwriting/Reverting**: Always explicitly ask the user whether to preserve their manual changes or undo/update them before modifying the affected file sections.
