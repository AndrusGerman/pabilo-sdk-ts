import type { UserBank, CreateUserBankRequest } from '../domain/types.js';

export interface IBankAccountsPort {
  list(): Promise<UserBank[]>;
  create(req: CreateUserBankRequest): Promise<UserBank>;
}
