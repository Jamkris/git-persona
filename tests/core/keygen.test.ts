import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

const { TEST_DIR, TEST_SSH_DIR } = vi.hoisted(() => {
  const { join } = require('node:path');
  const { tmpdir } = require('node:os');
  const TEST_DIR = join(tmpdir(), `ghem-keygen-test-${Date.now()}`);
  return {
    TEST_DIR,
    TEST_SSH_DIR: join(TEST_DIR, '.ssh'),
  };
});

vi.mock('node:os', async (importOriginal) => {
  const original = await importOriginal<typeof import('node:os')>();
  return {
    ...original,
    homedir: () => TEST_DIR,
  };
});

vi.mock('../../src/core/paths.js', () => ({
  PERSONA_DIR: require('node:path').join(TEST_DIR, '.git-env-manager'),
  CONFIG_PATH: require('node:path').join(TEST_DIR, '.git-env-manager', 'config.json'),
  KEYS_DIR: require('node:path').join(TEST_DIR, '.git-env-manager', 'keys'),
  resolveHome: (path: string) => path,
  toTildePath: (path: string) => path,
}));

vi.mock('../../src/i18n/index.js', () => ({
  setLocale: vi.fn(),
  getLocale: () => 'en',
  t: () => ({
    sshKeyAlreadyExists: (path: string) => `SSH key already exists at: ${path}`,
    configNotFound: 'config.json not found.',
    configInvalid: 'config.json format is invalid.',
  }),
  isValidLocale: (v: string) => ['en', 'ko'].includes(v),
}));

const mockExecSync = vi.fn();
vi.mock('node:child_process', () => ({
  execSync: (...args: unknown[]) => mockExecSync(...args),
}));

import { generateSshKey } from '../../src/core/keygen.js';
import { PersonaError } from '../../src/core/config.js';

describe('keygen', () => {
  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
    mkdirSync(TEST_SSH_DIR, { recursive: true });
    mockExecSync.mockReset();
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  describe('generateSshKey', () => {
    it('constructs correct key path', () => {
      mockExecSync.mockImplementation(() => '');
      const result = generateSshKey('test@example.com', 'personal');

      expect(result.privatePath).toContain('.ssh/id_ghem_personal');
      expect(result.publicPath).toBe(result.privatePath + '.pub');
    });

    it('passes correct arguments to ssh-keygen', () => {
      mockExecSync.mockImplementation(() => '');
      generateSshKey('test@example.com', 'work');

      expect(mockExecSync).toHaveBeenCalledOnce();
      const cmd = mockExecSync.mock.calls[0][0] as string;
      expect(cmd).toContain('ssh-keygen');
      expect(cmd).toContain('-t ed25519');
      expect(cmd).toContain('-C "test@example.com"');
      expect(cmd).toContain('id_ghem_work');
      expect(cmd).toContain('-N ""');
    });

    it('throws SSH_KEY_EXISTS when key already exists', () => {
      const { join } = require('node:path');
      const keyPath = join(TEST_SSH_DIR, 'id_ghem_existing');
      writeFileSync(keyPath, 'fake-key', 'utf-8');

      expect(() => generateSshKey('test@example.com', 'existing')).toThrow(PersonaError);
      try {
        generateSshKey('test@example.com', 'existing');
      } catch (err) {
        expect((err as PersonaError).code).toBe('SSH_KEY_EXISTS');
      }
    });

    it('does not call ssh-keygen when key exists', () => {
      const { join } = require('node:path');
      const keyPath = join(TEST_SSH_DIR, 'id_ghem_existing');
      writeFileSync(keyPath, 'fake-key', 'utf-8');

      try {
        generateSshKey('test@example.com', 'existing');
      } catch {
        // expected
      }

      expect(mockExecSync).not.toHaveBeenCalled();
    });
  });
});
