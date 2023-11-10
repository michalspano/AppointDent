# ADR 3: User Authorisation
## Context
A dentist appointment-booking application needs to offer integrity and confidentiality of data to its users. Users should be able to see and change, only their own data and not other users' data. To achieve good security and offer these qualities, the system needs to use some kind of authorisation.
</br>
## Decision
We will have an authorisation service that talks to the other services via the broker. This service will handle the authorisation of users.
</br>
## Status
Accepted
</br>
## Consequences
#### Positives:
As the authorisation service is isolated and communicates to other services via the the broker, this means that the no user can directly access the the authorisation service.
</br>
#### Negatives:
This is a wall-bearing component in the system. If it is down, it can cause availability issues for the other services that need to authorise the sent request.
</br>
</br>
Since other components will need to communicate with this service to authorise users, the broker's role becomes crucial. More data will flow in the broker, and this can cause performance issues. The broker might become unavailable if it is bloated with information.