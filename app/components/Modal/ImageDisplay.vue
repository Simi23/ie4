<template>
  <UModal>
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">{{ title }}</h1>
      </template>
      <img v-if="regular" :src="path" />
      <NuxtImg v-else :src="path"></NuxtImg>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
interface Props {
  path: string;
  title: string;
  regular?: boolean;
}
defineProps<Props>();
</script>

<style></style>
