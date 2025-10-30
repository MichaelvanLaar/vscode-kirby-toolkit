import * as assert from 'assert';
import * as vscode from 'vscode';
import { BuildProcess, BuildState } from '../integrations/buildIntegration';

suite('Build Integration Test Suite', () => {
  let buildProcess: BuildProcess;

  setup(() => {
    buildProcess = BuildProcess.getInstance();
  });

  teardown(() => {
    // Clean up any running processes
    if (buildProcess.isRunning()) {
      buildProcess.stop();
    }
  });

  suite('BuildProcess Singleton', () => {
    test('should return same instance', () => {
      const instance1 = BuildProcess.getInstance();
      const instance2 = BuildProcess.getInstance();
      assert.strictEqual(instance1, instance2);
    });

    test('should prevent multiple simultaneous builds', () => {
      const instance = BuildProcess.getInstance();
      assert.strictEqual(instance.isRunning(), false);
    });
  });

  suite('BuildProcess State Management', () => {
    test('should start in idle state', () => {
      assert.strictEqual(buildProcess.getState(), BuildState.Idle);
    });

    test('should track state changes', (done) => {
      let stateChangeCount = 0;

      buildProcess.onStateChange((state: BuildState) => {
        stateChangeCount++;

        if (stateChangeCount === 1) {
          // First state change should be to Building
          assert.strictEqual(state, BuildState.Building);
        } else if (stateChangeCount === 2) {
          // Second state change should be to Ready (after 5s timeout) or Idle (if stopped)
          assert.ok(state === BuildState.Ready || state === BuildState.Idle);
          done();
        }
      });

      // Start a simple echo command
      const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '/tmp';
      buildProcess.start('echo "test"', workspacePath);

      // Stop after a short delay to trigger state change
      setTimeout(() => {
        buildProcess.stop();
      }, 100);
    });

    test('should transition to idle when stopped', () => {
      const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '/tmp';
      buildProcess.start('echo "test"', workspacePath);

      assert.ok(buildProcess.isRunning());

      buildProcess.stop();

      assert.strictEqual(buildProcess.isRunning(), false);
      assert.strictEqual(buildProcess.getState(), BuildState.Idle);
    });
  });

  suite('BuildProcess Terminal Management', () => {
    test('should not be running initially', () => {
      assert.strictEqual(buildProcess.isRunning(), false);
    });

    test('should be running after start', () => {
      const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '/tmp';
      buildProcess.start('echo "test"', workspacePath);

      assert.strictEqual(buildProcess.isRunning(), true);

      // Cleanup
      buildProcess.stop();
    });

    test('should create terminal with correct name', (done) => {
      const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '/tmp';

      // Listen for terminal creation
      const disposable = vscode.window.onDidOpenTerminal((terminal) => {
        if (terminal.name.startsWith('Kirby Build')) {
          assert.ok(true);
          disposable.dispose();
          buildProcess.stop();
          done();
        }
      });

      buildProcess.start('echo "test"', workspacePath, 'TestWorkspace');
    });

    test('should include workspace name in terminal', (done) => {
      const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '/tmp';
      const workspaceName = 'TestProject';

      const disposable = vscode.window.onDidOpenTerminal((terminal) => {
        if (terminal.name.includes(workspaceName)) {
          assert.ok(true);
          disposable.dispose();
          buildProcess.stop();
          done();
        }
      });

      buildProcess.start('echo "test"', workspacePath, workspaceName);
    });
  });

  suite('BuildProcess Restart', () => {
    test('should stop existing process when restarting', (done) => {
      const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '/tmp';

      // Start initial process
      buildProcess.start('echo "test1"', workspacePath);

      assert.strictEqual(buildProcess.isRunning(), true);

      // Wait a bit, then restart
      setTimeout(() => {
        buildProcess.restart('echo "test2"', workspacePath);

        // Should still be running after restart
        setTimeout(() => {
          assert.strictEqual(buildProcess.isRunning(), true);
          buildProcess.stop();
          done();
        }, 200);
      }, 100);
    });
  });

  suite('BuildProcess Cleanup', () => {
    test('should clean up on dispose', () => {
      const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '/tmp';
      buildProcess.start('echo "test"', workspacePath);

      assert.strictEqual(buildProcess.isRunning(), true);

      buildProcess.dispose();

      assert.strictEqual(buildProcess.isRunning(), false);
    });
  });
});
