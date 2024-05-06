<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { computed, ref } from 'vue'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { ChatResponse } from './models'

interface ChatResponseSection {
  content: string
  highlighted: boolean
}

const prompt = ref<string>('')
const model = ref<'gpt' | 'llama'>('gpt')
const isLoading = ref<boolean>(false)
const chatResponse = ref<ChatResponse | null>(null)
const chatResponseStyle = computed<ChatResponseSection[]>(() => {
  if (chatResponse.value == null) return []
  const response = chatResponse.value.entities
    .sort((a, b) => b.length - a.length)
    .reduce(
      (out, e) =>
        out.flatMap((o) =>
          o.content
            .split(e)
            .map((c) => ({ highlighted: o.highlighted, content: c }))
            .flatMap((c) => [c, { highlighted: true, content: e }])
            .slice(0, -1)
        ),
      [{ highlighted: false, content: chatResponse.value.response }]
    )
  console.log(response)
  return response
})

async function sendPrompt($event: Event) {
  $event.preventDefault()
  if (isLoading.value) return

  isLoading.value = true
  try {
    const response = await fetch('http://127.0.0.1:8000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: prompt.value,
        model: 'gpt' //model.value
      })
    })

    const r = await response.json()
    console.log(r)
    chatResponse.value = r as ChatResponse
  } catch {}
  isLoading.value = false
}
</script>

<template>
  <header></header>
  <div class="dark bg-background text-foreground min-h-screen">
    <form
      class="flex gap-2 items-center justify-center w-full mx-auto"
      @submit="sendPrompt"
      :class="
        chatResponse ? 'flex-row w-[100rem] max-w-[calc(100%-10rem)] pt-8' : 'flex-col min-h-screen'
      "
    >
      <div
        class="flex flex-row gap-2 items-center"
        :class="chatResponse ? 'grow' : 'w-[100rem] max-w-[calc(100%-10rem)]'"
      >
        <Input v-model="prompt" placeholder="Query" class="grow" />

        <div class="grow-0 w-48">
          <Select v-model="model">
            <SelectTrigger>
              <SelectValue placeholder="Select an LLM" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="gpt"> GPT-3.5 </SelectItem>
                <SelectItem value="llama"> Llama 3 </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" :disabled="isLoading"> send </Button>
    </form>
    <div v-if="chatResponse != null">
      <span v-for="resp in chatResponseStyle" :class="resp.highlighted ? 'text-red-600' : ''">
        {{ resp.content }}
      </span>
      {{ ' ' }}
    </div>
  </div>
</template>
