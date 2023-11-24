export interface QueryResult {
  changes: number
  lastInsertRowid: number
}

export interface AuthenticationRequest {
  reqId: string
  email: string
  session_key: string
};

export interface Session {
  hash: string
  token: string
  expiry: number
}

export interface CreateSessionRequest {
  reqId: string
  email: string
  password: string
};
export interface User {
  email: string
  password_hash: string
  session_hash: string
};

export interface CreateUser {
  reqId: string
  email: string
  password: string
  session_hash: string
};

export interface DeleteUserRequest {
  reqId: string
  email: string
  session_key: string
}
