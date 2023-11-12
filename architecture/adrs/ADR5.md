# ADR 5: NodeJS and ExpressJS for back-end development
## Context
The services that process client requests, which make use of REST (ADR 2), need to be able to handle REST requests.
</br>
## Decision
We will make use of NodeJS and ExpressJS for each service. We want to stay consistent. As a result, NodeJS and ExpressJS will be used in all services.
</br>
## Status
Accepted
</br>
## Consequences
#### Positives:
NodeJS is a single-threaded environment which uses v8 engine to compile JavaScript code. Since the team makes use of JavaScript in the front-end it will benefit the team to use Javascript in the back-end as well. This adds consistency to our project. Using the await/async properties of JavaScript, request can be handled asynchronously without blocking the caller to wait for a respond from the callee.
</br>
</br>
ExpressJS allows processing of REST requests in a simple way, compared to other frameworks like Django that uses Python. It is, therefore, suitable to use ExpressJS to handle user requests. This results in a smaller learning curve for the team
</br>
</br>
The development team has familiarity with NodeJS and ExpressJS, thus making it easy to develop the back-end.