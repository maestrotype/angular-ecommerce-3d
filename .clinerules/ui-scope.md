# UI task scope

These rules apply when the task is about UI/frontend (especially when a screenshot is attached).

1. SCOPE: When the user attaches a screenshot or describes a UI problem, work ONLY within the frontend/UI layer. Do NOT open, read, or modify backend files, API docs, database schema, or server code unless the user explicitly asks.

2. FIRST STEP: Analyze the screenshot. Identify the exact component/page affected (e.g. a named layout, sidenav, mobile view). List the files you intend to touch BEFORE opening them. If you cannot identify the target files from the screenshot, ask one short clarifying question instead of scanning the repo.

3. NO BREADTH-FIRST EXPLORATION: Do not `find`/`rg`/search the whole repository, do not `git status`, do not read READMEs or unrelated docs, do not open admin/server/backend folders. Read only the specific files named in step 2.

4. MINIMAL TOUCH: Change only the files required for the visible UI fix. Never "improve" unrelated code, never refactor backend or data layers, never touch tests/build config for a UI task.

5. VERIFY: After a UI change, run the frontend build/lint only (e.g. `npm run build` in the Angular app), and confirm the fix against the screenshot, not against backend behaviour.