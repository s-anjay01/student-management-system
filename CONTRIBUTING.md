# Contributing to EduManage

Thank you for your interest in improving the Student Management System! Here are simple steps to help you get started:

## Development Workflow

1. **Fork the Repository**:
   Click the Fork button at the top right of this GitHub repo.

2. **Clone your Fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/student-management-system.git
   cd student-management-system
   ```

3. **Install Dependencies**:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

4. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/my-new-feature
   ```

5. **Commit your Changes**:
   Make sure to write clear, meaningful commit messages:
   ```bash
   git commit -m "feat: add course filter to student list"
   ```

6. **Push and Open a Pull Request**:
   ```bash
   git push origin feature/my-new-feature
   ```
   Open a pull request on GitHub describing the changes you made.

## Code Standards
- Keep components modular and reusable under `client/src/components/`.
- Validate all incoming user input on both client and backend routes.
- Ensure all existing routes in `server/index.js` remain functional.
