import { APLogs } from '../../interfaces/transactionInterfaces';

export function convertArgs(args: object): APLogs['args'] | undefined {
    const convertedArgs: Partial<APLogs['args']> = {};
  
    for (const key in args) {
      if (Object.prototype.hasOwnProperty.call(args, key)) {
        (convertedArgs as Record<string, any>)[key] = (args as Record<string, any>)[key];
      }
    }
  
    return convertedArgs as APLogs['args']; // Cast to APLogs['args'] to assert the final type
  }