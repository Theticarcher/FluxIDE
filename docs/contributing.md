# Contributing to FluxIDE

Thank you for your interest in contributing to FluxIDE! This guide will help you get started.

## Code of Conduct

Please be respectful and constructive in all interactions. We want FluxIDE to be a welcoming project for everyone.

## Ways to Contribute

### Bug Reports

Found a bug? Please open an issue with:
- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your OS and FluxIDE version
- Screenshots if applicable

### Feature Requests

Have an idea? Open an issue with:
- A clear description of the feature
- Use cases and benefits
- Mockups or examples if possible

### Code Contributions

Want to contribute code? Follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Development Setup

### Prerequisites

See [Building from Source](building.md) for required tools.

### Getting Started

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/fluxide.git
cd fluxide

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/fluxide.git

# Install dependencies
npm install

# Start development
npm run tauri dev
```

### Branch Naming

Use descriptive branch names:
- `feature/add-search-panel`
- `fix/terminal-resize-bug`
- `docs/update-readme`

## Project Structure

### Frontend (React + TypeScript)

```
src/
├── components/          # UI components
│   ├── Editor/          # Monaco editor integration
│   ├── FileExplorer/    # File tree component
│   ├── Layout/          # App layout components
│   ├── Preview/         # Live preview panel
│   └── Terminal/        # Terminal integration
├── hooks/               # Custom React hooks
├── stores/              # Zustand state stores
└── types/               # TypeScript type definitions
```

### Backend (Rust + Tauri)

```
src-tauri/src/
├── commands/            # Tauri command handlers
│   ├── file_system.rs   # File operations
│   ├── compiler.rs      # Flux compiler integration
│   └── terminal.rs      # PTY terminal
├── lib.rs               # App setup and configuration
└── main.rs              # Binary entry point
```

## Code Style

### TypeScript/React

- Use functional components with hooks
- Use TypeScript strict mode
- Format with Prettier (run `npm run format` if configured)
- Follow existing naming conventions

```typescript
// Good
export function MyComponent({ prop }: MyComponentProps) {
  const [state, setState] = useState<string>("");

  const handleClick = useCallback(() => {
    // ...
  }, []);

  return <div onClick={handleClick}>{state}</div>;
}

// Avoid
export default class MyComponent extends React.Component { ... }
```

### Rust

- Follow Rust idioms and conventions
- Use `cargo fmt` to format code
- Use `cargo clippy` to catch common issues
- Handle errors properly with `Result`

```rust
// Good
pub async fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

// Avoid
pub async fn read_file(path: String) -> String {
    std::fs::read_to_string(&path).unwrap()
}
```

## Testing

### Frontend

```bash
# Run tests (when configured)
npm test
```

### Backend

```bash
cd src-tauri
cargo test
```

### Manual Testing

Before submitting a PR, test:
1. Opening folders
2. Editing and saving files
3. Syntax highlighting for .flux files
4. Terminal functionality
5. Preview panel (for .flux files)
6. Keyboard shortcuts

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Changes are tested locally
- [ ] Documentation is updated if needed
- [ ] Commit messages are clear and descriptive

### PR Description

Include:
- What changes were made
- Why the changes were needed
- How to test the changes
- Screenshots for UI changes

### Review Process

1. Maintainers will review your PR
2. Address any feedback
3. Once approved, your PR will be merged

## Documentation

### Adding Documentation

- Add new docs to `docs/`
- Update the README if needed
- Use clear, concise language
- Include examples where helpful

### Documentation Style

- Use Markdown
- Include code examples
- Add screenshots for UI features
- Keep sections focused and scannable

## Release Process

Releases are created by maintainers:

1. Update version with `./scripts/release.sh X.Y.Z`
2. Create and push a git tag
3. GitHub Actions builds all platforms
4. Review and publish the draft release

## Getting Help

- Open a [Discussion](https://github.com/yourusername/fluxide/discussions) for questions
- Join our community chat (if available)
- Check existing issues and PRs

## Recognition

Contributors are recognized in:
- The project's README
- Release notes
- The contributors page

Thank you for contributing to FluxIDE!
