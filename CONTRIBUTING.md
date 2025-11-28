# Contributing to Plinqy

Thank you for your interest in contributing to Plinqy. This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or bugfix
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- Git

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Start Docker services:
```bash
docker-compose up -d
```

4. Run migrations:
```bash
cd backend
npm run migration:run
```

## Coding Standards

### General Guidelines

- Write clean, readable code
- Follow existing code style and patterns
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable and function names

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid using `any` type
- Use strict mode

### Naming Conventions

- Files: kebab-case (e.g., `user-service.ts`)
- Classes: PascalCase (e.g., `UserService`)
- Functions/Variables: camelCase (e.g., `getUserById`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- Database fields: snake_case (e.g., `created_at`)

### Git Commit Messages

Write clear and descriptive commit messages:

```
Type: Brief description

Detailed explanation if needed

Examples:
- feat: Add user authentication
- fix: Resolve database connection timeout
- docs: Update README installation steps
- refactor: Simplify product search logic
- test: Add unit tests for store service
```

Commit types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update the README.md if needed
5. Create a pull request with a clear title and description
6. Link any related issues
7. Wait for code review

### Pull Request Guidelines

- One feature or fix per pull request
- Keep changes focused and atomic
- Include tests for new functionality
- Update documentation as needed
- Ensure CI/CD pipeline passes

## Code Review

All submissions require review. We use GitHub pull requests for this purpose.

Reviewers will check for:
- Code quality and readability
- Test coverage
- Documentation
- Performance implications
- Security concerns

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests for specific package
cd backend
npm run test

# Run tests in watch mode
npm run test:watch
```

### Writing Tests

- Write unit tests for new functions
- Write integration tests for API endpoints
- Maintain or improve test coverage
- Use descriptive test names

## Database Changes

When modifying the database schema:

1. Create a new migration:
```bash
cd backend
npx prisma migrate dev --name describe_your_change
```

2. Update the Prisma schema
3. Document the changes
4. Test the migration

## Reporting Issues

### Bug Reports

Include:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
- Screenshots if applicable

### Feature Requests

Include:
- Description of the feature
- Use case and benefits
- Proposed implementation (optional)

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what is best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

## Questions

If you have questions, please open an issue or discussion on GitHub.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
