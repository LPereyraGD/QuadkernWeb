# QuadKern Build Automation

## 📁 Estructura Simplificada

### **Flujo de Trabajo Recomendado:**

```
src/           ← Código fuente (TypeScript)
├── effects.ts
├── navigation.ts
└── performance.ts

docs/          ← GitHub Pages (producción)
├── index.html
├── effects.js (compilado desde src/)
└── simple-effects.js

public/        ← Desarrollo local (Vite)
├── effects.js (copiado desde docs/)
└── simple-effects.js
```

## 🔄 Comandos Automáticos

### **Para Desarrollo:**
```bash
npm run dev
# Abre: http://localhost:5173
```

### **Para Compilar y Desplegar:**
```bash
npm run deploy
# Compila TypeScript → JavaScript
# Copia archivos a ambas carpetas
# Listo para GitHub Pages
```

### **Solo Compilar:**
```bash
npm run build:docs
```

## 💡 Workflow Optimizado

1. **Editas**: Solo en `/src/` (TypeScript)
2. **Compilas**: `npm run build:docs`
3. **Pruebas**: `npm run dev` (desarrollo) o `python3 -m http.server 8080` (producción)
4. **Despliegas**: Git push (GitHub Pages se actualiza automáticamente)

## 🎯 Beneficios

- ✅ **Una sola fuente de verdad**: Todo en `/src/`
- ✅ **Automatización**: Un comando hace todo
- ✅ **Type safety**: TypeScript detecta errores
- ✅ **Performance**: JavaScript optimizado
- ✅ **Mantenimiento**: Fácil de actualizar

## 🚀 Próximos Pasos

1. **Eliminar duplicación manual**
2. **Usar solo `/src/` para editar**
3. **Automatizar con GitHub Actions** (opcional)
