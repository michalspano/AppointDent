# ADR 6: MQTT protocol to communicate with the broker
## Context
The system uses the microservices architectural pattern (ADR 1). Different services need to communicate to each other using a broker. The services need to make use of a suitable potocol to communicate with the broker.
</br>
## Descision
We will make use of the MQTT protocol to communicate with the broker. The services, moreover, will make use of the mqtt library to make the connection. 
</br>
## Status
Accepted
</br>
## Consequences
#### Positives:
MQTT is suitable for having asynchronous communication. As we are using NodeJS (ADR 5) which is customised for making asunchronous communication, using MQTT is a great choice for the project.
</br>
#### Negatives:
Information is sometimes lost when using the MQTT protocol. The services need to create mechanisms to make sure that if data is malformed or lost, they can recognise it and request for it again.