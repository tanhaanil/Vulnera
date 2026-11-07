# Vulnera
These days, AI coded things have become more difficult to review. To assist the reviewer in security related issues in code, we have introduced **Vulnera**.
**Vulnera** is a blue-and-white, frontend-only security review workspace for the AI coding era. The landing page introduces the purpose of the product and shows **How it works**; clicking the central **Open workspace** button brings reviewers into the original interactive rule-based scanner.

## What's included

### Homepage (`/`)
- Responsive navigation: Home and How it works (same page)
- Hero: **AI writes code. You review the risk.**
- Decorative, clearly labeled example of a possible SQL-injection finding
- Three-step explanation: bring code, spot patterns, make decisions
- A single prominent, centered Open workspace button in the homepage hero; no repeated calls to action
- No standalone About Us page, no fake scan statistics on the homepage

### Workspace (`/workspace`)
- The **same nine detection rules** as the first Vulnera version, preserved in `src/lib/scanner.js`
- Paste code, load sample snippets, or upload a local text source file
- Pattern-based scan, line highlighting, severity badges, explanations, and suggested fixes
- Finding selection/filtering, simulated reviewer and senior reviewer roles
- Decision form (fix, false positive, accept risk) with mandatory reason
- Critical-risk dismissal/acceptance requires **simulated** senior role
- Decision history (`/workspace/history`), CSV export, browser localStorage persistence
- No duplicated review guide: How it works is explained on the homepage only

## Design

- Royal blue `#165BDA`, navy `#10234A`, ice blue `#EAF3FF`, near-white `#F8FBFF`
- Figtree for UI; Source Serif 4 for expressive type; JetBrains Mono for code
- Fonts are fetched from Google Fonts while online; fallback fonts work offline
- Responsive mobile menu and smaller-screen workspace layout

## Run on Windows / VS Code

1. Extract the ZIP (do not run the project inside Windows ZIP preview).
2. Open the extracted folder **Vulnera** using VS Code > File > Open Folder.
3. Open Terminal > New Terminal and run:

   ```powershell
   npm install
   npm run dev
   ```

4. Open the **Local:** address printed in the terminal (usually `http://localhost:5173/`).

To run the existing scanner tests:

```powershell
npm test
```

To check the production bundle:

```powershell
npm run build
```

## Important limitations and further enhancement

Vulnera is a **rule-based frontend prototype**, not AI-powered scanning or a comprehensive security audit. It can miss genuine issues and may flag safe code. So, further enhancement can be done on integration of rule-based program and AI to have full functionality.


