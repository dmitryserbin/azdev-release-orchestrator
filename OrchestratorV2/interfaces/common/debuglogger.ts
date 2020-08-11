import Debug from "debug";

export interface IDebugLogger {

    create(name: string): Debug.Debugger;

}
