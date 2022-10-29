export interface ICommonHelper {

    wait(count: number): Promise<void>;
    parseKeyValue(input: string): [string, string];

}
