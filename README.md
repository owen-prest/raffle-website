# raffle-project
This is a website that allows users to enter raffles and view a live draw.

## Engineering & Workflow
I’m focused on keeping the codebase healthy and maintainable as the project grows. Here is how I handle the day-to-day development:

* **Feature-Branch Workflow**: I work on new features in their own isolated branches. This keeps the main code stable and lets me experiment without breaking anything.
* **Keeping History Clean**: Instead of messy merges, I prefer to `rebase` my branches. It keeps the project history looking like a straight, easy-to-read line.
* **Repository Hygiene**: I treat branches as temporary workspaces. Once a feature is done and merged into the main line, I clean up the old branch immediately to keep things tidy.

## 🛠️ Architecture & Development Lessons

### 1. TypeScript & JavaScript Interoperability (Module Declarations)
**Challenge:** When managing global configuration data (like application navigation) in a standard JavaScript file (`.js`), strict TypeScript environments throw implicit `any` type errors upon import. Shifting types with hacky bridges like `as unknown as Type[]` inside Vue components leads to messy, unmaintainable code.

**Solution:** Implemented a formal TypeScript declaration contract (`.d.ts`) using a `declare module` block. This maps the JavaScript data source directly to strongly-typed interfaces:

```typescript
// src/constants/navigation.d.ts
declare module '@/constants/navigation' {
  export interface NavItem {
    label: string;
    icon: string;
    path: string;
    badge?: number;
  }
  export const navLinks: NavItem[];
}
```

## Project Setup
*   `yarn install`: Install dependencies (including Swiper.js for the carousel).
*   `yarn dev`: Compile and Hot-Reload for development.
*   `yarn build`: Type-Check, compile, and minify for production.
*   `yarn lint`: Lint the project with ESLint.

## Lessons Learned
*   **Documentation Matters**: I realized that keeping the README up to date is just as important as writing the code—it’s how I (and anyone else) can actually understand what's going on later.
*   **Why Yarn?**: I switched from npm to Yarn because I liked how it locks dependencies. It makes the project feel much more stable across different environments.
*   **Choosing the Right Tools**: I tried hardcoding a carousel at first, but it got complicated fast. Switching to `Swiper.js` made the layout much cleaner and way easier to maintain.
*   **Git Workflow Gotchas**: I had to learn the hard way about mixing `merge` and `rebase`!
    *   **The Fix**: I now stick to `rebase` to keep my branch history linear.
    *   **Safe Pushes**: I learned that if you rebase, you have to use `--force-with-lease`. It’s a safer way to push that ensures you don't accidentally overwrite someone else's work.
    *   **No More "Merge Bubbles"**: If I accidentally merge `develop` into my feature branch, I now know how to use `rebase` to clean up the graph instead of leaving those confusing "bubbles" in the commit history.