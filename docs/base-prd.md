# AI COMMS STUDIO — Product Requirements Document
**Option A: Focused Wizard**
Version 1.0 | June 2026

---

## Table of contents

1. [Product overview](#1-product-overview)
2. [Screen map](#2-screen-map)
3. [Step 1 — Draft](#3-step-1--draft)
4. [Step 2 — Refine](#4-step-2--refine)
5. [Step 3 — Finalize](#5-step-3--finalize)
6. [Non-functional requirements](#6-non-functional-requirements)
7. [Out of scope (v1)](#7-out-of-scope-v1)

---

## 1. Product overview

| Attribute | Detail |
|---|---|
| **Purpose** | Enable internal users to convert raw event transcripts into polished, channel-ready content via a guided 3-step AI workflow: Draft → Refine → Finalize. |
| **Layout pattern** | Single-column wizard. Max-width 680px, centered. Step progress bar pinned at top of each screen. One primary action per screen. |
| **Target users** | Internal comms, marketing, and content teams. First-time users and occasional contributors — not power users. |
| **Entry point** | Intro/landing screen with a single CTA: "Get started". Brief description: "Convert your transcript to final output in 3 steps." |
| **Step gating** | Steps 2 and 3 are locked until the prior step completes. User cannot jump ahead. Back navigation is always allowed without data loss. |
| **State persistence** | All form data, draft content, and selected options must persist in React state (or sessionStorage) for the full session. Back navigation must not lose data. |

### Priority legend

| Label | Meaning |
|---|---|
| **Must have** | Required for v1 launch. Blocking. |
| **Should have** | High value; include if capacity allows. |
| **Nice to have** | Low effort / low risk enhancement. Defer if needed. |
| **Future** | Intentionally out of scope for v1. |

---

## 2. Screen map

| Screen | Name | Description |
|---|---|---|
| Screen 0 | Landing / intro | Product description + "Get started" CTA |
| Screen 1 | Step 1 — Draft | Transcript input, channel, tone, metadata → "Generate draft" |
| Screen 2 | Step 2 — Refine | 3 AI draft tabs, adjustment chips, apply → "Review final" |
| Screen 3 | Step 3 — Finalize | Final preview, quality checklist → "Push to CMS" or "Back to adjust" |

---

## 3. Step 1 — Draft

### User stories and acceptance criteria

---

#### US-101 · Paste transcript `Must have`

**As a user**, I can paste raw event notes into a text area so that I can provide the source content for conversion.

**Acceptance criteria:**
- Text area is visible on page load with placeholder: "Paste your event notes or transcript here…"
- Text area accepts a minimum of 10,000 characters.
- Character count is shown below the field (e.g. "1,240 characters").
- If the field is empty on submit, an inline error appears: "Add your transcript to continue."

---

#### US-102 · Upload file `Must have`

**As a user**, I can upload a file instead of pasting, so that I don't have to copy content manually.

**Acceptance criteria:**
- Upload zone supports drag-and-drop and click-to-browse.
- Accepted formats: `.txt`, `.pdf`, `.docx`.
- On successful upload, file contents populate the text area automatically.
- On unsupported format: "That file type isn't supported. Upload a .txt, .pdf, or .docx file."
- Max file size: 5MB. If exceeded: "File is too large. Keep it under 5MB."

---

#### US-103 · Select target channel `Must have`

**As a user**, I can select a target channel so that the AI tailors the output format and tone to the destination platform.

**Acceptance criteria:**
- Dropdown with exactly 3 options: "LinkedIn", "Blog post / website", "Internal email".
- Default selection: none. Field shows placeholder: "Select a channel".
- If not selected on submit: "Choose a target channel to continue."
- Selected value is passed as context to the AI prompt.

---

#### US-104 · Select content tone `Must have`

**As a user**, I can select a content tone so that the output matches the intended voice.

**Acceptance criteria:**
- Dropdown with 3 options: "Professional", "Enthusiastic", "Executive summary".
- Default: none. Placeholder: "Select a tone".
- If not selected on submit: "Choose a tone to continue."
- Selection is passed as context to the AI prompt.

---

#### US-105 · Fill event metadata `Should have`

**As a user**, I can fill in optional event metadata so that the AI can reference accurate event details in the content.

**Acceptance criteria:**
- Fields: Date (date picker), Title (text), Venue / Platform (text), Authors (text, comma-separated), Related links (URL).
- All fields are optional — no validation error if left blank.
- If populated, each field is included in the AI system prompt as structured context.
- If blank, the field is omitted from the prompt entirely (not sent as empty string).

---

#### US-106 · Generate draft `Must have`

**As a user**, I can click "Generate draft" to send my inputs to the AI and proceed to Step 2.

**Acceptance criteria:**
- Button is labelled "Generate draft" with a right-arrow icon.
- On click: validate required fields (transcript, channel, tone). Surface inline errors if any are missing.
- If valid: button changes to loading state ("Generating…" + spinner). All fields become read-only.
- AI call generates 3 distinct draft variants.
- On success: navigate to Step 2 with all drafts loaded.
- On API error: restore form to editable state, show banner: "Something went wrong. Try again."

---

### Step 1 · Component states

| State | Behaviour |
|---|---|
| Upload zone — idle | Dashed border, upload icon, helper text with file-browse link. |
| Upload zone — drag over | Border changes to `--border-accent`, background tints to `--bg-accent`. |
| Upload zone — success | Shows filename + file size. Text area populates. Option to clear / re-upload. |
| Generate draft — idle | Brand-filled button, active. |
| Generate draft — loading | "Generating…" + spinner. `pointer-events: none` on all inputs. |
| Generate draft — error | Inputs restore. Banner: "Something went wrong. Try again." with retry button. |

---

## 4. Step 2 — Refine

### User stories and acceptance criteria

---

#### US-201 · View 3 AI drafts `Must have`

**As a user**, I can view the 3 AI-generated drafts in separate tabs so that I can compare and choose the best starting point.

**Acceptance criteria:**
- Three tabs: "Draft 1", "Draft 2", "Draft 3". Default active: Draft 1.
- Each tab displays its draft in a read-only preview area on load.
- Clicking a tab switches the preview without losing content in other tabs.
- Tabs are not editable by default — content is read-only until adjustment is applied.

---

#### US-202 · Apply adjustment `Must have`

**As a user**, I can select an adjustment type and apply it to the current draft so that I can refine the content iteratively.

**Acceptance criteria:**
- Adjustment chips (single-select): "Tone", "Shorten", "Longer", "Dramatic", "Engaging".
- Only one chip may be active at a time. Selected chip uses accent fill.
- "Apply adjustment" button is secondary style. On click: triggers AI call with current draft + selected adjustment type.
- Loading state: button shows "Adjusting…" + spinner. Preview area shows skeleton loader.
- On success: active draft tab content is replaced with the refined version. Previous version is not retained.
- On error: restore previous content. Show inline error below the preview.
- User can apply multiple adjustments sequentially on the same draft.

---

#### US-203 · Edit draft manually `Should have`

**As a user**, I can directly edit the draft text in the preview area so that I can make quick manual corrections without triggering another AI call.

**Acceptance criteria:**
- Preview area transitions from read-only to editable on focus/click.
- Visual indicator (subtle border change) shows the field is editable.
- Manual edits persist within the session and are not overwritten unless "Apply adjustment" is clicked again.

---

#### US-204 · Advance to Step 3 `Must have`

**As a user**, I can click "Review final" to advance to Step 3 with the currently active draft.

**Acceptance criteria:**
- Button labelled "Review final" with right-arrow icon. Brand-filled.
- Carries the content of the currently active draft tab into Step 3.
- No additional AI call is triggered on this transition.
- Step 3 quality checks run server-side after this navigation.

---

#### US-205 · Back to Step 1 `Must have`

**As a user**, I can navigate back to Step 1 without losing my draft or form data.

**Acceptance criteria:**
- Ghost-style "Back to draft" button at bottom-left of Step 2.
- Returns to Step 1 with all previously entered values intact.
- Drafts generated in Step 2 are preserved in state in case user returns.

---

### Step 2 · Component states

| State | Behaviour |
|---|---|
| Draft tab — unselected | Default border, muted text. |
| Draft tab — active | Accent fill background, accent text. |
| Adjustment chip — idle | Hairline border, muted text. |
| Adjustment chip — selected | Accent fill, accent text. |
| Preview — loading | 3-line skeleton loader in preview area while AI call is in progress. |
| No chip selected + Apply clicked | Show inline message below chips: "Select an adjustment type first." |

---

## 5. Step 3 — Finalize

### User stories and acceptance criteria

---

#### US-301 · Review final content `Must have`

**As a user**, I can review the final content in a preview pane so that I can confirm it before publishing.

**Acceptance criteria:**
- Content is displayed in a scrollable, read-only preview pane.
- Content reflects the draft selected in Step 2, with any manual edits applied.
- User can still make inline edits directly in the pane (same pattern as US-203).

---

#### US-302 · View quality checklist `Must have`

**As a user**, I can see a quality checklist so that I know whether the content meets publishing standards before pushing to CMS.

**Acceptance criteria:**
- Checklist is displayed in a sidebar panel to the right of the preview.
- 4 checks, each with a label and a pass (✓ success colour) or fail (✕ danger colour) indicator.
- Default check labels: "Tone match", "Length target", "Keyword density", "Metadata present".
- Checks are evaluated server-side after navigating to Step 3. Show a loading state (spinner next to each item) while evaluation runs.
- Results are final — no auto-refresh. User must go back and re-submit to re-evaluate.

---

#### US-303 · Publish gated by checks `Must have`

**As a user**, "Push to CMS" is disabled until all quality checks pass, so that I can't accidentally publish substandard content.

**Acceptance criteria:**
- "Push to CMS" button is disabled (`opacity` reduced, `cursor: not-allowed`) if any check is failing.
- On hover of the disabled button: tooltip identifies which checks failed. E.g., "Fix keyword density before publishing."
- Button becomes active only when all 4 checks return pass.
- On click (when active): triggers CMS publish API call. Loading state: "Publishing…" + spinner.
- On success: full-screen confirmation state — "Published. Your content is live." — with option to start a new conversion.
- On failure: restore button, show banner: "Couldn't publish. Try again."

---

#### US-304 · Back to Step 2 `Must have`

**As a user**, I can navigate back to Step 2 to make further adjustments without losing my current content.

**Acceptance criteria:**
- Ghost button "Back to adjust" at bottom-left. Returns to Step 2.
- Draft tabs, selected adjustment, and manual edits are restored exactly as left.
- Quality check results are cleared — they will re-run on returning to Step 3.

---

#### US-305 · Copy to clipboard `Nice to have`

**As a user**, I can copy the final content to my clipboard so that I can paste it elsewhere if CMS integration is unavailable.

**Acceptance criteria:**
- "Copy to clipboard" ghost button above the preview pane.
- On click: copies preview text. Button label changes to "Copied" for 2 seconds, then resets.

---

### Step 3 · Component states

| State | Behaviour |
|---|---|
| Checks loading | Spinner next to each checklist item. "Push to CMS" disabled. |
| All checks pass | All items show ✓ in success colour. "Push to CMS" becomes active. |
| 1+ checks fail | Failing items show ✕ in danger colour. "Push to CMS" stays disabled with tooltip. |
| Publishing — loading | "Publishing…" + spinner. Button and back button both disabled. |
| Publishing — success | Full-screen confirmation. "Start a new conversion" link resets to Step 1. |
| Publishing — error | Restore button. Banner: "Couldn't publish. Try again." with retry action. |

---

## 6. Non-functional requirements

### Performance

| Requirement | Target |
|---|---|
| Draft generation | ≤ 15 seconds. Show progress indicator if > 3s. |
| Adjustment AI call | ≤ 10 seconds. |
| Quality check evaluation | ≤ 5 seconds. |
| Page load (Step 1) | Interactive in ≤ 2 seconds on a standard connection. |

### Accessibility

- WCAG 2.1 AA compliance across all screens.
- All interactive elements are keyboard-navigable with visible focus rings.
- Error messages are announced via ARIA live region.
- Step indicator uses ARIA to communicate current step to screen readers.
- All icon-only buttons carry an `aria-label`.

### Responsiveness

- Layout is fully functional from 375px (mobile) to 1280px+ (desktop).
- Metadata fields stack to single column on viewports < 520px.
- Quality checklist moves below the preview pane on mobile.
- No horizontal scroll on any viewport.

### Security and data

- Transcript content must not be logged server-side beyond the active session.
- API keys for the AI provider must never be exposed to the client.
- File uploads must be validated and sanitised server-side before parsing.
- CMS publish call must be authenticated via the user's session token.

### Error handling

- All async operations have a timeout and a corresponding error state.
- Network disconnection during AI call: restore form + persistent banner.
- No blank screens — every error state has a recovery action.
- Console errors must not leak to the UI.

### Theming

- Full light/dark mode support using CSS custom properties only.
- No hardcoded hex values in component styles.
- Mode toggle must not cause layout shift.

---

## 7. Out of scope (v1)

| Feature | Note |
|---|---|
| Multi-user / collaborative editing | Out of scope. Single-user session only in v1. |
| Draft history / saved sessions | Content is session-scoped only. No persistence across sessions in v1. |
| CMS destination selection | v1 assumes a single configured CMS target. No multi-CMS picker. |
| Scheduled publishing | Publish-at-a-time functionality excluded from v1. |
| Undo / redo within a draft | Revision history within a draft excluded from v1. |

---

*Document owner: Product / Design · Last updated: June 2026*
