declare global {
  namespace Express {
    interface Locals {
      auth?: {
        userId: string;
        role: string;
      };
    }
  }
}

export {};
