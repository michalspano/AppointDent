import type { Request, Response } from 'express';

/**
 * Used to log out a dentist into the system.
 * @param req request
 * @param res response
 */
export const logout = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  const { sessionKey } = req.cookies; // Get the session key from the cookies.
  if (sessionKey == null) {
    return res.status(400).json({ message: 'No active session' });
  }

  res.clearCookie('sessionKey');
  return res.sendStatus(200);
};
/**
 * Wrap the log out handler in a sync function for the route handler
 * @param req request
 * @param res response
 */
export const logoutPatientWrapper = (req: Request, res: Response): void => {
  void logout(req, res);
};
