/**
 * Validate the format of an MQTT request array.
 * @param msgArr The array representing the MQTT request.
 * @description This method validates that the MQTT request has a correct format
 * and throws an error with the correct request format.
 */
export async function validateRequestFormat (msgArr: string[]): Promise<void> {
  if (!msgArr[msgArr.length - 1].includes('*')) {
    throw Error('Could not find "*" in message! Please double check that you are sending the full data!');
  }
  if (msgArr.length !== 4) {
    throw Error('Invalid format: REQID/EMAIL/PASSWORD/*');
  }
}
