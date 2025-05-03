import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc'; // Assuming you use the React plugin

export default defineConfig({
    plugins: [react()], // Include necessary Vite plugins if tests depend on them
    test: {
        globals: true, // Optional: Use Vitest globals (describe, it, expect)
        environment: 'jsdom', // Set the test environment to jsdom
        setupFiles: [], // Add setup files if needed (e.g., for mocking)
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], // Default pattern
        // reporters: ['default', 'html'], // Optional: Add reporters like HTML
    },
}); 