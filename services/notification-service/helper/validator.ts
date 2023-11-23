/**
 * Validate the format of an MQTT request array.
 * @param msgArr The array representing the MQTT request.
 * @description This method validates that the MQTT request has a correct format
 * and throws an error with the incorrect request format.
 */
export async function validateRequestFormat (msgArr: string[]): Promise<undefined | Error> {
  return await new Promise((resolve, reject) => {
    if (!msgArr[msgArr.length - 1].includes('*')) {
      reject(new Error('Could not find "*" in message! Please double check that you are sending the full data!'));
    } else if (msgArr.length !== 3) {
      reject(new Error('Invalid format: EMAIL/MESSAGE/*'));
    } else {
      resolve(undefined);
    }
  });
}
