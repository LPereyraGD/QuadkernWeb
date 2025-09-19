#!/usr/bin/env node

/**
 * QuadKern Deployment Script
 * Automatiza el proceso de deploy a GitHub Pages
 */

import { execSync } from 'child_process';

class QuadKernDeployer {
  constructor() {
    this.currentBranch = null;
  }

  async deploy() {
    console.log('🚀 Starting QuadKern deployment process...');
    
    try {
      // 1. Verificar que estamos en dev
      this.currentBranch = this.getCurrentBranch();
      if (this.currentBranch !== 'dev') {
        console.log(`📋 Switching to dev branch (current: ${this.currentBranch})`);
        execSync('git checkout dev', { stdio: 'inherit' });
      }

      // 2. Build del proyecto
      console.log('🔨 Building project...');
      execSync('npm run build', { stdio: 'inherit' });

      // 3. Commit cambios en dev
      console.log('💾 Committing changes...');
      try {
        execSync('git add .', { stdio: 'inherit' });
        const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
        execSync(`git commit -m "🚀 Deploy: ${timestamp}"`, { stdio: 'inherit' });
        execSync('git push origin dev', { stdio: 'inherit' });
      } catch (error) {
        console.log('ℹ️ No changes to commit or already up to date');
      }

      // 4. Merge a main y push
      console.log('🔄 Merging to main...');
      execSync('git checkout main', { stdio: 'inherit' });
      execSync('git reset --hard dev', { stdio: 'inherit' });
      execSync('git push origin main --force', { stdio: 'inherit' });

      // 5. Volver a dev
      execSync('git checkout dev', { stdio: 'inherit' });

      console.log('✅ Deployment completed successfully!');
      console.log('🌐 Your site will be updated in 1-2 minutes at:');
      console.log('   https://quadkern.com');
      console.log('');
      console.log('💡 To force refresh the site:');
      console.log('   - Press Ctrl+F5 (hard refresh)');
      console.log('   - Or open in incognito mode');
      console.log('   - Or add ?v=' + Date.now() + ' to the URL');

    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      
      // Intentar volver a la rama original
      if (this.currentBranch && this.currentBranch !== 'dev') {
        try {
          execSync(`git checkout ${this.currentBranch}`, { stdio: 'inherit' });
        } catch (checkoutError) {
          console.error('⚠️ Could not return to original branch:', checkoutError.message);
        }
      }
      
      process.exit(1);
    }
  }

  getCurrentBranch() {
    try {
      return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  async forceRefresh() {
    console.log('🔄 Forcing cache refresh...');
    
    // Crear un timestamp único para forzar refresh
    const timestamp = Date.now();
    const refreshUrl = `https://quadkern.com?v=${timestamp}`;
    
    console.log('💡 Force refresh strategies:');
    console.log('1. Hard refresh: Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (Mac)');
    console.log('2. Incognito/Private mode');
    console.log(`3. Add timestamp: ${refreshUrl}`);
    console.log('4. Clear browser cache');
    
    // Generar un archivo de cache-busting
    const cacheBustingContent = `/* Cache busting: ${timestamp} */`;
    require('fs').writeFileSync('./docs/cache-bust.css', cacheBustingContent);
    
    console.log('✅ Cache-busting file generated');
  }
}

// Manejar argumentos de línea de comandos
const args = process.argv.slice(2);
const deployer = new QuadKernDeployer();

if (args.includes('--refresh') || args.includes('-r')) {
  deployer.forceRefresh();
} else {
  deployer.deploy();
}
