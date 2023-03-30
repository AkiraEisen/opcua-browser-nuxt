<template>
  <div>{{response.content}}</div>
</template>

<script setup lang="ts">
  console.log('fuck1')
  const {data: response}: any = await useFetch('/api/opcua')
  console.log('fuck2')
</script>

<style scoped>

</style>
