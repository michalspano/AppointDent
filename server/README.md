## Usage

Install dependencies with:

```bash
$ npm install
```

## Directory structure

- `.eslintrc.js`: linter configuration file.
- `.env`: **local** environment variables to overwrite default configuration options.
- `.env.sample`: sample environment variables to be used as a template for `.env`.
- `app.ts`: the **entry point** of the server-side application.
- `tsconfig.json`: TypeScript configuration file.
- `package.json` - Dependencies, script definitions for Node.js.
- `config/`: configuration files for the server-side application.
- `controllers/`: communication middleware between the server-side application and other components of the application.
- `routes/`: routing definitions based on the middleware.
- `scripts/`: scripts for the server-side application.
- `public/`: static files for the server-side application.
- `dist/`: the build folder for the server-side application.

## Available Scripts

In the `server` subdirectory, you can run:

### `npm run dev`

Runs the server-side application in the development mode, in port `3000` and `localhost` by default.

### `npm run build`

Builds the server-side application for production to the `dist` folder.

### `npm run start`

Runs the server-side application in the production mode, based on the `dist` folder.

### `npm run lint`

Runs the linter on the `server` folder.

### `npm run lint:fix`

Runs the linter on the `server` folder and fixes the errors.

### `npm run kill-service:port :<<PORT>>`

Kills the service running at the specified port

### `npm run populate-db`

Populates the database with 20 different patients and dentists. 

**Login details**
- dentist1@example.com $\to$ dentist20@example.com
- patient1@example.com $\to$ patient20@example.com

**Password**
- `secretpassword`

*Note:* **requires the broker, server and services to be running**.

## Deployment

TBD.
