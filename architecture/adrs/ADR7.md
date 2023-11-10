# ADR 7: TypeScript for type-chcking
## Context
The system is being developed using JavaScript both in front-end and back-end (ADR 4 and 5).
</br>
</br>
JavaScript is a dynamically (loosely) typed programming langauge. Therefore, it is error-prone as it has no type-checking chracteristics such as Java or C++. 
</br>
</br>
Even though, JavaScript's characteristics give freedom to developers, they also make it hard to find bugs (that is if developers learn about their existance). The system needs to be maintainable, meanining that bugs are found easier and the cost of maintenance is reduced.
</br>
## Decision
We will use TypeScript for writing code on both client and server sides.
</br>
## Status
Accepted
</br>
## Consequences
#### Positives:
TypeScript allows us to define types and label variables with them, so that the variable can only save values of the its type. This way, we can find bugs early on and fix them, as the TypeScript code will not compile to JavaScript until the bugs are fixed.
</br>
#### Negatives:
Developers will have to conform to the strictness imposed by TypeScript and follow the set type rules specified for the project.