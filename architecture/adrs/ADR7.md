# ADR 7: TypeScript for type-chcking
## Context
The system is being developed using JavaScript both in front-end and back-end (ADR 4 and 5).
</br>
</br>
JavaScript is a dynamically typed programming langauge. Moreover, if some attirbute of variable does not exist and the program tries to access it, JavaSvript does not throw errors, but rather returns <code>undefined</code>. 
</br>
</br>
Even though, these features give freedom to the developer, they also make it hard to find bugs (that is if developers learn about their existance). The system needs to be maintainable, meanining that bugs are found easier and the cost of maintanenace is reduced.
</br>
## Descision
We will make use TypeScript rather than writing JavaScript code.
</br>
## Status
Accepted
</br>
## Consequences
#### Positives:
TypeScript allows us to define types and label variables with them, so that the variable can only save values of the its type. This way, we can find bugs early on and fix them, as the TypeScript code will not compile to JavaScript.
</br>
#### Negatives:
Depending on how the developers will make use of TypeScript, it can take away some of the freedom the devlopers have compared to Javasvript. 