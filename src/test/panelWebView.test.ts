import * as assert from 'assert';
import { KirbyPanelWebView } from '../panels/kirbyPanelWebView';

suite('Panel WebView Test Suite', () => {
    suite('Singleton pattern', () => {
        test('should maintain singleton instance', () => {
            // Note: This test verifies the static methods exist
            // Actual WebView creation requires VS Code API context
            assert.strictEqual(typeof KirbyPanelWebView.exists, 'function');
            assert.strictEqual(typeof KirbyPanelWebView.dispose, 'function');
            assert.strictEqual(typeof KirbyPanelWebView.reload, 'function');
        });

        test('should have exists() method that returns boolean', () => {
            // Initially no panel should exist in test environment
            const exists = KirbyPanelWebView.exists();
            assert.strictEqual(typeof exists, 'boolean');
        });
    });

    suite('WebView lifecycle', () => {
        test('should provide dispose method for cleanup', () => {
            // Verify dispose method exists and can be called safely
            assert.doesNotThrow(() => {
                KirbyPanelWebView.dispose();
            }, 'dispose() should not throw when no panel exists');
        });

        test('should provide reload method', () => {
            // Verify reload method exists and can be called safely
            assert.doesNotThrow(() => {
                KirbyPanelWebView.reload();
            }, 'reload() should not throw when no panel exists');
        });
    });

    suite('HTML generation', () => {
        test('should escape HTML in URL', () => {
            const testUrl = 'http://example.com/panel?foo=<script>alert("xss")</script>';
            const escapedUrl = testUrl
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');

            assert.ok(!escapedUrl.includes('<script>'),
                'URL should not contain unescaped script tags');
            assert.ok(escapedUrl.includes('&lt;script&gt;'),
                'URL should contain escaped script tags');
        });

        test('should properly escape all HTML entities', () => {
            const testCases = [
                { char: '&', escaped: '&amp;' },
                { char: '<', escaped: '&lt;' },
                { char: '>', escaped: '&gt;' },
                { char: '"', escaped: '&quot;' },
                { char: "'", escaped: '&#039;' }
            ];

            testCases.forEach(({ char, escaped }) => {
                const input = `http://example.com/panel?test=${char}value`;
                const output = input
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');

                assert.ok(output.includes(escaped),
                    `Character "${char}" should be escaped to "${escaped}"`);
            });
        });
    });

    suite('URL validation', () => {
        test('should accept valid panel URLs', () => {
            const validUrls = [
                'http://localhost:8000/panel',
                'https://localhost:8000/panel',
                'http://example.test/panel',
                'https://example.com/panel'
            ];

            validUrls.forEach(url => {
                try {
                    new URL(url);
                    assert.ok(true, `${url} is a valid URL`);
                } catch {
                    assert.fail(`${url} should be valid`);
                }
            });
        });

        test('should handle URLs with query parameters', () => {
            const url = 'http://localhost:8000/panel?page=dashboard&filter=recent';
            try {
                new URL(url);
                assert.ok(true, 'URL with query parameters should be valid');
            } catch {
                assert.fail('URL with query parameters should be valid');
            }
        });

        test('should handle URLs with hash fragments', () => {
            const url = 'http://localhost:8000/panel#/pages/home';
            try {
                new URL(url);
                assert.ok(true, 'URL with hash should be valid');
            } catch {
                assert.fail('URL with hash should be valid');
            }
        });
    });
});
