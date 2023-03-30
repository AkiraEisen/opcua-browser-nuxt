<template>

  <div class="flex flex-col h-full ml-2 mr-2 mt-4" v-loading="state.loading.global">
    <!-- menu -->
    <div class="flex flex-row mb-2">
      <el-button size="small" type="primary" class="mr-2" @click="onchangeEndpoint">连接</el-button>
      <el-input size="small" v-model="state.endpoint"></el-input>
    </div>
    <div class="flex flex-row">
      <el-button size="small" @click="onLoadTree" type="primary" disabled>加载数据</el-button>
      <el-button size="small" @click="() => {state.root = null;state.root = 'RootFolder'}" class="ml-2 mr-2" type="primary">设置默认</el-button>
      <el-input size="small" v-model="state.root"></el-input>

    </div>
    <div v-if="state.ready" class="flex h-full mt-2" :style="{height: state.height + 'px'}" v-loading="state.loading.detail">
      <el-card class="flex-shrink-0" style="width: 400px">
        <!-- :data="state.tree" -->
        <el-tree
            v-if="state.root"
            :expand-on-click-node="false"
            :load="onLoad"
            :lazy="true"
            :props="DefaultProps"
            @node-click="onDetail"></el-tree>
      </el-card>
      <el-card class="flex-grow flex flex-col ml-2">
        <div class="flex flex-row">
          <div style="width: 200px">
            <div>{{state.current?.name}}</div>
            <div>{{state.current?.nodeId}}</div>
            <div>{{state.current?.type}}[{{state.current?.typeOrigin}}]</div>
          </div>
          <div class="flex-grow flex flex-col">
            <div class="flex flex-row" v-if="state.current && state.current.type !== 'ExtensionObject'">
              <el-input v-model="state.write"></el-input>
              <el-button type="primary" class="ml-2" @click="onWrite">写入</el-button>
            </div>
          </div>
        </div>
        <el-divider></el-divider>
        <vue-json-pretty :data="state.current?.value" class="overflow-y-scroll" :style="{height: (state.height - 150) + 'px'}"></vue-json-pretty>
      </el-card>
    </div>

  </div>
</template>

<script setup lang="ts">

import {onMounted, reactive} from "vue";
import VueJsonPretty from "vue-json-pretty";
import {ElNotification} from "element-plus";

  interface Item {
    name: String | null | undefined,
    nodeId?: String,
    children?: Item[]
  }

  interface State {
    tree: Item[],
    current?: {
      name: string,
      nodeId: string,
      type: string,
      typeOrigin: number,
      value: any
    },
    root: string,
    loading: {
      global: boolean,
      detail: boolean
    },
    write: any,
    height: number,
    endpoint: string,
    ready: boolean,
  }

  const state = reactive({
    tree: [],
    root: 'RootFolder',
    loading: {
      global: false,
      detail: false
    },
    write: '',
    height: 800,
    endpoint: 'opc.tcp://192.168.1.88:4840',
    ready: true
  } as State)


  onMounted(() => {
    state.height = window.innerHeight - 100;
  })

  const onLoadTree = async () => {
    state.loading.global = true
    const {data: response}: any = await useFetch('/api/opcua-all', {query: {root: state.root}});
    state.tree = []
    state.tree.push(response.value.content)
    state.loading.global = false
  }

  const onLoad = async (node: any, resolve: (data: Item[] ) => void) => {
    if (node.level === 0) {
      return resolve([{
        name: 'root',
        nodeId: state.root
      }])
    }

    const {data} = await useFetch('/api/opcua-browse', {query: {root: node?.data?.nodeId}})
    if (data.value?.status) {
      resolve(data.value.content)
    } else {
      ElNotification({
        title: 'Error',
        message: '数据加载失败！',
        type: 'error',
      })
    }
    // resolve()

  }

  const onDetail = async (node: any) => {
    state.loading.detail = true
    const {data: result} = await useFetch('/api/opcua-detail', {query: {node: node.nodeId}});
    if (result?.value?.status) {
      state.current = {
        name: node.name,
        nodeId: node.nodeId,
        type: result?.value?.content?.type as string,
        typeOrigin: result?.value?.content?.typeOrigin as number,
        value: result?.value?.content?.value
      }
    } else {
      ElNotification({
        title: 'Error',
        message: '数据加载失败！',
        type: 'error',
      })
    }

    state.loading.detail = false
  }

  const onchangeEndpoint = async () => {
    state.loading.global = true
    state.ready = false
    if (state.endpoint) {
      const {data: result} = await useFetch('/api/opcua-change-endpoint', {query: {endpoint: state.endpoint}});
      if (result.value?.status) {
        state.ready = true
      }
    }
    state.loading.global = false
  }

  const onWrite = async () => {
    state.loading.detail = true
    const {data: result} = await useFetch('/api/opcua-write', {query: {
      node: state.current?.nodeId,
      value: state.write,
      type: state.current?.typeOrigin
    }});

    if (result.value?.status) {
      ElNotification({
        title: 'Success',
        message: '数据写入成功！',
        type: 'success',
      })
    } else {
      ElNotification({
        title: 'Error',
        message: '数据加载失败！',
        type: 'error',
      })
    }

    const {data: r} = await useFetch('/api/opcua-detail', {query: {node: state.current?.nodeId}});
    if (r.value?.status) {
      ElNotification({
        title: 'Success',
        message: '数据读取成功！',
        type: 'success',
      })
      if (state.current) {
        state.current.value = r?.value?.content?.value;
      }
    } else {
      ElNotification({
        title: 'Error',
        message: '数据加载失败！',
        type: 'error',
      })
    }

    state.loading.detail = false
  }

  const DefaultProps = {
    children: 'children',
    label: 'name',
  }

</script>

<style scoped>

</style>
