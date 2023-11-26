import type { Request, Response } from 'express';

/**
 * Used to login a dentist into the system.
 * @param req request
 * @param res response
 * @returns response object
 */
export const logout = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  const { sessionKey } = req.cookies; // Get the session key from the cookies.
  if (sessionKey == null) {
    return res.status(400).json({ message: 'No active session' });
  }

  res.clearCookie('sessionKey', { domain: 'localhost', path: '/' });
  return res.sendStatus(200);
};
/**
 * Wrap the login handler in a sync function for the route handler
 * @param req request
 * @param res response
 */
export const logoutDentistWrapper = (req: Request, res: Response): void => {
  void logout(req, res);
};
