# json-mapper

A patterns-driven, high-performance command-line interface (CLI) tool designed to recursively map and transform JSON arrays using a schema-based dictionary.

## 60-Second Quick Start

Get up and running with a complete JSON transformation in under a minute.

### 1. Installation

Clone the repository and install the development dependencies:
```bash
git clone https://github.com/your-username/json-mapper.git
cd json-mapper
npm install
```

### 2. Run Transformation

Execute the mapping process using the provided workspace samples:
```bash
node src/infrastructure/cli/bin.js -i ./sample/initial_model.json -d ./sample/dictionary.json -o ./sample/output.json
```

### 3. Verify Output

Inspect the generated file in the `sample` directory to view the structured results:
```bash
cat sample/output.json
```

---

## Architectural Reference

This codebase is structured around Robert C. Martin's Clean Architecture principles, ensuring distinct separation of concerns and loose coupling.

### Architectural Layers

The source code is organized into concentric layers of control:
- **Domain Layer (`src/domain/`)**: Houses the core business rules and algorithms. This layer contains zero external dependencies and remains fully decoupled from network, filesystems, and databases.
- **Use Cases Layer (`src/usecases/`)**: Defines the specific business processes and workflows. It connects to outer layers using abstract interfaces (ports).
- **Adapters Layer (`src/adapters/`)**: Adapts abstract use cases and domain models to external frameworks, environments, and databases.
- **Infrastructure Layer (`src/infrastructure/`)**: Contains external command execution drivers, configurations, and dependency bootstrap containers.

### Design Patterns

We leverage three Gang of Four (GoF) structural and behavioral patterns to achieve high extensibility:
- **Composite Pattern**: Models nested mapping dictionary schemas recursively. The components are defined in `src/domain/model/MappingNode.js`.
- **Strategy Pattern**: Selects property access actions dynamically. The traversal rules are encapsulated in `src/domain/services/LookupResolver.js`.
- **Adapter Pattern**: Decouples the storage interface from direct filesystem imports, defined in `src/adapters/repositories/FileRepositoryAdapter.js`.

---

## Configuration Reference

The CLI options allow flexible mapping configurations.

### Command Line Options

- `-i, --input <file>`: Specifies the path to the source JSON dataset file (array format).
- `-d, --dict <file>`: Specifies the path to the mapping schema dictionary JSON file.
- `-o, --output <file>`: Specifies the path to write the transformed JSON output file.
- `-h, --help`: Renders the CLI usage instructions.

---

## Testing Reference

Validate the codebase against the test suite.

### Running Automated Tests

Run the test suite using Node's native test runner to check model validation and mapping:
```bash
npm test
```
