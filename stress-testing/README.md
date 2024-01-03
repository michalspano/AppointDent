## Technology

### TypeScript
**[TypeScript](https://github.com/microsoft/TypeScript)** is a strongly-typed programming language that builds on **JavaScript**. **TypeScript** uses `type inference` to figure out types of variables, functions, and return values in different parts of the programme.

### ESLint
**[ESLint](https://eslint.org/)** is a code analyzer that statically analyzes code base on the instructions that the developers provide for it in the `.eslintrc.json` file. Using this file developers can configure and tailor the behavior of **ESLint**. **ESLint** uses the instructions and finds syntax problems, unreachable code, and indentation problems etc.

## Webpack
**[Webpack](https://webpack.js.org/)** is a **JavaScript** module bundler that is used to bundle all `.js` files into one which is usually put in a directory called `dist`. Webpack also works on `HTML` and `CSS`, meaning that all `.html` and `.css` files are bundled into one and placed in the `dist` directory.

## K6
**[K6](https://k6.io/)** is an open-source load, sometimes called stress, testing tool that is used to measure the performance and reliability of a system as the number of client request (in case of our system) increases. In other words, **K6** helps measure the scalability of the system.


## Babel.js
**[Babel.js](https://babeljs.io/)** is an open-source **Javascript** transcompiler. Transcompilers are used to convert **ECMAScript 2015+** javascript code into backwards-compatible code that is runnable by older JavaScript engines. This is used so that older browsers can also run the client code.

## Usage

Install `node` dependencies with:

```bash
# This will not install k6
$ npm install
```

For the **stress-testing** to work, a **global** installation of `k6` is
required. The instructions can be found
[here](https://k6.io/docs/get-started/installation/).

## Directory structure

- `.eslintrc.js`: linter configuration file.
- `.babelrc`: Babel configuration file.
- `webpack.config.js`: Webpack configuration file.
- `tsconfig.json`: TypeScript configuration file.
- `package.json` - Dependencies, script definitions for Node.js.
- `dist/`: build folder for the k6 tests.
- `src/`: the source folder for the k6 tests.

## Available Scripts

In the `stress-testing` subdirectory, you can run:

### `npm run build`

Builds the current service for production to the `dist` folder.

### `npm run lint`

Runs the linter on the `server` folder.

### `npm run dentist`

Stress-tests the **Dentist** service.

### `npm run patient`

Stress-tests the **Patient** service.

### `npm run Session`

Stress-tests the **Session** service.

### `npm run notification`

Stress-tests the **Notification** service.

### `npm run create-appointment`

Stress-tests the **appointment creation** functionality (end-point) that resides in the **Appointment** service.

### `npm run book-appointment`

Stress-tests the **appointment booking** functionality (end-point) that resides in the **Appointment** service.
