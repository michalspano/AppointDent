# ADR 8: Sqlite3 for database
## Context
Different services need to save user data on a database. The servers need to be able to apply CRUD operations on the data saved. The database needs to be lightweight. The system makes use of microservices architecture (ADR 1). As a result, each service needs to have its database isolated.
</br>
## Decision
We will make use of Sqlite3 which is a DBMS (Database Management System) to store user data in the services. Moreover, we will make use of the better-sql library in each service's code, to apply CRUD operations
</br>
## Status
Accepted
</br>
## Consequences
#### Positives:
There were many choices for a DBMS including Postgresql, MongoDB and etc. When we were brainstorming about the project, we had first chosen to use Postgresql and [sequelize library](https://sequelize.org/). After some research, we found out that it was pretty cumbersome to use TypeScript (ADR 7) and sequelize. Therefore, another solution was found. We decided to use [Sqlite3](https://www.sqlite.org/index.html) which is serverless and also lightweight. This way, each database instance is bound to their service. Developers will not need to connect to a SQL server over the network. Developers will have to access the database from a local <code>.db</code> file stored in the respective service's root folder.
</br>
</br>
Moreover, Sqlite3 can read <code>.sql</code> files directly, thus removing the need to make a model using some library (As we had do if we used sequelize).
</br>
#### Negatives:
Sqlite3 is lightweight and only recommended if up to 1TB of data is to be saved on it. Therefore, the developers must ensure that each services' DB size does not exceed 1TB. After this threshold, performance may be degraded.