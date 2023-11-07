# ADR 1: Microservices pattern
## Context
There is a new request for building a dentist appointment-booking system that allows users to book appointments for dentists in Gothenburg.
</br>
</br>
The system should be able to handle users' appointments (including creation, cancellation, and modification of appointments).
</br>
</br>
Moreover, the system should allow users to create (login and sign up features), modify, or delete their profiles.
</br>
</br>
Stakeholders deem the system to be scalable, modifiable, secure, and fault tolerant.
</br>
## Descision
We will make use of the microservices architectural pattern. The microservices architectural pattern is a combination of the client-server and publish-subscribe architectural patterns. 
</br>
## Status
Accepted
</br>
## Consequences
#### Positives:
The microservices architecture decouples the services from one another. This makes the system both modifiable, fault tolerant, and secure. 
</br>
</br>
Since each service uses its own databse, adding a service will not impact other services.
</br>
</br>
If one service is down, the whole system does not become unavailable, but rather one part of it.
</br>
</br>
The system has an isolated service for authorisation. This isolation of authorisation makes stops attackers to steal information form the service. Moreover, using a broker, makes the communication between services secure as only the services know the topics to which they are publishing or subscribing.
</br>
#### Negatives:
The microservices architecture is quite complex. This is risky in terms of the time resource available to develop the project.
</br>
</br>
Moreover, the communication between services is dependent on the corect functionality and availability of the broker. If the broker is down, some services will not function correctly due to the fact that they cannot communicate and aquire needed information. One possible solution is to make the broker redundant.


