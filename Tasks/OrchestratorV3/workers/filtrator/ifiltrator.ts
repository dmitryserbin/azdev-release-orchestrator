import { IBuildFilter } from "./ibuildfilter";

export interface IFiltrator {

    createBuildFilter(): Promise<IBuildFilter>

}
