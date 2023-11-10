# ADR 8: Sqlite3 for database
## Context
The system needs to be be informed if one of the services has failed. Detection of faults is an important quality that the system needs to posses in order to find sources of faults during development time. 
</br>
## Decision
We will make use of the heartbeat availability technique by forcing each service to publish their heartbeat to the broker. Other services can subscribe to the topic and be notified of errors
</br>
## Status
Accepted
</br>
## Consequences
#### Positives:
This way, all services can be notified when another service fails. As a result faults are detected early on (and possibly fixed) and system's availability is increased.
</br>
#### Negatives:
Considering the amount of data that flows through the broker (you can refer to the component diagram), this will even put more stress on the broker which can affect the broker's performance (loss of data, latency).