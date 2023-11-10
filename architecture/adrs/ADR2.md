# ADR 2: REST architecture
## Context
The project will make use of the microservices pattern (ADR 1) to build the dentist appointment-booking application requested by the customers.
</br>
</br>
Moreover, upon deployment on a cloud, the services may become redundant. Therefore, there is a need for having stateless requets. 
</br>
</br>
REST also causes separation of concerns by forcing the seperation of presentation and logic views into client and server blocks.
</br>
## Decision
We will make use of the REST architecture. The REST arhitecture contains 6 different constraints (the sixth one is optional). The developers must conform to these six constrains when developing the REST API which is mentioned [here](https://www.kennethlange.com/books/The-Little-Book-on-REST-Services.pdf). 
</br>
## Status
Accepted
</br>
## Consequences
#### Positives:
REST architecture, forces requests to be stateless. As a result,the active redundancy availability technique can be used in the back-end. The developers need to respect this constraint and must not make requests dependent on each other.
</br>
</br>
Moreover, REST makes use of HATEOAS as a part of the uniform interfaces constraint. This feature will make the API of the application explorable and simple to understand. Therefore, developers need to send suitable hyperlinks back along with each response to a REST request.
</br>
</br>
Since we are using microservices (ADR 1), the system is already seperated into client and server blocks. Therefore, it is suiatable to use in the project.