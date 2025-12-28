<h2 align="center">AppointDent &#129463;&#129701;</h2>

**AppointDent** is a **full-stack web application** that allows residents of
Sweden to manage their dentist appointments. It also helps dentists to organize
their work. The system relies on a **distributed system** infrastructure that
combines various architectural styles: namely **microservices**, *pub-sub* and
*client-server*.

<img src="imgs/appointdent-teaser.png" alt="AppointDent Teaser"/><br>

**Table of Contents**

- [Introduction](#introduction)
- [Tech-stack](#tech-stack)
- [Pre-Requirements](#pre-requirements)
  - [Installation, Setup, and Running](#installation-setup-and-running)
- [Architecture](#architecture)
- [System's Overview](#systems-overview)
- [Continuous Integration](#continuous-integration)
- [Development team](#development-team)

## Introduction

**AppointDent** is a system that allows residents of **Sweden** to book dentist
appointments. A user can find available times and see the dentist on an
integrated map.

AppointDent allows users to book appointments, cancel them, as well as receive
notifications about their bookings. The dentists in our system make use of a
calendar to navigate their appointments and manage their availability.

The solution is based on a **distributed system** infrastructure that combines
various architectural styles, namely **microservices**, **publish-subscribe**
and **client-server**.

## Tech-stack

- [TypeScript](https://github.com/microsoft/TypeScript) (client, server, services)
- [Node.js](https://nodejs.org/en/) (client, server, services)
- [Vite.js](https://vitejs.dev/) (client)
- [Express.js](https://expressjs.com/) (server, services)
- [Solid.js](https://www.solidjs.com/) (client)
- [Sqlite3](https://www.sqlite.org/index.html) (`node` wrapper: [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)) \[services\]
- [Tailwind CSS](https://tailwindcss.com/) (client)

### Installation, Setup, and Running

The codebase is hosted in this **monorepo** with system components having their
subfolders (and `README.md` files with specific instructions).

The file contains the instructions on how to install all dependencies, it explains the structure of the directory, and it lists all the available scripts (with possible clarifications).

The following is a list of the available sub-folders:

- [**client**](./client/README.md): the client-side application.
- [**server**](./server/README.md): the server-side application (informally, the `APIGateway/Proxy`).
- [**services/admin-service**](./services/admin-service/README.md): the additional service that adds an abstraction of an admin to observe the system's state and trends.
- [**services/appointment-service**](./services/appointment-service/README.md): the service that handles all the appointment-related operations.
- [**services/dentist-service**](./services/dentist-service/README.md): the service that handles all the dentist-related operations.
- [**services/notification-service**](./services/notification-service/README.md): the service that enables the system to send notifications to the users upon certain events.
- [**services/patient-service**](./services/patient-service/README.md): the service that handles all the patient-related operations.
- [**services/session-service**](./services/session-service/README.md): a central service that handles all sessions of the users to enforce authentication and authorization.
- [**stress-testing**](./stress-testing/README.md): a folder that contains the scripts that are used to stress-test the system at a high load.

> [!NOTE]
> The `services` are not meant to be run individually, but rather as a part of
> the `server` application. They can be run individually for testing purposes
> or for the ease of development.

## Architecture

Our system is a **distributed** one and we have therefore decided to use a
**Microservices-based architecture**. This means that different services are to
be installed on different computers and are completely independent. The `MQTT`
(Message Queue Telemetry Transport) protocol is implemented as the primary
communication utility between the individual services of our system.
See our [Component Diagram](#systems-overview) for a detailed overview of the
architecture in use.

Furthermore, several other decisions that have a substantial
impact on the architecture that the team members dealt with during the project's
development may be traced with the [**ADRs**](./adrs/).

## System's Overview

The following section aims to provide an overview of the **system's
architecture**, as well as the **deployment strategy**. The individual diagrams
can observed when clicking on the dropdowns.

<details>
  <summary>1. Entity Relationship (ER) Diagram</summary>

  ![ER Diagram](./diagrams/ERdiagram.png)

</details>

<details>
  <summary>2. Component Diagram</summary>

  ![Component Diagram](./diagrams/ComponentDiagram.png)

</details>

<details>
  <summary>3. Deployment Diagram</summary>

  ![DeploymentDiagram](./diagrams/DeploymentDiagram.png)

</details>
