#!/usr/bin/env node

/**
 * QuadKern Build System
 * Sistema de build mejorado para optimización y deployment
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class QuadKernBuilder {
  constructor() {
    this.srcDir = './src';
    this.docsDir = './docs';
    this.publicDir = './public';
    this.outputDir = './docs';
    
    this.config = {
      minify: true,
      optimize: true,
      generateSourceMaps: false,
      watchMode: false
    };
  }

  async build() {
    console.log('🚀 Starting QuadKern build process...');
    
    try {
      // 1. Limpiar directorios de salida
      this.cleanOutputDirectories();
      
      // 2. Compilar TypeScript
      await this.compileTypeScript();
      
      // 3. Procesar CSS
      await this.processCSS();
      
      // 4. Optimizar HTML
      await this.optimizeHTML();
      
      // 5. Copiar assets
      await this.copyAssets();
      
      // 6. Generar reporte de build
      await this.generateBuildReport();
      
      console.log('✅ Build completed successfully!');
      console.log('📁 Output directory: docs/');
      console.log('🌐 Ready for GitHub Pages deployment');
      
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }
  }

  cleanOutputDirectories() {
    console.log('🧹 Cleaning output directories...');
    
    // Limpiar archivos compilados en docs
    const filesToClean = [
      'main.js',
      'main.js.map',
      'effects.js',
      'effects.js.map',
      'navigation.js',
      'navigation.js.map',
      'performance.js',
      'performance.js.map'
    ];

    filesToClean.forEach(file => {
      const filePath = path.join(this.docsDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  }

  async compileTypeScript() {
    console.log('📝 Compiling TypeScript...');
    
    const tsFiles = [
      'main.ts',
      'effects.ts',
      'navigation.ts',
      'performance.ts'
    ];

    for (const file of tsFiles) {
      const inputPath = path.join(this.srcDir, file);
      const outputPath = path.join(this.docsDir, file.replace('.ts', '.js'));
      
      if (fs.existsSync(inputPath)) {
        try {
          execSync(`npx tsc "${inputPath}" --outDir "${this.docsDir}" --target es2020 --skipLibCheck --moduleResolution node --esModuleInterop`, {
            stdio: 'inherit'
          });
          console.log(`✅ Compiled ${file}`);
        } catch (error) {
          console.error(`❌ Failed to compile ${file}:`, error.message);
          throw error;
        }
      }
    }
  }

  async processCSS() {
    console.log('🎨 Processing CSS...');
    
    // Leer archivos CSS modulares
    const cssFiles = [
      'base.css',
      'components.css',
      'layout.css',
      'responsive.css'
    ];

    let combinedCSS = '';
    
    // Agregar comentario de header
    combinedCSS += `/* QuadKern Styles - Generated on ${new Date().toISOString()} */\n\n`;
    
    for (const file of cssFiles) {
      const filePath = path.join(this.srcDir, 'styles', file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        combinedCSS += `/* === ${file.toUpperCase()} === */\n`;
        combinedCSS += content;
        combinedCSS += `\n\n`;
        console.log(`✅ Processed ${file}`);
      }
    }

    // Escribir CSS combinado
    const outputPath = path.join(this.docsDir, 'styles.css');
    fs.writeFileSync(outputPath, combinedCSS);
    
    // También copiar a public
    fs.copyFileSync(outputPath, path.join(this.publicDir, 'styles.css'));
    
    console.log('✅ CSS processing completed');
  }

  async optimizeHTML() {
    console.log('📄 Optimizing HTML...');
    
    const htmlFiles = ['index.html'];
    
    for (const file of htmlFiles) {
      const inputPath = path.join(this.docsDir, file);
      const publicPath = path.join(this.publicDir, file);
      
      if (fs.existsSync(inputPath)) {
        let content = fs.readFileSync(inputPath, 'utf8');
        
        // Optimizaciones básicas para docs/
        const docsContent = content
          .replace(/\s+/g, ' ') // Minimizar espacios
          .replace(/<!--[\s\S]*?-->/g, '') // Remover comentarios
          .replace(/>\s+</g, '><') // Remover espacios entre tags
          .replace(/<link rel="stylesheet" href="\.\/effects\.css">/g, '<link rel="stylesheet" href="./styles.css">')
          .replace(/<script src="\.\/simple-effects\.js"><\/script>/g, '<script type="module" src="./main.js"></script>')
          .replace(/<script src="\.\/navigation\.js"><\/script>/g, '');
        
        // Versión para public/ (desarrollo)
        const publicContent = content
          .replace(/<link rel="stylesheet" href="\.\/effects\.css">/g, '<link rel="stylesheet" href="./styles.css">')
          .replace(/<script src="\.\/simple-effects\.js"><\/script>/g, '<script type="module" src="./main.js"></script>')
          .replace(/<script src="\.\/navigation\.js"><\/script>/g, '');
        
        // Escribir ambas versiones
        fs.writeFileSync(inputPath, docsContent);
        fs.writeFileSync(publicPath, publicContent);
        
        console.log(`✅ Optimized ${file} (docs & public)`);
      }
    }
  }

  async copyAssets() {
    console.log('📦 Copying assets...');
    
    const assetsToCopy = [
      'QuadkernLogo.png',
      'fonts/',
      'background.svg',
      'javascript.svg',
      'technologies.svg',
      'webstorm-icon-logo.svg',
      'webstorm-logo.svg'
    ];

    for (const asset of assetsToCopy) {
      const srcPath = path.join(this.publicDir, asset);
      const destPath = path.join(this.docsDir, asset);
      
      if (fs.existsSync(srcPath)) {
        if (fs.statSync(srcPath).isDirectory()) {
          this.copyDirectory(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
        console.log(`✅ Copied ${asset}`);
      }
    }
  }

  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  async generateBuildReport() {
    console.log('📊 Generating build report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      buildVersion: '2.0.0',
      files: {
        html: this.getFileList(this.docsDir, '.html'),
        css: this.getFileList(this.docsDir, '.css'),
        js: this.getFileList(this.docsDir, '.js'),
        assets: this.getAssetList(this.docsDir)
      },
      sizes: this.calculateFileSizes(this.docsDir),
      optimizations: {
        cssModularization: true,
        typescriptCompilation: true,
        htmlMinification: true,
        assetOptimization: true
      }
    };

    const reportPath = path.join(this.docsDir, 'build-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('✅ Build report generated');
  }

  getFileList(dir, extension) {
    const files = [];
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isFile() && entry.endsWith(extension)) {
        files.push(entry);
      }
    }
    
    return files;
  }

  getAssetList(dir) {
    const assets = [];
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isFile() && !entry.endsWith('.html') && !entry.endsWith('.css') && !entry.endsWith('.js')) {
        assets.push(entry);
      }
    }
    
    return assets;
  }

  calculateFileSizes(dir) {
    const sizes = {};
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isFile()) {
        sizes[entry] = {
          bytes: stat.size,
          kb: Math.round(stat.size / 1024 * 100) / 100
        };
      }
    }
    
    return sizes;
  }
}

// Ejecutar build si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const builder = new QuadKernBuilder();
  builder.build().catch(console.error);
}

export default QuadKernBuilder;
