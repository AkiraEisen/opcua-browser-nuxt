<template>

  <div class="flex flex-col h-full ml-2 mr-2 mt-4" v-loading="state.loading.global">
    <!-- menu -->
    <div class="flex flex-row">
      <el-button @click="onLoadTree" type="primary" class="mr-2">加载数据</el-button>
      <el-input v-model="state.root"></el-input>
    </div>
    <div class="flex h-full mt-4" :style="{height: height + 'px'}" v-loading="state.loading.detail">
      <el-card class="flex-shrink-0" style="width: 400px">
        <el-tree
            :expand-on-click-node="false"
            :data="state.tree"
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
        <vue-json-pretty :data="state.current?.value" class="overflow-y-scroll" :style="{height: (height - 150) + 'px'}"></vue-json-pretty>
      </el-card>
    </div>

  </div>
</template>

<script setup lang="ts">

import {computed, reactive} from "vue";
import {ElMessage} from "element-plus";
import VueJsonPretty from "vue-json-pretty";

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
    write: any
  }

  const state = reactive({
    tree: [],
    root: 'ns=5;i=339',
    loading: {
      global: false,
      detail: false
    },
    write: ''
  } as State)

  const onLoadTree = async () => {
    state.loading.global = true
    if (state.root && state.root !== '') {
      const {data: response}: any = await useFetch('/api/opcua-all', {query: {root: state.root}});
      state.tree = []
      state.tree.push(response.value.content)
    } else {
      ElMessage.warning("root is empty!")
    }
    state.loading.global = false
  }

  const onDetail = async (node: any) => {
    state.loading.detail = true
    const {data: result} = await useFetch('/api/opcua-detail', {query: {node: node.nodeId}});
    state.current = {
      name: node.name,
      nodeId: node.nodeId,
      type: result?.value?.content?.type as string,
      typeOrigin: result?.value?.content?.typeOrigin as number,
      value: result?.value?.content?.value
    }
    state.loading.detail = false
  }

  const onWrite = async () => {
    state.loading.detail = true
    await useFetch('/api/opcua-write', {query: {
      node: state.current?.nodeId,
      value: state.write,
      type: state.current?.typeOrigin
    }});

    const {data: r} = await useFetch('/api/opcua-detail', {query: {node: state.current?.nodeId}});
    if (state.current) {
      state.current.value = r?.value?.content?.value;
    }
    state.loading.detail = false
  }

  const DefaultProps = {
    children: 'children',
    label: 'name',
  }

  const height = computed(() => {
    return window.innerHeight - 100;
  })
</script>

<style scoped>

</style>
