# ADR 7: Sqlite3 for databse
## Context
Diferent services need to save user data on a databse. The servers need to be able to apply CRUD opperations on the data saved. 
</br>
## Descision
we will make use of Sqlite3 which is a DBMS (Database Management System) to store user data in the services. Moreover, we will make use of the better-sql library in each service's code, to apply the CRUD opperations on user data
</br>
## Status
Accepted
</br>
## Consequences
#### Positives:
There were many choices for a DBMS including Postgresql, MongoDB and etc. When we were brainstormig about the project, we had first chose to use Postgresql and squelise library. After some research, we found out that it was pretty cumbersome to use TypeScript (ADR 7) and squelise. Therefore, another solution was found. We decided to use Squlite3 which is server-less and also light-weighted. This way, each databse instance is bounded to their service.
</br>
</br>
Moreover, Sqlite3 can read schema files directly, thus removing the need to make a model using some library (As we had do that if we used squelise).
</br>
#### Negatives:
Sqlite3 is light-weighted and only recommended if up to 1T of data is to be saved on it. Thereofre, this means that the system cannot be broadened to be used over a country, as an example.