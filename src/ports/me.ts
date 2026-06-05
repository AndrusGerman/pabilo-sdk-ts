import type { User, Plan } from '../domain/types.js';

export interface IMePort {
  getMe(): Promise<User>;
  getPlan(): Promise<Plan>;
}
