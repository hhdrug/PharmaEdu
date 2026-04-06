import nextConfig from 'eslint-config-next';

// eslint-config-next v16+ returns a flat config array directly.
// Do NOT wrap with FlatCompat — that causes a circular JSON error.
const eslintConfig = [...nextConfig];

export default eslintConfig;
