import {defineEventHandler, getQuery} from "h3";
import OpcUAClient from "~/utils/OpcClient";


export default defineEventHandler(async (event) => {
  const {node, value, type} = getQuery(event);
  return (await OpcUAClient.get()).write(node as string, value, type as number);
})
