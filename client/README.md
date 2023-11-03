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
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>

## Deployment

TBD.
