import type { UserBank } from '../domain/types.js';

export interface IBankAccountsPort {
  list(): Promise<UserBank[]>;
}
