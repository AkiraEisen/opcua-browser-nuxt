import {defineEventHandler, getQuery} from "h3";
import OpcUAClient from "~/utils/OpcClient";

export default defineEventHandler(async (event) => {
  const {endpoint} = getQuery(event);
  return (await OpcUAClient.get()).changeEndpoint(endpoint as string);
})
