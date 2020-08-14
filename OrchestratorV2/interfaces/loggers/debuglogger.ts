import Debug from "debug";

export interface IDebugLogger {

    create(name: string): IDebugger;

}

export interface IDebugger extends Debug.Debugger {

    /* */

}
