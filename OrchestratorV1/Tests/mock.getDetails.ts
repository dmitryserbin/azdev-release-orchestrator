import { IReleaseDetails } from "../interfaces";
import { getReleaseDetails } from "../azdev";

const details: IReleaseDetails = getReleaseDetails();

console.log(details);
