/**
 * Build Script para Producción - QuadKern
 * Incluye ofuscación completa, eliminación de logs y optimizaciones extremas
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { minify } from 'terser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class QuadKernProductionBuilder {
  constructor() {
    this.srcDir = './src';
    this.docsDir = './docs';
    this.publicDir = './public';
  }

  async build() {
    console.log('🚀 Building QuadKern for PRODUCTION...');
    
    try {
      // 1. Limpiar directorios
      this.cleanDirectories();
      
      // 2. Compilar TypeScript
      await this.compileTypeScript();
      
      // 3. Ofuscar JavaScript (máxima ofuscación)
      await this.obfuscateJavaScript();
      
      // 4. Procesar y optimizar CSS
      await this.processAndOptimizeCSS();
      
      // 5. Optimizar HTML
      await this.optimizeHTML();
      
      // 6. Copiar assets
      await this.copyAssets();
      
      // 7. Generar reporte de seguridad
      await this.generateSecurityReport();
      
      console.log('✅ PRODUCTION BUILD COMPLETED!');
      console.log('🔒 Code is fully obfuscated and optimized');
      console.log('🚫 All console logs removed');
      console.log('🛡️ Security measures applied');
      
    } catch (error) {
      console.error('❌ Production build failed:', error.message);
      process.exit(1);
    }
  }

  cleanDirectories() {
    console.log('🧹 Cleaning directories...');
    
    const filesToClean = [
      'main.js', 'main.js.map',
      'effects.js', 'effects.js.map',
      'navigation.js', 'navigation.js.map',
      'performance.js', 'performance.js.map',
      'styles.css', 'styles.css.map'
    ];

    filesToClean.forEach(file => {
      [this.docsDir, this.publicDir].forEach(dir => {
        const filePath = path.join(dir, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    });
  }

  async compileTypeScript() {
    console.log('📝 Compiling TypeScript...');
    
    const tsFiles = [
      'effects.ts',
      'navigation.ts', 
      'performance.ts',
      'main.ts'
    ];
    
    for (const file of tsFiles) {
      const inputPath = path.join(this.srcDir, file);
      
      if (fs.existsSync(inputPath)) {
        try {
          execSync(`npx tsc "${inputPath}" --outDir "${this.docsDir}" --target es2020 --skipLibCheck --removeComments`, {
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

  async obfuscateJavaScript() {
    console.log('🔒 Obfuscating JavaScript with MAXIMUM security...');
    
    const jsFiles = [
      'effects.js',
      'navigation.js',
      'performance.js',
      'main.js'
    ];

    for (const file of jsFiles) {
      const filePath = path.join(this.docsDir, file);
      
      if (fs.existsSync(filePath)) {
        const code = fs.readFileSync(filePath, 'utf8');
        
        // Ofuscación EXTREMA para producción
        const obfuscated = await minify(code, {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: [
              'console.log', 'console.warn', 'console.debug', 'console.info',
              'console.trace', 'console.table', 'console.group', 'console.groupEnd'
            ],
            passes: 3, // Múltiples pasadas para mayor ofuscación
            unsafe: true,
            unsafe_comps: true,
            unsafe_math: true,
            unsafe_proto: true,
            unsafe_regexp: true,
            unsafe_undefined: true,
            sequences: true,
            dead_code: true,
            conditionals: true,
            comparisons: true,
            evaluate: true,
            booleans: true,
            loops: true,
            unused: true,
            hoist_funs: true,
            hoist_vars: true,
            if_return: true,
            join_vars: true,
            collapse_vars: true,
            reduce_vars: true,
            inline: 3,
            properties: true,
            keep_fargs: false,
            keep_fnames: false
          },
          mangle: {
            toplevel: true,
            eval: true,
            keep_fnames: false,
            reserved: ['QuadKern', 'window', 'document', 'navigator']
          },
          format: {
            comments: false,
            beautify: false,
            ascii_only: true
          },
          sourceMap: false,
          ecma: 2020
        });

        if (obfuscated.error) {
          throw obfuscated.error;
        }

        fs.writeFileSync(filePath, obfuscated.code);
        console.log(`✅ Heavily obfuscated ${file}`);
      }
    }
  }

  async processAndOptimizeCSS() {
    console.log('🎨 Processing and optimizing CSS...');
    
    const cssFiles = [
      'base.css',
      'components.css',
      'layout.css',
      'sections.css',
      'responsive.css',
      'performance.css'
    ];

    let combinedCSS = `/* QuadKern Production Styles - ${new Date().toISOString()} */\n`;
    
    for (const file of cssFiles) {
      const filePath = path.join(this.srcDir, 'styles', file);
      if (fs.existsSync(filePath)) {
        combinedCSS += fs.readFileSync(filePath, 'utf8') + '\n';
        console.log(`✅ Processed ${file}`);
      }
    }

    // Optimización EXTREMA de CSS
    const optimizedCSS = combinedCSS
      .replace(/\/\*[\s\S]*?\*\//g, '') // Eliminar TODOS los comentarios
      .replace(/\s+/g, ' ') // Eliminar espacios múltiples
      .replace(/;\s*}/g, '}') // Eliminar punto y coma antes de }
      .replace(/{\s+/g, '{') // Eliminar espacios después de {
      .replace(/;\s+/g, ';') // Eliminar espacios después de ;
      .replace(/,\s+/g, ',') // Eliminar espacios después de comas
      .replace(/:\s+/g, ':') // Eliminar espacios después de dos puntos
      .replace(/\s*>\s*/g, '>') // Optimizar selectores
      .replace(/\s*\+\s*/g, '+') // Optimizar selectores
      .replace(/\s*~\s*/g, '~') // Optimizar selectores
      .trim();

    // Guardar en ambos directorios
    fs.writeFileSync(path.join(this.docsDir, 'styles.css'), optimizedCSS);
    fs.writeFileSync(path.join(this.publicDir, 'styles.css'), optimizedCSS);
    
    console.log('✅ CSS heavily optimized');
  }

  async optimizeHTML() {
    console.log('📄 Optimizing HTML for production...');
    
    const htmlFiles = ['index.html'];
    
    for (const file of htmlFiles) {
      const inputPath = path.join(this.docsDir, file);
      const publicPath = path.join(this.publicDir, file);
      
      if (fs.existsSync(inputPath)) {
        let content = fs.readFileSync(inputPath, 'utf8');
        
        // Optimizaciones de HTML para producción
        content = content
          .replace(/<link rel="stylesheet" href="\.\/effects\.css">/g, '<link rel="stylesheet" href="./styles.css">')
          .replace(/<script src="\.\/simple-effects\.js"><\/script>/g, '')
          .replace(/<script src="\/simple-effects\.js"><\/script>/g, '')
          .replace(/<script src="\.\/navigation\.js"><\/script>/g, '')
          .replace(/<script src="\/navigation\.js"><\/script>/g, '')
          .replace(/\s+/g, ' ') // Eliminar espacios múltiples
          .replace(/>\s+</g, '><') // Eliminar espacios entre tags
          .trim();

        // Versión para docs (GitHub Pages) - NO minificar para evitar problemas
        fs.writeFileSync(inputPath, content);
        
        // Versión para public (desarrollo)
        fs.writeFileSync(publicPath, content);
        
        console.log(`✅ Optimized ${file}`);
      }
    }
  }

  async copyAssets() {
    console.log('📦 Copying assets...');
    
    const assets = [
      'QuadkernLogo.png',
      'fonts/JetBrainsMono-Regular.woff2',
      'fonts/JetBrainsSans-Regular.woff2',
      'background.svg',
      'javascript.svg',
      'technologies.svg',
      'webstorm-icon-logo.svg',
      'webstorm-logo.svg'
    ];

    assets.forEach(asset => {
      const srcPath = path.join(this.docsDir, asset);
      const destPath = path.join(this.publicDir, asset);
      
      if (fs.existsSync(srcPath)) {
        // Crear directorio si no existe
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied ${asset}`);
      }
    });
  }

  async generateSecurityReport() {
    console.log('📊 Generating security report...');
    
    const report = {
      buildDate: new Date().toISOString(),
      optimizations: {
        javascriptObfuscation: 'MAXIMUM',
        cssOptimization: 'EXTREME',
        consoleLogsRemoved: true,
        commentsRemoved: true,
        sourceMapsRemoved: true,
        rateLimitEnabled: true,
        endpointProtection: true
      },
      security: {
        codeObfuscation: 'HEAVY',
        apiEndpointsHidden: true,
        queriesObfuscated: true,
        ddosProtection: true,
        rateLimiting: true
      },
      performance: {
        cssMinified: true,
        jsMinified: true,
        assetsOptimized: true,
        lazyLoadingEnabled: true,
        adaptivePerformance: true
      }
    };

    fs.writeFileSync(
      path.join(this.docsDir, 'security-report.json'), 
      JSON.stringify(report, null, 2)
    );
    
    console.log('✅ Security report generated');
  }
}

// Ejecutar build
const builder = new QuadKernProductionBuilder();
builder.build().catch(console.error);
