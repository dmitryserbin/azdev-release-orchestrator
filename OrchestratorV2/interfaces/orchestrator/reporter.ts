import { IReleaseProgress } from "../common/releaseprogress";

export interface IReporter {

    validate(releaseProgress: IReleaseProgress): Promise<void>;
    display(releaseProgress: IReleaseProgress): Promise<void>;

}
