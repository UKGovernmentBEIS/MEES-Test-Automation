import { test } from '@playwright/test';
import { unlink } from 'fs/promises';
import path from 'path';
import config from '../../../playwright.config';

test.describe('Clear Authentication State', () => {
  test('clear all authentication state files', async () => {
    const workers: number = Number(config.workers);
    
    if (!workers || workers <= 0) {
      throw new Error('Workers count must be a positive number in playwright.config.ts');
    }
    
    for (let i = 0; i < workers; i++) {
      const authFile = path.join('playwright', 'auth-states', `user-${i}.json`);
      
      try {
        await unlink(authFile);
        console.log(`Cleared authentication state: ${authFile}`);
      } catch (error: any) {
        // Only ignore "file not found" errors - everything else should fail
        if (error.code === 'ENOENT') {
          console.log(`Auth file not found (already cleared): ${authFile}`);
        } else {
          throw new Error(`Failed to clear authentication state ${authFile}: ${error.message}`);
        }
      }
    }
    
    console.log('All authentication states cleared successfully');
  });
});