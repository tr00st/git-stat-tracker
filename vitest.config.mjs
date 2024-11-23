import { configDefaults, defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        ...configDefaults,
        coverage: {
            reportsDirectory: 'artifacts/coverage',
            exclude: ['website/**', ...coverageConfigDefaults.exclude]
        }
    },
});
