# Contributing to CodeCraft

First off, thank you for considering contributing to CodeCraft! It's people like you that make CodeCraft such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful
* List some other applications where this enhancement exists

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible
* Follow our coding standards
* Document new code
* End all files with a newline

## Development Process

1. Fork the repo
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run the tests
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/codecraft.git

# Navigate to the project directory
cd codecraft

# Install dependencies
npm install

# Start development server
npm run dev
```

### Project Structure

```
codecraft/
├── extension/          # Browser extension files
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── content.js
│   └── background.js
├── website/           # Main website
│   ├── css/
│   ├── js/
│   └── server/
├── docs/             # Documentation
└── tests/            # Test files
```

## Coding Standards

### JavaScript

* Use ES6+ features
* Use meaningful variable names
* Add comments for complex logic
* Follow airbnb style guide
* Use async/await for promises

### HTML

* Use semantic HTML elements
* Include ARIA labels for accessibility
* Keep markup clean and minimal

### CSS

* Follow BEM naming convention
* Use Tailwind CSS utility classes
* Keep specificity low
* Maintain responsive design principles

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

## Testing

* Write unit tests for new features
* Ensure all tests pass before submitting PR
* Include integration tests where necessary
* Test across different browsers

## Documentation

* Update README.md with details of changes to the interface
* Update GUIDE.md with any necessary new instructions
* Add JSDoc comments for new functions
* Update API documentation if endpoints change

## Review Process

The core team looks at Pull Requests on a regular basis. After feedback has been given we expect responses within two weeks. After two weeks we may close the pull request if it isn't showing any activity.

## Community

* Join our Discord server
* Follow us on Twitter
* Subscribe to our newsletter
* Participate in discussions on GitHub

## Questions?

If you have any questions, please feel free to contact the project maintainers.

Thank you for contributing to CodeCraft! 🚀
