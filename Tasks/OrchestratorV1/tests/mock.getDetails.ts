import { getReleaseDetails } from "../azdev";
import { IReleaseDetails } from "../interfaces";

const details: IReleaseDetails = getReleaseDetails();

console.log(details);
