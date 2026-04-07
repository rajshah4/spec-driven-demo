const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const SPECS_ROOT = path.join(REPO_ROOT, '.specify', 'specs');
const SCHEMA_PATH = path.join(REPO_ROOT, '.specify', 'schema', 'spec.schema.json');

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`${filePath}: invalid JSON (${error.message})`);
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function listSpecFiles(inputPath) {
  const resolved = inputPath ? path.resolve(REPO_ROOT, inputPath) : SPECS_ROOT;
  if (!fs.existsSync(resolved)) {
    return [];
  }

  const stat = fs.statSync(resolved);
  if (stat.isFile()) {
    return path.basename(resolved) === 'spec.json' ? [resolved] : [];
  }

  const stack = [resolved];
  const specFiles = [];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile() && entry.name === 'spec.json') {
        specFiles.push(fullPath);
      }
    }
  }

  return specFiles.sort();
}

function validateSpecStructure(spec, filePath, schema) {
  const errors = [];

  for (const key of asArray(schema.required)) {
    if (!(key in spec)) {
      errors.push(`missing required field: ${key}`);
    }
  }

  if (!isNonEmptyString(spec.version)) {
    errors.push('version must be a non-empty string');
  } else if (spec.version !== '1.0') {
    errors.push('version must equal "1.0"');
  }

  if (typeof spec.issue !== 'object' || spec.issue === null || Array.isArray(spec.issue)) {
    errors.push('issue must be an object');
  } else {
    if (!Number.isInteger(spec.issue.number) || spec.issue.number < 1) {
      errors.push('issue.number must be an integer >= 1');
    }
    if (!isNonEmptyString(spec.issue.title)) {
      errors.push('issue.title must be a non-empty string');
    }
    if (!isNonEmptyString(spec.issue.url)) {
      errors.push('issue.url must be a non-empty string');
    }
  }

  if (!isNonEmptyString(spec.feature)) {
    errors.push('feature must be a non-empty string');
  }

  if (!isNonEmptyString(spec.problem_statement)) {
    errors.push('problem_statement must be a non-empty string');
  }

  if (!Array.isArray(spec.user_stories) || spec.user_stories.length === 0) {
    errors.push('user_stories must be a non-empty array');
  } else {
    spec.user_stories.forEach((story, index) => {
      if (typeof story !== 'object' || story === null || Array.isArray(story)) {
        errors.push(`user_stories[${index}] must be an object`);
        return;
      }

      for (const field of ['as_a', 'i_want', 'so_that']) {
        if (!isNonEmptyString(story[field])) {
          errors.push(`user_stories[${index}].${field} must be a non-empty string`);
        }
      }
    });
  }

  if (typeof spec.requirements !== 'object' || spec.requirements === null || Array.isArray(spec.requirements)) {
    errors.push('requirements must be an object');
  } else {
    for (const key of ['must_have', 'should_have', 'nice_to_have']) {
      if (!Array.isArray(spec.requirements[key])) {
        errors.push(`requirements.${key} must be an array`);
        continue;
      }

      if (key === 'must_have' && spec.requirements[key].length === 0) {
        errors.push('requirements.must_have must include at least one item');
      }

      spec.requirements[key].forEach((item, index) => {
        if (!isNonEmptyString(item)) {
          errors.push(`requirements.${key}[${index}] must be a non-empty string`);
        }
      });
    }
  }

  if (!Array.isArray(spec.acceptance_criteria) || spec.acceptance_criteria.length === 0) {
    errors.push('acceptance_criteria must be a non-empty array');
  } else {
    spec.acceptance_criteria.forEach((item, index) => {
      if (!isNonEmptyString(item)) {
        errors.push(`acceptance_criteria[${index}] must be a non-empty string`);
      }
    });
  }

  for (const key of ['out_of_scope', 'open_questions']) {
    if (!Array.isArray(spec[key])) {
      errors.push(`${key} must be an array`);
      continue;
    }

    spec[key].forEach((item, index) => {
      if (!isNonEmptyString(item)) {
        errors.push(`${key}[${index}] must be a non-empty string`);
      }
    });
  }

  return {
    filePath,
    valid: errors.length === 0,
    errors,
  };
}

function main() {
  let schema;
  try {
    schema = readJson(SCHEMA_PATH);
  } catch (error) {
    console.error(`Failed to load schema: ${error.message}`);
    process.exit(1);
  }

  const inputPath = process.argv[2];
  const specFiles = listSpecFiles(inputPath);

  if (specFiles.length === 0) {
    console.log('No spec.json files found to validate.');
    return;
  }

  const results = specFiles.map((filePath) => {
    try {
      const spec = readJson(filePath);
      return validateSpecStructure(spec, filePath, schema);
    } catch (error) {
      return { filePath, valid: false, errors: [error.message] };
    }
  });

  const failed = results.filter((result) => !result.valid);

  if (failed.length === 0) {
    console.log(`Validated ${results.length} OpenSpec file(s) successfully.`);
    return;
  }

  console.error(`OpenSpec validation failed for ${failed.length} file(s):`);
  for (const result of failed) {
    console.error(`\n- ${result.filePath}`);
    for (const error of result.errors) {
      console.error(`  - ${error}`);
    }
  }

  process.exit(1);
}

main();
