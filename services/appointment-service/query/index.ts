/**
 * query/index.ts
 *
 * @description :: Prepared statements for the appointment service.
 * @version     :: 1.0
 */
import * as GET from './get';
import * as POST from './post';
import * as DELETE from './delete';
import * as PATCH from './patch';

export default { GET, POST, DELETE, PATCH };
