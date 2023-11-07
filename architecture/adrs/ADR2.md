# ADR 2: REST architecture
## Context
The ptoject will make use of the microservices pattern (ADR 1) to build the dentist appointment-booking application requested by the customers. Moreover, upon deployment on a cloud, the services may become redundant. Therefore, there is a need for having stateless requets.
</br>
## Descision
We will make use of the REST architecture. The REST arhitecture contains 6 different constraints (the sixth on is optional). The developers must conform to this six constraints when building the system. 
</br>
## Status
Accepted
</br>
## Consequences
#### Positives:
REST architecture, forces requests to be stateless. As a result, any redundant service in the backend can be used. 
Moreover, REST makes use of HATEOAS As a part of the uniform interfaces constraint. This feature will make the API of the application explorable and simple to understand.
</br>