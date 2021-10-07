import { IBuildFilter } from "./ibuildfilter";

export interface IFilterCreator {

    createBuildFilter(): Promise<IBuildFilter>

}
