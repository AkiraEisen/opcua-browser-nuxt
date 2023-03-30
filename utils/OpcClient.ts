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
  
  private endpoint: string | null = null;
  
  private connection: OPCUAClient | null = null;
  
  private constructor() {
  }
  
  public static async get() : Promise<OpcUAClient> {
    if (this.client) {
      return this.client;
    } else {
      this.client = new OpcUAClient();
      return this.client;
    }
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
    // const ENDPOINT: string = 'opc.tcp://192.168.1.88:4840';
    const CONNECTION_STRATEGY = {
      initialDelay: 1000,
      maxRetry: 1
    }
    
    this.connection = OPCUAClient.create({
      applicationName: 'test',
      connectionStrategy: CONNECTION_STRATEGY,
      securityMode: MessageSecurityMode.None,
      securityPolicy: SecurityPolicy.None,
      endpointMustExist: false,
      keepSessionAlive: true
    })
    
    if (this.endpoint != null) {
      await this.connection.connect(this.endpoint);
      return await this.connection.createSession();
    } else {
      return null;
    }
  }
  
  private async getSession() {
    console.log(`use session: [${this.session?.sessionId}][${this.session?.name}]`)
    if(this.session === null) {
      this.session = await this.connect();
      console.log(`create session: [${this.session?.sessionId}][${this.session?.name}]`)
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
  
  public async changeEndpoint(endpoint: string) {
    this.endpoint = endpoint;
    await this.connection?.disconnect();
    this.session = null;
    return {
      status: true
    }
  }
  
  public async browse(root: string) {
    await this.getSession();
  
    const parent: Item = {
      name: 'Root',
      nodeId: (root && root !== '') ? root : 'RootFolder',
      children: []
    }
    
    let browseResult;
    try {
      browseResult = await this.session?.browse(String(parent?.nodeId))
    } catch (exception) {
      return {status: false}
      console.log(exception)
    }
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
    let value;
  
    try {
      value = await this.session?.read(valueRead, 0)
    } catch (exception) {
      return {status: false}
      
    }
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
    let result;
    try {
      result = await this.session?.write(nodesToWrite);
    } catch (exception) {
      return {status: false}
      console.log(exception)
    }
    
    console.log('write result: ', result)
    return {
      status: true
    }
  }
}

export default OpcUAClient;
