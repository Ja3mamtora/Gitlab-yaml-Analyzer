# GitLab YAML Analyzer

GitLab YAML Analyzer is a ReactJS-based web application that provides insights into GitLab CI/CD pipeline configurations. This tool parses your GitLab `.gitlab-ci.yml` file and extracts detailed information, such as the number of stages, presence of secrets management (Vault), signing, sub-stages, and more. It helps developers and DevOps teams quickly understand the structure and security features of their GitLab CI pipelines.

---

## Features
- **Stage Count**: Displays the total number of stages defined in the GitLab CI pipeline.
- **Vault Integration**: Detects if the pipeline configuration involves the use of HashiCorp Vault or similar secrets management tools.
- **Signing**: Checks for signing steps or configurations within the pipeline.
- **Sub-stages**: Identifies sub-stages within each stage, providing a more granular view of the pipeline execution.
- **YAML Syntax Validation**: Validates if the YAML syntax is correctly structured and parseable.

---

## Demo
Try it out here: [GitLab YAML Analyzer](https://gitlab-yaml-analyzer.vercel.app)

---

## Installation

### Prerequisites
- **Node.js** (version >= 14.0.0)
- **npm** (version >= 6.0.0)

### Setup
1. **Clone the repository:**
 ```bash
    git clone https://github.com/yourusername/gitlab-yaml-analyzer.git
 ```

2. **Navigate to folder:**
```bash
  cd gitlab-yaml-analyzer
```

3. **Install dependencies:**
```bash
  npm install
```

4. **Run the app locally:**
```bash
npm run dev
```
---

## Ussage
- **Paste your .gitlab-ci.yml file into the provided input area.**
- **The app will parse the YAML file and display insights**

---

## Contributing
**=>** Contributions are welcome! Please fork the repository and submit a pull request with your changes. Make sure to follow the project's code style and add tests where necessary.

---

## Bug Reports & Feature Requests
If you encounter any issues or have feature requests, feel free to open an issue in the GitHub Issues section.


