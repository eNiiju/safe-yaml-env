# safe-yaml-env

Parse YAML files safely using Zod with environment variables and default values
support.

## Dependencies

This library uses [@std/yaml](https://jsr.io/@std/yaml) for the YAML parsing and
[Zod](https://zod.dev) for the schema validation.

## Usage

### Load YAML Asynchronously

```yaml
---
name: Loris Ipsum
age: 25
```

```typescript
import { z } from "npm:zod";
import { loadYamlAsync } from "jsr:@niiju/safe-yaml-env";

const schema = z.object({
  name: z.string(),
  age: z.number(),
}).strict();

const data = await loadYamlAsync("./config.yaml", schema);
console.log(data); // { name: 'Loris Ipsum', age: 25 }
```

### Load YAML Synchronously

```yaml
---
name: Loris Ipsum
age: 25
```

```typescript
import { z } from "npm:zod";
import { loadYaml } from "jsr:@niiju/safe-yaml-env";

const schema = z.object({
  name: z.string(),
  age: z.number(),
}).strict();

const data = loadYaml("./config.yaml", schema);
console.log(data); // { name: 'Loris Ipsum', age: 25 }
```

### Environment Variables in YAML

YAML files can include references to environment variables, like `${ENV_VAR}`,
which will be replaced with their corresponding values from the environment (or
throw an error if it's not set).

```yaml
---
name: ${ENV_NAME}
age: 25
```

```typescript
Deno.env.set("ENV_NAME", "Loris Ipsum"); // Example
const data = loadYaml("./config.yaml", schema);
console.log(data); // { name: 'Loris Ipsum', age: 25 }
```

#### Default Values in the YAML file

You can provide a default value for an environment variable by using
`${ENV_VAR:-default}`. If the environment variable is not set, the default value
will be used, and won't throw an error.

```yaml
---
name: ${ENV_NAME:-John Doe}
age: 25
```

#### Default values in the Zod schema

You can also provide a default value for an environment variable by using the
`default` method of the Zod schema. If the environment variable is not set, the
default value will be used, and won't throw an error.

_Note: default values in the YAML file have precedence over default values in
the Zod schema._

```typescript
const schema = z.object({
  name: z.string().default("John Doe"),
  age: z.number(),
}).strict();
```

## Error Handling

The following errors can be thrown:

- `Deno.errors.NotFound`: Thrown if the YAML file is not found.
- `SyntaxError`: Thrown if the YAML file is invalid.
- `MissingEnvVarError`: Thrown if an environment variable is referenced but not
  set.
- `ZodError`: Thrown if the data doesn't conform to the Zod schema.

```typescript
try {
  loadYaml("./config.yaml", schema);
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    console.error("File not found");
  } else if (error instanceof SyntaxError) {
    console.error("Invalid YAML");
  } else if (error instanceof MissingEnvVarError) {
    console.error("Missing environment variable:", error.envVarKey);
  } else if (error instanceof ZodError) {
    console.error("Invalid data:", error.errors);
  }
}
```
