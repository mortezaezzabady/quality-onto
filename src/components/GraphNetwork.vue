<script setup lang="ts">
import type { Graph } from '@/models'
import { ref } from 'vue'
import {
  type Layouts,
  defineConfigs,
  type Edge,
  type PathEvent,
  type NodeEvent,
  type EdgeEvent,
  type EventHandlers
} from 'v-network-graph'
import {
  ForceLayout,
  type ForceNodeDatum,
  type ForceEdgeDatum
} from 'v-network-graph/lib/force-layout'

const { graph } = defineProps<{ graph: Graph }>()

function showContextMenu(element: HTMLElement, event: MouseEvent) {
  element.style.left = event.x - event.layerX + 'px'
  element.style.top = event.y - event.layerY + 'px'
  console.log(
    event.x,
    event.y,
    event.layerX,
    event.layerY,
    event.pageX,
    event.pageY,
    event.offsetX,
    event.offsetY,
    event.screenX,
    event.screenY
  )
  element.style.visibility = 'visible'
  const handler = (event: PointerEvent) => {
    if (!event.target || !element.contains(event.target as HTMLElement)) {
      element.style.visibility = 'hidden'
      document.removeEventListener('pointerdown', handler, { capture: true })
    }
  }
  document.addEventListener('pointerdown', handler, { passive: true, capture: true })
}

const nodeMenu = ref<HTMLDivElement>()
const menuTargetNode = ref('')
function showNodeContextMenu(params: NodeEvent<MouseEvent>) {
  const { node, event } = params
  event.stopPropagation()
  event.preventDefault()
  if (nodeMenu.value) {
    menuTargetNode.value = graph.nodes[node].name ?? ''
    showContextMenu(nodeMenu.value, event)
  }
}

const pathMenu = ref<HTMLDivElement>()
const menuTargetPaths = ref<string[]>([])
function showPathContextMenu(params: PathEvent<MouseEvent>) {
  const { path, event } = params
  event.stopPropagation()
  event.preventDefault()
  if (pathMenu.value) {
    menuTargetPaths.value = [graph.paths[path].text ?? '', graph.paths[path].score ?? '']
    showContextMenu(pathMenu.value, event)
  }
}

const eventHandlers: EventHandlers = {
  'path:click': showPathContextMenu
}

const configs = defineConfigs({
  view: {
    scalingObjects: true,
    layoutHandler: new ForceLayout({
      positionFixedByDrag: false,
      positionFixedByClickWithAltKey: true,
      //noAutoRestartSimulation: true,
      createSimulation: (d3, nodes, edges) => {
        // d3-force parameters
        const forceLink = d3.forceLink<ForceNodeDatum, ForceEdgeDatum>(edges).id((d: Edge) => d.id)
        return d3
          .forceSimulation(nodes)
          .force('edge', forceLink.distance(250).strength(0.5))
          .force('charge', d3.forceManyBody().strength(-200))
          .force('center', d3.forceCenter().strength(0.05))
          .alphaMin(0.001)
        //.stop()
        //.tick(100)
      }
    })
  },
  node: {
    label: {
      fontSize: 9,
      color: '#ffffff',
      direction: 'center'
    },
    normal: {
      radius: 32
    }
  },

  edge: {
    label: {
      fontSize: 7,
      color: '#ffffff'
    },
    normal: {
      width: 3,
      color: '#4466cc'
    },
    hover: {
      width: 4
    },
    gap: 20,
    margin: 6,
    marker: {
      target: {
        type: 'arrow',
        width: 4,
        height: 4
      }
    }
  },
  path: {
    visible: true,
    clickable: true,
    hoverable: true,
    selectable: true,
    curveInNode: false,
    end: 'edgeOfNode', // "centerOfNode" or "edgeOfNode"
    margin: 10,
    normal: {
      width: 10,
      dasharray: '',
      linecap: 'round',
      linejoin: 'round',
      animate: false,
      animationSpeed: 50
    },
    hover: {
      width: 12,
      color: '#ff000088',
      dasharray: '',
      linecap: 'round',
      linejoin: 'round',
      animate: false,
      animationSpeed: 50
    },
    selected: {
      width: 12,
      color: '#ff000088',
      dasharray: '6 16',
      linecap: 'round',
      linejoin: 'round',
      animate: true,
      animationSpeed: 30
    },
    zOrder: {
      enabled: true,
      zIndex: (n) => n.zIndex,
      bringToFrontOnHover: true,
      bringToFrontOnSelected: true
    }
  }
})
</script>

<template>
  <div class="h-[30rem]">
    <v-network-graph
      class="graph w-full h-full"
      :nodes="graph.nodes"
      :edges="graph.edges"
      :paths="graph.paths"
      :configs="configs"
      :event-handlers="eventHandlers"
    >
      <template #edge-label="{ edge, hovered, selected, ...slotProps }">
        <v-edge-label
          :text="edge.label"
          align="center"
          vertical-align="above"
          v-bind="slotProps"
          :class="{ hovered, selected }"
        />
      </template>
    </v-network-graph>
    <div
      ref="nodeMenu"
      class="w-32 bg-background p-3 fixed invisible text-sm border-1 rounded-sm border-border shadow-md"
    >
      Menu for the nodes
      <div>{{ menuTargetNode }}</div>
    </div>
    <div
      ref="pathMenu"
      class="w-32 bg-background p-3 fixed invisible text-sm border-1 rounded-sm border-border shadow-md"
    >
      Menu for the edges
      <div>{{ menuTargetPaths.join(', ') }}</div>
    </div>
  </div>
</template>

<style lang="css">
/* In some cases, :deep() selector may be necessary. */
.v-ng-edge-label {
  transition: fill 0.1s;
}
.v-ng-edge-label.hovered {
  fill: #3355bb;
  font-weight: bold;
}
</style>
