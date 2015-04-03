/// <reference path="DefinitelyTyped.d.ts" />

// self-declaring packages:
/// <reference path="../node_modules/lexing/lexing.d.ts" />

// internal type declarations:
declare module "loge" {
  interface Logger {
    level: string;
    silly(...args: any[]): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    critical(...args: any[]): void;
  }
  var logger: Logger;
  export = logger;
}
