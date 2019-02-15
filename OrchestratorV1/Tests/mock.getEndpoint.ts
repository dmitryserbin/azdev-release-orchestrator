import { IEndpoint } from "../interfaces";
import { getEndpoint } from "../azdev";

const endpoint: IEndpoint = getEndpoint();

console.log(endpoint);
