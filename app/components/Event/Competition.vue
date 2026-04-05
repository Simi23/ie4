<template>
  <p class="text-2xl font-semibold uppercase text-gray-400">
    {{ title }}
  </p>
  <h2 class="text-6xl font-extrabold text-gray-50">
    {{ teamA }}
    <span class="font-normal text-cyan-300">VS</span>
    {{ teamB }}
  </h2>
</template>

<script lang="ts" setup>
type Props = {
  title: string;
  teamA: string;
  teamB: string;
};
const props = defineProps<Props>();
</script>

<style></style>
