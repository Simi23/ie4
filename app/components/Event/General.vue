<template>
  <p v-if="smallTitle" class="text-2xl font-semibold uppercase text-gray-400">
    {{ smallTitle }}
  </p>
  <h2 class="text-6xl font-extrabold text-gray-50">
    {{ title }}
  </h2>
  <p v-if="description" class="mt-4 text-2xl font-semibold text-gray-200">
    {{ description }}
  </p>
</template>

<script lang="ts" setup>
type Props = {
  title: string;
  smallTitle?: string;
  description?: string;
};
const props = defineProps<Props>();
</script>

<style></style>
