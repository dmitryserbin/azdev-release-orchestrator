import { getEndpoint } from "../azdev";
import { IEndpoint } from "../interfaces";

const endpoint: IEndpoint = getEndpoint();

console.log(endpoint);
