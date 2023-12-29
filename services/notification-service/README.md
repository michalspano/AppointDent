## Usage

Install dependencies with:

```bash
$ npm install
```

## Directory structure

- `.eslintrc.js`: linter configuration file.
- `.env`: **local** environment variables to overwrite default configuration options.
- `.env.sample`: sample environment variables to be used as a template for `.env`.
- `app.ts`: the **entry point** of the service.
- `tsconfig.json`: TypeScript configuration file.
- `package.json` - Dependencies, script definitions for Node.js.
- `config/`: configuration files for the service.
- `db/`: database connection, configuration and schema definitions.
- `controllers/`: communication middleware between the service and other components of the system.
- `routes/`: routing definitions based on the middleware of the service.
- `public/`: static files for the service.
- `dist/`: the build folder for the service.

## Available Scripts

In the `services/<SERVICE_NAME>` subdirectory, you can run:

### `npm run dev`

Runs the current service in the development mode, in port `3004` and `localhost` by default.

### `npm run build`

Builds the current service for production to the `dist` folder.

### `npm run start`

Runs the current service in the production mode, based on the `dist` folder.

### `npm run lint`

Runs the linter on the `server` folder.

### `npm run dropdb`

Drops all the tables from the current service. In other words, this command removes all data from the current service.

### `npm run lint:fix`

Runs the linter on the `server` folder and fixes the errors.

### Additional scripts (based on the service's needs)

The section is deleted if the service does not need additional scripts.

## Deployment

TBD.
