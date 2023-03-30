import {defineStore} from "pinia";
import {ClientSession, OPCUAClient} from "node-opcua";

interface OpcUAClient {
  client: OPCUAClient | null
  session: ClientSession | null
}


interface Item {
  name: String | null | undefined,
  nodeId?: String,
  children?: Item[]
}


export const useOpcUAClient = defineStore('OpcUA', {
  state: (): OpcUAClient => ({
    client: null,
    session: null
  }),
  // actions: {
  //   async list() {
  //     // await check(this);
  //     //
  //     // const parent: Item = {
  //     //   name: 'Root',
  //     //   nodeId: 'ns=5;i=339',
  //     //   children: []
  //     // }
  //     // return await browse(parent, this.session as ClientSession);
  //   }
  // }
})

//
// const check = async (state: any) => {
//   // client检查
//   if (state.client == null) {
//     state.client = await connect();
//   }
//
//   // session检查
//   if(state.session == null) {
//     state.session = await state.client.createSession();
//   }
// }
//
// const connect = async () => {
//   const ENDPOINT: string = 'opc.tcp://192.168.1.88:4840';
//   const CONNECTION_STRATEGY = {
//     initialDelay: 1000,
//     maxRetry: 1
//   }
//
//   const client: OPCUAClient = OPCUAClient.create({
//     applicationName: 'test',
//     connectionStrategy: CONNECTION_STRATEGY,
//     securityMode: MessageSecurityMode.None,
//     securityPolicy: SecurityPolicy.None,
//     endpointMustExist: false
//   })
//
//   await client.connect(ENDPOINT);
//   return client;
// }
//
// const browse = async (parent: Item, session: ClientSession) => {
//   const browseResult = await session.browse(String(parent?.nodeId));
//   if (browseResult.references != null) {
//     for (let key in browseResult.references) {
//       const ref: ReferenceDescription = browseResult.references[key];
//       const child = {
//         name: ref.displayName?.text?.toString(),
//         nodeId: ref.nodeId.toString(),
//         children: []
//       };
//       await browse(child, session);
//       parent.children?.push(child);
//     }
//   }
// }


