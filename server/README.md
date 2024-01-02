## Technology

### Express.js
**[Express.js](https://expressjs.com/)** is a **Node.js** web application framework which by providing a set of web application features allows developers to easily build APIs and, hence, web applications (backend)

### http-proxy
**[http-proxy](https://github.com/http-party/node-http-proxy#readme)** is a library that is used to the proxy in the server (APIGateway) component. Using **http-proxy** the server is turned into a gateway which acts as an intermediatory step for requests that come from the client side. All requests go through the server adn the proxy redirects the requests to the service they are intended for.

### Postman
**[Postman](https://postman.com/)** is an API platform that is used for building and using APIs. **Postman** allows developers to perform integration testing on the backend service of their website. To make use of **Postman** using **npm scripts**, `newman` needs to be installed as well. More information is provided on **Postman's** website.

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

Runs the server-side application in the development mode, on port `3000` and `localhost` by default.

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

### `npm run dropdb:services`

Drops all the tables from all the services. In other words, this command removes the data on all the services.

### `npm run broker`

Runs the broker on port `1883`.

### `npm run populate-db`

Populates the database with 20 different patients and dentists. It also creates 20 appointments in future time for eah dentist.

**Login details**
- dentist1@example.com $\to$ dentist20@example.com
- patient1@example.com $\to$ patient20@example.com

**Password**
- `secretpassword`

*Note:* **requires the broker, server and services to be running**.

## Deployment

The system currently operates on the local level, and any deployment instructions shall be documented here.
