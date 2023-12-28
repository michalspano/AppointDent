## Technology

### SolidJS
**[Solid.js](https://www.solidjs.com/)** is a declarative JavaScript library for creating user interfaces. Instead of using a Virtual DOM, it compiles its templates to real DOM nodes and updates them with fine-grained reactions.

### TypeScript
**[TypeScript](https://github.com/microsoft/TypeScript)** is a strongly-typed programming language that builds on **JavaScript**. **TypeScript** uses `type inference` to figure out types of variables, functions, and return values in different parts of the programme.

### ESLint
**[ESLint](https://eslint.org/)** is a code analyzer that statically analyzes code base on the instructions that the developers provide for it in the `.eslintrc.json` file. Using this file developers can configure and tailor the behavior of **ESLint**. **ESLint** uses the instructions and finds syntax problems, unreachable code, and indentation problems etc.

### Tailwind CSS
**[Tailwind CSS](https://tailwindcss.com/)** is a utility-first CSS framework that provides built-in classes that can be used to build the design of a website. **Tailwind CSS** contains classes that can be used and make the design responsive as well. **Tailwind CSS** is helpful in this sense that upon using it, the developer does not have to write and come up with their own CSS classes as tailwind provides a variety of different utility classes.

### LeafletJS
**[Leaflet.js](https://leafletjs.com/)** is an open source JavaScript library used to build web mapping components.

### FullCalendar
**[FullCalendar](https://fullcalendar.io/)** is a calendar library that accepts `JSX` syntax. It provides a calendar and can be customized to create events on the calendar.

### Vite
**[Vite](https://vitejs.dev/)** is a build tool used to create a better development experience for web projects. **Vite** provides a dev server for developers with rich feature enhancements. It also uses `Rollup` to bundle the code.

## Usage

Install dependencies with:

```bash
$ npm install
```

## File structure
* `.eslintrc.json` - Eslint configuration.
* `.gitignore` - Ignored files.
* `index.html` - Served html file to client. (SPA entry point)
* `package.json` - Dependencies, script definitions.
* `tailwind.config.js` - Theme configuration
* `postcss.config.js` - PostCSS configuration (required for tailwind)
* `tsconfig.json` - TS config
* `tsconfig.node.json` - TS config
* `vite.config.ts` - Vite configuration
* `/src/index.tsx` - Entry component for SPA.
* `/src/index.css` - Root CSS rules.
* `/src/routes/*` - Shall contain components that represent pages on the SPA.
* `/src/components/*` - Folders named after routes. Contain helper components, unless it is a general component like `Navbar` which is present on many pages.


## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode, but lints it first.<br>
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles `Solid` in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>

## Deployment

TBD.
