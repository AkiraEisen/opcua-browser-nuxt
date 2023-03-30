import {
  AttributeIds,
  ClientSession, DataType,
  MessageSecurityMode,
  OPCUAClient,
  ReferenceDescription,
  SecurityPolicy
} from "node-opcua";


interface Item {
  name: String | null | undefined,
  nodeId?: String,
  children?: Item[]
}

class OpcUAClient {
  
  private static client: OpcUAClient;
  
  private session: ClientSession | null = null;
  
  private constructor() {
  }
  
  public static async get() : Promise<OpcUAClient> {
    this.client = new OpcUAClient();
    return this.client;
  }
  
  private async _browse(parent: Item, session: ClientSession) {
    const browseResult = await session.browse(String(parent?.nodeId));
    if (browseResult.references != null) {
      for (let key in browseResult.references) {
        const ref: ReferenceDescription = browseResult.references[key];
        const child = {
          name: ref.displayName?.text?.toString(),
          nodeId: ref.nodeId.toString(),
          children: []
        };
        await this._browse(child, session);
        parent.children?.push(child);
      }
    }
  }
  
  
  private async connect() {
    const ENDPOINT: string = 'opc.tcp://192.168.1.88:4840';
    const CONNECTION_STRATEGY = {
      initialDelay: 1000,
      maxRetry: 1
    }
    
    const client: OPCUAClient = OPCUAClient.create({
      applicationName: 'test',
      connectionStrategy: CONNECTION_STRATEGY,
      securityMode: MessageSecurityMode.None,
      securityPolicy: SecurityPolicy.None,
      endpointMustExist: false
    })
    
    await client.connect(ENDPOINT);
    
    return await client.createSession();
  }
  
  private async getSession() {
    if(this.session == null) {
      this.session = await this.connect();
    }
  }
  
  public async listAll(root: string) {
    
    await this.getSession();
  
    const parent: Item = {
      name: 'Root',
      nodeId: (root && root !== '') ? root : 'RootFolder',
      children: []
    }
    await this._browse(parent, this.session as ClientSession);
  
    return {
      status: true,
      content: parent
    };
  }
  
  public async browse(root: string) {
    await this.getSession();
  
    const parent: Item = {
      name: 'Root',
      nodeId: (root && root !== '') ? root : 'RootFolder',
      children: []
    }
    const browseResult = await this.session?.browse(String(parent?.nodeId));
    if (browseResult?.references != null) {
      for (let key in browseResult.references) {
        const ref: ReferenceDescription = browseResult.references[key];
        const child = {
          name: ref.displayName?.text?.toString(),
          nodeId: ref.nodeId.toString(),
          children: []
        };
        // await this._browse(child, session);
        parent.children?.push(child);
      }
    }
    
    return {
      status: true,
      content: parent.children
    }
    
  }
  
  public async getDetail(node: string) {
    await this.getSession();
    const valueRead = {
      nodeId: node,
      attributeId: AttributeIds.Value
    };
    const value = await this.session?.read(valueRead, 0);
    return {
      status: true,
      content: {
        type: DataType[value?.value?.dataType as number],
        typeOrigin: value?.value?.dataType,
        value: value?.value?.value
      }
    }
  }
  
  public async write(node: string, value: any, type: number) {
    await this.getSession();
  
    const nodesToWrite = [
      {
        nodeId: node,
        attributeId: AttributeIds.Value,
        value: /*new DataValue(*/{
          value: {/* Variant */dataType: Number(type), value: value}
        }
      }
    ];
    console.log(nodesToWrite[0].value.value)
  
    const result = await this.session?.write(nodesToWrite);
    console.log('write result: ', result)
    return {
      status: true
    }
  }
}

export default OpcUAClient;
