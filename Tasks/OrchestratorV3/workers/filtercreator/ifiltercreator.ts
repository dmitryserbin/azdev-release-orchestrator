import { IFilters } from "../../helpers/taskhelper/ifilters";
import { IBuildFilter } from "./ibuildfilter";
import { IResourcesFilter } from "./iresourcesfilter";

export interface IFilterCreator {

    createResourcesFilter(filters: IFilters): Promise<IResourcesFilter>;
    createBuildFilter(): Promise<IBuildFilter>;

}
