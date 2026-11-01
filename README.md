# 🎬 CINEVERSE

## Sobre el proyecto

CINEVERSE es un proyecto que desarrollé con Angular con el objetivo de crear una plataforma web donde pueda explorar y consultar información sobre películas, series, actores y contenido relacionado con el mundo cinematográfico.

Para desarrollar esta aplicación, utilicé la API de The Movie Database (TMDB), que me permite obtener información actualizada sobre las producciones audiovisuales, como sus sinopsis, imágenes, fechas de estreno, géneros y puntuaciones.

Mi objetivo es ofrecer una experiencia sencilla, intuitiva y visualmente atractiva, donde los usuarios puedan descubrir contenido y encontrar información sobre sus películas y series favoritas.

## 🚀 Funcionalidades

Durante el desarrollo de CINEVERSE estoy implementando diferentes funcionalidades:

- **Películas:** consultar películas, sus detalles, géneros, puntuaciones y recomendaciones.
- **Series:** explorar series de televisión y consultar información sobre sus temporadas y episodios.
- **Actores:** buscar actores y conocer información sobre sus participaciones.
- **Búsqueda global:** buscar películas, series y actores desde el navbar.
- **Rankings:** consultar clasificaciones de películas y series según sus puntuaciones.
- **Colecciones:** explorar sagas y universos cinematográficos.
- **Streaming:** consultar contenido disponible en diferentes plataformas.
- **Favoritos:** organizar el contenido que más me interesa.
- **Lista por ver:** guardar películas y series que quiero ver posteriormente.
- **Próximos estrenos:** consultar las próximas películas que llegarán a los cines.

## 🛠️ Tecnologías utilizadas

Para desarrollar este proyecto estoy utilizando las siguientes tecnologías:

| Tecnología | Uso |
|---|---|
| Angular | Desarrollo de la aplicación frontend |
| TypeScript | Lógica y tipado de la aplicación |
| HTML5 | Estructura de las vistas |
| CSS3 | Diseño y estilos |
| RxJS | Manejo de operaciones asíncronas |
| TMDB API | Obtención de información cinematográfica |
| pnpm | Administración de dependencias |

## 📂 Organización del proyecto

Organicé el proyecto utilizando una estructura basada en funcionalidades para mantener el código ordenado y facilitar su mantenimiento.

```text
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   └── service/
│   ├── features/
│   │   ├── home/
│   │   ├── movies/
│   │   ├── series/
│   │   ├── actors/
│   │   ├── rankings/
│   │   ├── streaming/
│   │   └── ...
│   ├── layouts/
│   ├── app.config.ts
│   └── app.routes.ts
├── environments/
├── assets/
└── styles.css
```

- **core:** aquí centralizo los servicios y modelos que utiliza la aplicación.
- **features:** organizo cada módulo según su funcionalidad, por ejemplo películas, series y rankings.
- **layouts:** contiene la estructura general de navegación de la aplicación.
- **environments:** contiene la configuración de los diferentes entornos.

## ⚙️ Requisitos para ejecutar el proyecto

Antes de ejecutar CINEVERSE, es necesario tener instalado:

- Node.js.
- pnpm.
- Angular CLI.
- Una cuenta en TMDB para obtener una API Key.

## 📥 Instalación

Primero, clono el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
```

Ingreso a la carpeta del proyecto:

```bash
cd peliculas-app
```

Instalo las dependencias:

```bash
pnpm install
```

## 🔑 Configuración de la API de TMDB

Para obtener la información cinematográfica utilizo la API de TMDB.

Para configurar el acceso:

1. Ingreso a [The Movie Database](https://www.themoviedb.org/).
2. Creo una cuenta y solicito una API Key.
3. Configuro mi archivo local `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  tmdbApiKey: 'MI_API_KEY',
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  tmdbImageUrl: 'https://image.tmdb.org/t/p'
};
```

La API Key se mantiene fuera del repositorio mediante `.gitignore`, para evitar publicarla accidentalmente en GitHub.

Para producción utilizo `environment.production.ts` y la configuración de reemplazo de archivos de Angular.

**Nota:** Las claves incluidas en una aplicación frontend pueden ser visibles desde el navegador. Para protegerlas realmente se necesitaría utilizar un backend intermediario.

## ▶️ Ejecutar el proyecto

Para iniciar la aplicación en modo desarrollo utilizo:

```bash
pnpm start
```

Luego ingreso desde el navegador a:

```text
http://localhost:4200
```

## 📦 Compilación para producción

Cuando quiero generar la versión de producción ejecuto:

```bash
pnpm build
```

Angular genera los archivos optimizados en:

```text
dist/peliculas-app/browser
```

## ☁️ Despliegue

Tengo previsto utilizar Vercel para publicar CINEVERSE y permitir que otras personas puedan acceder a la aplicación.

La configuración de compilación será:

| Configuración | Valor |
|---|---|
| Framework Preset | Angular |
| Install Command | `pnpm install` |
| Build Command | `pnpm build` |
| Output Directory | `dist/peliculas-app/browser` |

## 🔗 Recursos

- [The Movie Database](https://www.themoviedb.org/)
- [Documentación de TMDB API](https://developer.themoviedb.org/docs)
- [Angular](https://angular.dev/)
- [Vercel](https://vercel.com/)

## 👨‍💻 Autor

Proyecto desarrollado por mí como parte de mi aprendizaje y crecimiento profesional en el desarrollo frontend.

---

**CINEVERSE – Explora, descubre y disfruta el mundo del cine.** 🎬
