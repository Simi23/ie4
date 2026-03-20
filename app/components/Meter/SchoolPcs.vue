<template>
  <div>
    <h2 class="mb-2 text-lg font-semibold">Iskolai PC-k</h2>
    <UProgress
      :value="pcStats.occupiedPcs"
      :max="pcStats.totalPcs"
      color="warning"
      size="lg"
      class="my-2 w-1/3 min-w-64"
    >
    </UProgress>
    <p>
      Összes: <span class="text-gray-200">{{ pcStats.totalPcs }}</span>
    </p>
    <p>
      Foglalt:
      <span class="text-amber-400">{{ pcStats.occupiedPcs }}</span>
    </p>
    <p>
      Szabad: <span class="text-emerald-500">{{ pcStats.freePcs }}</span>
    </p>
  </div>
</template>

<script lang="ts" setup>
const { data: pcStats, refresh: refreshPcStats } = useFetch(
  "/api/stat/schoolpc",
  {
    lazy: true,
    default: () => {
      return {
        totalPcs: 0,
        freePcs: 0,
        occupiedPcs: 0,
      };
    },
  },
);
</script>

<style></style>
