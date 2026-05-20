# Execution Log

## 2026-05-20

- Task created for updating the frontend question cards.
- Milestone 1 started: inspect the current card definitions and locate every affected page.
- Verification approach: source inspection plus a regression test for the expected question card copy.
- BDD: Render the updated 10 question cards consistently -> Given the main chat entry and chat page both expose starter question cards / When the user opens either page / Then the UI should show the same 10 updated card titles and prompts provided for this task
- Milestone 1 completed:
  - Affected files identified: `src/App.tsx` and `src/pages/ChatPage.tsx`
  - Both files contained separate hardcoded card blocks with only 5 cards and legacy copy
- RED: `npm test` -> FAIL, missing shared question card definitions required by the new regression test
- Milestone 2 completed:
  - Added `tests/question-cards.test.cjs` to lock the expected 10-card copy and require both pages to reuse one shared source
- Milestone 3 completed:
  - Added shared card definitions in `src/data/questionCards.json`
  - Updated `src/App.tsx` and `src/pages/ChatPage.tsx` to render cards from the shared definition
  - GREEN: `npm test` -> PASS
  - GREEN: `npm run typecheck` -> PASS
  - GREEN: `rg -n "A股/港股快速查询|请帮我拆解 \[公司名称/代码\]|帮我做一下 \[公司名称/代码\]|\[公司名称/代码\] 过去4年和10年" src` -> PASS
