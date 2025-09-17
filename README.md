# QuadKern - Página de Construcción

Página web de "en construcción" para QuadKern.

## Desarrollado por:
- Augusto Canepa
- Lautaro Pereyra
- Nicolas Ferraro
- Mateo Garcia

## Estructura del Proyecto

```
Web/
├── docs/                 # Archivos para GitHub Pages
│   ├── index.html       # Página principal
│   ├── style.css        # Estilos
│   ├── QuadkernLogo.png # Logo
│   └── fonts/           # Fuentes
├── public/              # Archivos originales
├── src/                 # Archivos TypeScript
└── package.json
```

## Configuración para GitHub Pages

1. Sube este repositorio a GitHub
2. Ve a Settings > Pages
3. En "Source", selecciona "Deploy from a branch"
4. Selecciona "main" como branch y "/docs" como folder
5. Guarda la configuración

Tu sitio estará disponible en: `https://tuusuario.github.io/nombre-del-repo`

## Dominio Personalizado

Para conectar con tu dominio de GoDaddy:

1. En GitHub Pages settings, agrega tu dominio personalizado
2. Crea un archivo `CNAME` en la carpeta `docs/` con tu dominio
3. Configura los DNS en GoDaddy apuntando a GitHub Pages

## Archivos Importantes

- `docs/index.html` - Página principal
- `docs/style.css` - Estilos CSS
- `docs/QuadkernLogo.png` - Logo de QuadKern
