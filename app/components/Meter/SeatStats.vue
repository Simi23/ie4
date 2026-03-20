<template>
  <div>
    <h2 class="mb-2 text-lg font-semibold">Helyek</h2>
    <UProgress
      :value="seatStats.occupiedSeats"
      :max="seatStats.totalSeats"
      color="warning"
      size="lg"
      class="my-2 w-1/3 min-w-64"
    >
    </UProgress>
    <p>
      Összes: <span class="text-gray-200">{{ seatStats.totalSeats }}</span>
    </p>
    <p>
      Foglalt:
      <span class="text-amber-400">{{ seatStats.occupiedSeats }}</span>
    </p>
    <p>
      Szabad:
      <span class="text-emerald-500">{{ seatStats.freeSeats }}</span>
    </p>
  </div>
</template>

<script lang="ts" setup>
const { data: seatStats, refresh: refreshSeatStats } = useFetch(
  "/api/stat/seats",
  {
    lazy: true,
    default: () => {
      return {
        totalSeats: 0,
        freeSeats: 0,
        occupiedSeats: 0,
        hiddenSeats: 0,
      };
    },
  },
);
</script>

<style></style>
