# WCAG 2.1 AA Accessibility Coverage

## ✅ Fully Automatable with axe-core

| **SC** | **Description** | **axe-core Coverage** |
|--------|-----------------|------------------------|
| 1.1.1 | Non-text Content (alt text for images/icons) | Yes |
| 1.3.1 | Info and Relationships (semantic structure, ARIA roles) | Yes |
| 1.3.2 | Meaningful Sequence (DOM order) | Yes |
| 1.4.3 | Contrast (Minimum) | Yes |
| 1.4.6 | Contrast (Enhanced) | Yes |
| 1.4.10 | Reflow (viewport zoom) | Yes |
| 2.4.4 | Link Purpose (In Context) | Yes |
| 2.4.6 | Headings and Labels | Yes |
| 3.1.1 | Language of Page | Yes |
| 3.1.2 | Language of Parts | Yes |
| 4.1.1 | Parsing (valid HTML, no duplicate IDs) | Yes |
| 4.1.2 | Name, Role, Value (ARIA validity) | Yes |
| 4.1.3 | Status Messages (aria-live regions) | Partial |

## ⚠ Hybrid (Automation + Manual/Scripted)

| **SC** | **Description** | **Why Hybrid?** |
|--------|-----------------|-----------------|
| 2.1.1 | Keyboard | Axe flags tabindex issues; full operability needs scripted tests |
| 2.1.2 | No Keyboard Trap | Axe detects some traps; confirm with Playwright navigation |
| 2.4.3 | Focus Order | Axe checks hidden focusable elements; logical order needs manual/scripted validation |
| 2.4.7 | Focus Visible | Axe cannot verify visual styling; manual visual check required |
| 3.3.1 | Error Identification | Axe checks missing labels; verify error messages appear and are announced |
| 1.4.11 | Non-Text Contrast | Axe partially checks; manual confirmation for custom UI components |
| 1.4.12 | Text Spacing | Requires manual CSS inspection |
| 1.4.13 | Content on Hover/Focus | Axe flags some issues; manual check for dismissibility and persistence |

## 👀 Manual Only

| **SC** | **Description** |
|--------|-----------------|
| 1.2.x | Time-based Media (captions, audio descriptions) |
| 1.3.4 | Orientation (support portrait/landscape) |
| 1.3.5 | Identify Input Purpose |
| 2.2.x | Timing Adjustable |
| 2.4.1 | Bypass Blocks (skip links, landmarks) |
| 2.5.x | Pointer Gestures, Target Size |
| 3.2.x | Predictable (on focus/input behavior consistency) |
| 3.3.4 | Error Prevention (Legal, Financial, Data) |
| Screen Reader Compatibility | JAWS/NVDA tests for announcement order, verbosity, dynamic updates |
