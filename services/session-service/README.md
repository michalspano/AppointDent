## Technology

### Express.js
**[Express.js](https://expressjs.com/)** is a **Node.js** web application framework which by providing a set of web application features allows developers to easily build APIs and, hence, web applications (backend)

### Sqlite3
**[Sqlite](https://www.sqlite.org/index.html)** is a C-language library that implements a small and self-contained SQL database engine. **Sqlite3** is the latest version of **Sqlite**. **Sqlite** is local, meaning that the the database file (`.db` which contains the data) is on the same machine (or environment) that the schema resides. This means that **Sqlite** is serverless. This property of **Sqlite** makes it pretty fast. The library used to do **CRUD** operations is called **[better-sqlite3](https://github.com/WiseLibs/better-sqlite3)**.

### TypeScript
**[TypeScript](https://github.com/microsoft/TypeScript)** is a strongly-typed programming language that builds on **JavaScript**. **TypeScript** uses `type inference` to figure out types of variables, functions, and return values in different parts of the programme.

### ESLint
**[ESLint](https://eslint.org/)** is a code analyzer that statically analyzes code base on the instructions that the developers provide for it in the `.eslintrc.json` file. Using this file developers can configure and tailor the behavior of **ESLint**. **ESLint** uses the instructions and finds syntax problems, unreachable code, and indentation problems etc.

### mqtt
**[mqtt](https://github.com/mqttjs/MQTT.js#readme)** is a client library for the **[MQTT](https://mqtt.org/)** protocol. It is written in **JavaScript** for **Node.js** and the browser. For those who do not kno what **MQTT** is, **MQTT** is a protocol used in the publish subscribe architectural style for components to communicate with each other. It makes use of a **Message bus**, usually called **the broker** to communicate the message with other components.

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

Runs the current service in the development mode, in port `3001` and `localhost` by default.

### `npm run build`

Builds the current service for production to the `dist` folder.

### `npm run start`

Runs the current service in the production mode, based on the `dist` folder.

### `npm run lint`

Runs the linter on the `server` folder.

### `npm run lint:fix`

Runs the linter on the `server` folder and fixes the errors.

### Additional scripts (based on the service's needs)

The section is deleted if the service does not need additional scripts.

## Deployment

TBD.
