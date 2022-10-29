import { IDebugLogger } from "./idebuglogger";

export interface IDebugCreator {

    extend(name: string): IDebugLogger;

}
