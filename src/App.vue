<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { computed, ref } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import GraphNetwork from './components/GraphNetwork.vue'
import VueMarkdown from 'vue-markdown-render'
import type { ChatResponse } from './models'
import * as Config from './config'

const prompt = ref<string>('')
const model = ref<'gpt' | 'llama'>('gpt')
const isLoading = ref<boolean>(false)
const chatResponse = ref<ChatResponse | null>(null)
const chatResponseStyled = computed<string>(() => {
  if (chatResponse.value == null) return ''
  const escapedTerms = chatResponse.value.entities_hyp.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  )
  const regex = new RegExp(escapedTerms.join('|'), 'gi')
  return chatResponse.value.hypothesis.replace(
    regex,
    (match) => `<span class="highlight">${match}</span>`
  )
})

async function sendPrompt($event: Event) {
  $event.preventDefault()
  if (isLoading.value) return

  isLoading.value = true
  try {
    const response = await fetch(`${Config.BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: prompt.value,
        model: model.value
      })
    })

    const r = await response.json()
    chatResponse.value = r as ChatResponse
    console.log(chatResponse.value.graph.edges)
  } catch (error) {
    console.log(error)
  }
  isLoading.value = false
}
</script>

<template>
  <header></header>
  <div class="text-foreground min-h-screen box-border px-5 sm:px-8">
    <form
      class="flex gap-2 justify-center mx-auto max-w-7xl"
      @submit="sendPrompt"
      :class="
        chatResponse
          ? 'flex-col sm:flex-row pt-5 sm:pt-8 items-center'
          : 'flex-col min-h-screen items-end'
      "
    >
      <div
        class="flex flex-col sm:flex-row gap-2 items-center w-full"
        :class="chatResponse ? 'grow' : 'w-full'"
      >
        <Input v-model="prompt" placeholder="Query" class="grow" />

        <div class="grow-0 shrink-0 w-full sm:w-48">
          <Select v-model="model">
            <SelectTrigger>
              <SelectValue placeholder="Select an LLM" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="gpt">GPT-3.5</SelectItem>
                <SelectItem value="llama">Llama 3</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" :disabled="isLoading" class="w-full sm:w-48">
        <Loader2 class="w-5 h-5 animate-spin" v-if="isLoading" />
        <span v-else>send</span>
      </Button>
    </form>
    <div class="max-w-7xl mx-auto mt-10 pb-5 gap-3 flex flex-col" v-if="chatResponse">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-col lg:flex-row lg:items-start">
        <Card class="lg:flex-1 bg-transparent">
          <CardHeader class="relative">
            <div class="absolute end-8 text-accent">Step 1</div>
            <CardTitle>Initial Response</CardTitle>
            <CardDescription>Entities extracted by the LLM are highlighted.</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-html="chatResponseStyled"></div>
          </CardContent>
        </Card>
        <Card class="bg-transparent">
          <CardHeader class="relative">
            <div class="absolute end-8 text-accent">Step 2</div>
            <CardTitle>KG Entities</CardTitle>
            <CardDescription>
              Entities similar to LLM-extracted entities inside our knowledge graph.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Badge v-for="entity in chatResponse.entities_kg" :key="entity" class="me-1.5 mb-1">
                {{ entity }}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card class="bg-transparent lg:col-span-2">
          <CardHeader class="relative">
            <CardTitle>Stuff</CardTitle>
            <CardDescription>Yes.</CardDescription>
          </CardHeader>
          <CardContent>
            <GraphNetwork :graph="chatResponse.graph" />
          </CardContent>
        </Card>
        <!--<Card class="bg-transparent">
          <CardHeader class="relative">
            <div class="absolute end-8 text-accent">Step 3</div>
            <CardTitle>Top Reasoning Paths </CardTitle>
            <CardDescription>Closests paths in the KG with the initial response.</CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col gap-2">
            <Alert v-for="path in chatResponse.paths" :key="path.score">
              <Network class="h-4 w-4" />
              <AlertTitle>Score: {{ path.score }}</AlertTitle>
              <AlertDescription>
                <code>
                  {{ path.text }}
                </code>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>-->
        <Card class="bg-transparent">
          <CardHeader class="relative">
            <div class="absolute end-8 text-accent">Step 4</div>
            <CardTitle>Enhanced Query</CardTitle>
            <CardDescription>
              Create a query utilizing the paths in knowledge graph.
            </CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col gap-2">
            <VueMarkdown :source="chatResponse.new_query" :options="{ breaks: true }" />
          </CardContent>
          <CardHeader>
            <CardTitle>Enhanced Query Response</CardTitle>
          </CardHeader>
          <CardContent class="flex flex-col gap-2">
            <VueMarkdown :source="chatResponse.response" :options="{ breaks: true }" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<style>
.highlight {
  @apply font-semibold text-primary drop-shadow;
}
</style>
