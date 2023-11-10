# ADR 1: Microservices pattern
## Context
There is a new request for building a dentist appointment-booking system that allows users to book appointments for dentists in Gothenburg.
</br>
</br>
The system shall be able to handle users' appointments (including creation, cancellation, and modification of appointments).
</br>
</br>
Moreover, the system shall allow users to create (login and sign up features), modify, or delete their profiles.
</br>
## Decision
We will make use of the microservices architectural pattern. Our microservices architectural pattern is a combination of the client-server and publish-subscribe architectural patterns. 
</br>
## Status
Accepted
</br>
## Consequences
#### Positives:
The microservices architecture decouples the system's core functionalities into isolated service-oriented components. This makes the system modifiable, fault tolerant, and secure. 
</br>
</br>
Since each service's code and configuration is isolated, adding a service will not impact other services.
</br>
</br>
If one service is down, the whole system does not become unavailable, but rather only the affected service.
</br>
</br>
The system has an isolated service for authorisation. This isolation of authorisation stops attackers from stealing data. Moreover, using a broker, makes the communication between services secure as only the services know the topics to which they are publishing or subscribing.
</br>
#### Negatives:
The microservices architecture is quite complex. This is risky in terms of the time resource available to develop the project.
</br>
</br>
Moreover, the communication between services is dependent on the correct functionality and availability of the broker. If the broker is down, services will not function because they cannot communicate without a working broker. One possible solution is to make the broker redundant.


