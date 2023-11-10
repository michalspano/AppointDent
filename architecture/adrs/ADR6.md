# ADR 6: MQTT protocol to communicate with the broker
## Context
The system uses the microservices architectural pattern (ADR 1). Different services need to communicate to each other using a broker. The services need to make use of a suitable potocol to communicate with the broker.
</br>
## Decision
We will make use of the MQTT protocol to communicate with the broker. The services, moreover, will make use of the mqtt library to make the connection. 
</br>
## Status
Accepted
</br>
## Consequences
#### Positives:
Services need a suitable protocol to use to send and receive information to/from the broker. MQTT is a suitable protocol for this task. Moreover, there are already libraries to be used for this task. The development team, therefore, does not have to reinvent the wheel.
</br>
#### Negatives:
Information is sometimes lost when using the MQTT protocol. The services need to create mechanisms to make sure that if data is malformed or lost, they can recognise it and request for it again.