<script setup lang="ts">
import type { Graph } from '@/models'
import { type Layouts, defineConfigs } from 'v-network-graph'

const { graph } = defineProps<{ graph: Graph }>()

const configs = defineConfigs({
  edge: {
    normal: {
      color: '#4466cc'
    }
  }
})
</script>

<template>
  <div class="aspect-square">
    <v-network-graph
      class="graph w-full h-full"
      :nodes="graph.nodes"
      :edges="graph.edges"
      :configs="configs"
    />
  </div>
</template>
