import assert from 'node:assert/strict';
import test from 'node:test';
import { experimentUrl, normalizeVersion, versionPath } from '../shell.js';

test('version links accept only archived versions and default to v3', () => {
  assert.equal(normalizeVersion('1'), '1');
  assert.equal(normalizeVersion('2'), '2');
  assert.equal(normalizeVersion('3'), '3');
  assert.equal(normalizeVersion(null), '3');
  assert.equal(normalizeVersion('../v1'), '3');
  assert.equal(versionPath('2'), 'versions/v2/index.html');
});

test('experiment links retain the chosen version except D', () => {
  assert.equal(experimentUrl('a-ai-only', '2'), 'https://luckybridge.github.io/knollab-001-a-ai-only/?version=2');
  assert.equal(experimentUrl('d-design-figma-mcp-actively', '3'), 'https://luckybridge.github.io/knollab-001-d-design-figma-mcp-actively/?version=1');
});
