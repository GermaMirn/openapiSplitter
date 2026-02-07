const path = require('path');

function stripPrefix(prefix, filenames) {
  return filenames.map((f) => f.replace(new RegExp(`^${prefix}/`), ''));
}

module.exports = {
  'files-service/**/*.ts': (filenames) => {
    if (filenames.length === 0) return [];
    const relative = stripPrefix('files-service', filenames);
    return `cd files-service && eslint ${relative.map((f) => `"${f}"`).join(' ')}`;
  },
  'openapi-splitter-service/**/*.ts': (filenames) => {
    if (filenames.length === 0) return [];
    const relative = stripPrefix('openapi-splitter-service', filenames);
    return `cd openapi-splitter-service && eslint ${relative.map((f) => `"${f}"`).join(' ')}`;
  },
  'frontend-service/**/*.{ts,tsx}': (filenames) => {
    if (filenames.length === 0) return [];
    const relative = stripPrefix('frontend-service', filenames);
    return `cd frontend-service && eslint ${relative.map((f) => `"${f}"`).join(' ')} --report-unused-disable-directives --max-warnings 0`;
  },
};
