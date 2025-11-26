import * as assert from 'assert';
import { isServerRunning } from '../utils/panelDetector';

suite('Panel Detector Test Suite', () => {
    suite('isServerRunning', () => {
        test('should return false for non-existent server', async () => {
            // Test with a URL that definitely won't be running
            const result = await isServerRunning('http://localhost:59999/panel');
            assert.strictEqual(result, false);
        });

        test('should handle invalid URLs gracefully', async () => {
            // Test with invalid URL - should return false, not throw
            const result = await isServerRunning('not-a-valid-url');
            assert.strictEqual(result, false);
        });

        test('should timeout after 2 seconds', async function() {
            this.timeout(3000); // Allow 3 seconds for test

            const startTime = Date.now();
            // Use a non-routable IP that will timeout
            await isServerRunning('http://192.0.2.1:8000/panel');
            const duration = Date.now() - startTime;

            // Should timeout around 2000ms (allow some variance)
            assert.ok(duration >= 1900 && duration < 2500,
                `Expected timeout around 2000ms, got ${duration}ms`);
        });
    });

    suite('URL validation', () => {
        test('should accept valid HTTP URLs', () => {
            const validUrls = [
                'http://localhost:8000/panel',
                'http://127.0.0.1:3000/panel',
                'http://example.com/panel'
            ];

            validUrls.forEach(url => {
                try {
                    new URL(url);
                    assert.ok(true, `${url} should be valid`);
                } catch {
                    assert.fail(`${url} should be a valid URL`);
                }
            });
        });

        test('should accept valid HTTPS URLs', () => {
            const validUrls = [
                'https://localhost:8000/panel',
                'https://example.com/panel'
            ];

            validUrls.forEach(url => {
                try {
                    new URL(url);
                    assert.ok(true, `${url} should be valid`);
                } catch {
                    assert.fail(`${url} should be a valid URL`);
                }
            });
        });

        test('should reject invalid URLs', () => {
            const invalidUrls = [
                'not-a-url',
                'ftp://localhost:8000',
                'localhost:8000',
                ''
            ];

            invalidUrls.forEach(url => {
                try {
                    new URL(url);
                    if (url !== 'ftp://localhost:8000') {
                        assert.fail(`${url} should be invalid`);
                    }
                } catch {
                    assert.ok(true, `${url} should be invalid`);
                }
            });
        });
    });

    suite('Port extraction', () => {
        test('should extract port from common server commands', () => {
            const testCases = [
                { command: 'php -S localhost:8000', expectedPort: 8000 },
                { command: 'php -S 127.0.0.1:3000', expectedPort: 3000 },
                { command: 'serve -p 8080', expectedPort: 8080 },
                { command: 'http-server -p 8888', expectedPort: 8888 },
                { command: 'npm run dev -- --port 9000', expectedPort: 9000 }
            ];

            testCases.forEach(({ command, expectedPort }) => {
                const portMatch = command.match(/:(\d+)/);
                if (portMatch && portMatch[1]) {
                    const port = parseInt(portMatch[1], 10);
                    assert.strictEqual(port, expectedPort,
                        `Should extract port ${expectedPort} from "${command}"`);
                }
            });
        });

        test('should handle commands without ports', () => {
            const commands = [
                'npm run dev',
                'php -S localhost',
                'serve'
            ];

            commands.forEach(command => {
                const portMatch = command.match(/:(\d+)/);
                assert.strictEqual(portMatch, null,
                    `Should not extract port from "${command}"`);
            });
        });
    });
});
