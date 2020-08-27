import { IDebugLogger } from "./debuglogger";

export interface IDebugCreator {

    extend(name: string): IDebugLogger;

}
