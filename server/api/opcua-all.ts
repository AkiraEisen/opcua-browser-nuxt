import {defineEventHandler, getQuery} from "h3";
import OpcUAClient from "~/utils/OpcClient";

export default defineEventHandler(async (event) => {
  const {root} = getQuery(event);
  return (await OpcUAClient.get()).listAll(root as string);
})
