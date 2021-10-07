import { IBuildFilter } from "../common/ibuildfilter";

export interface IFiltrator {

    createBuildFilter(): Promise<IBuildFilter>

}
