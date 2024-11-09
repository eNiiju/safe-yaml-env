# safe-yaml-env

Parse YAML files safely with schema validation, supporting environment variables
and default values.

This library uses [@std/yaml](https://jsr.io/@std/yaml) for the YAML parsing and
[Zod](https://zod.dev) for the schema validation.

## Usage

### Load YAML Synchronously

> config.yaml

```yaml
---
name: Loris Ipsum
age: 25
```

> main.ts

```typescript
import { load } from "@niiju/safe-yaml-env/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string(),
  age: z.number(),
}).strict();

const data = load("./config.yaml", schema);
console.log(data); // { name: 'Loris Ipsum', age: 25 }
```

### Load YAML Asynchronously

> config.yaml

```yaml
---
name: Loris Ipsum
age: 25
```

> main.ts

```typescript
import { loadAsync } from "@niiju/safe-yaml-env/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string(),
  age: z.number(),
}).strict();

const data = await loadAsync("./config.yaml", schema);
console.log(data); // { name: 'Loris Ipsum', age: 25 }
```

### Environment Variables in YAML

YAML files can include references to environment variables, like `${ENV_VAR}`,
which will be replaced with their corresponding values from the environment (or
throw an error if it's not set).

> config.yaml

```yaml
---
name: ${ENV_NAME} # ENV_NAME must be defined
age: 25
```

> main.ts

```typescript
const data = load("./config.yaml", schema);
console.log(data); // { name: 'Loris Ipsum', age: 25 }
```

### Default environment variable values in the YAML file

You can provide a default value for an environment variable by using
`${ENV_VAR:-default}`. If the environment variable is not set, the default value
will be used, and won't throw an error.

> config.yaml

```yaml
---
name: ${ENV_NAME:-John Doe}
age: 25
```

### Default values in the Zod schema

You can also provide a default value for an environment variable by using the
`default` method of the Zod schema. If the environment variable is not set, the
default value will be used, and won't throw an error.

_Note: default values in the YAML file have precedence over default values in
the Zod schema._

> main.ts

```typescript
const schema = z.object({
  name: z.string().default("John Doe"),
  age: z.number(),
}).strict();
```

#### Type coercion

Environment variables are always of type `string`. If you want to parse them as
another type, you can use Zod's `coerce` as follows :

> main.ts

```typescript
const schema = z.object({
  name: z.string(),
  age: z.coerce.number(), // This will try to convert the type to number
}).strict();
```

Now, if the `age` property is referenced from an environment variable inside the
YAML file, the type will be converted from `string` to `number` (if possible),
instead of throwing an error.

## Error Handling

The following errors can be thrown:

- `FileNotFoundError`: Thrown if the YAML file is not found.
- `SyntaxError`: Thrown if the YAML file is invalid.
- `MissingEnvVarError`: Thrown if an environment variable is referenced but not
  set.
- `ZodError`: Thrown if the data doesn't conform to the Zod schema.

> main.ts

```typescript
import { load } from "@niiju/safe-yaml-env/zod";
import { FileNotFoundError, MissingEnvVarError } from "@niiju/safe-yaml-env";
import { ZodError } from "zod";

try {
  load("./config.yaml", schema);
} catch (error) {
  if (error instanceof FileNotFoundError) {
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
