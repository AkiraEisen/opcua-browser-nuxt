import {defineEventHandler, getQuery} from "h3";
import OpcUAClient from "~/utils/OpcClient";


export default defineEventHandler(async (event) => {
  const {node} = getQuery(event);
  return (await OpcUAClient.get()).getDetail(node as string);
})
