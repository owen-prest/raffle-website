# raffle-project
This is a website that allows users to enter raffles and view a live draw.

## Engineering & Workflow
I am committed to maintaining a professional development lifecycle to ensure high-quality, maintainable code. Key practices implemented in this project:

* **Feature-Branch Workflow**: All new functionality is developed in isolated branches to maintain a clean, stable codebase.
* **Linear History Management**: I utilize `rebase` over `merge` when updating feature branches to maintain a clean, readable project history.
* **Repository Hygiene**: I treat branches as disposable "scratchpads"—merging completed features into the main development line and pruning remote branches immediately to keep the repository organized.

## Project Setup
- `yarn install`: Install dependencies(including Swiper.js for the carousel).
- `yarn dev`: Compile and Hot-Reload for development.
- `yarn build`: Type-Check, compile, and minify for production.
- `yarn lint`: Lint the project with ESLint.

## Lessons Learned
- **Documentation Standards**: I learned that clear, concise documentation—like maintaining an accurate README.md—is just as critical to project success as the code itself.
- **Dependency Management**: I transitioned from npm to yarn to take advantage of faster dependency locking, ensuring my project remains stable and consistent.
- **Component Scalability**: I learned that hardcoding complex UI components like carousels can be difficult to maintain, so I opted for `Swiper.js` to ensure the layout is cleaner and easier to read.
- **Git Workflow Optimisation**: During production, I learned to prioritize rebasing over merging develop into my feature branches to ensure a linear, clean project history.