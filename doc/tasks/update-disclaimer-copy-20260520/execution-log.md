# Execution Log

## 2026-05-20

- Task created for updating the frontend disclaimer copy.
- Milestone 1 started: inspect current disclaimer locations and compare visible text.
- BDD: Show the updated disclaimer consistently -> Given the user opens any frontend surface that shows a disclaimer / When the disclaimer text is rendered / Then it should match the user-provided legal statement exactly and stay consistent across the affected entry points
- Milestone 1 completed:
  - Visible disclaimer locations confirmed in `src/App.tsx`, `src/pages/ChatPage.tsx`, and `src/components/HowToAskAI.tsx`
  - Existing copy was duplicated and inconsistent across entry points
- RED: `npm test` -> FAIL, missing shared disclaimer copy source required by the new regression test
- Milestone 2 completed:
  - Updated `tests/question-cards.test.cjs` to require a shared disclaimer source and shared usage in the three affected files
- Milestone 3 completed:
  - Added `src/data/disclaimerText.ts`
  - Updated `src/App.tsx`, `src/pages/ChatPage.tsx`, and `src/components/HowToAskAI.tsx` to reuse the shared disclaimer copy
  - Adjusted `chatTheme.subtitle` for readable wrapping of the longer disclaimer in the chat headers
  - GREEN: `npm test` -> PASS
  - GREEN: `npm run typecheck` -> PASS
  - GREEN: `npm run build` -> PASS with existing webpack bundle size warnings only
  - Cleanup apply: removed task-scoped `frontend-feature-evidence.md` after validation, preserving `task.md` and `execution-log.md`
