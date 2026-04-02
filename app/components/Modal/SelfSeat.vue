<template>
  <UModal>
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">Ülőhely kiválasztása</h1>
      </template>
      <div class="mb-4">
        <ReactiveSeatMap
          svg-id="selfseatmap"
          v-model="selectedSeat"
          :seats="seats"
          single
        />
      </div>
      <MapLegend color="text-[#0687d6]">Kiválasztott hely</MapLegend>
      <MapLegend color="text-[#059669]">Szabad helyek</MapLegend>
      <MapLegend color="text-[#b91c1c]">Foglalt helyek</MapLegend>

      <div class="text-md my-6">
        <p class="text-xl font-bold">Kiválasztott ülőhely:</p>
        {{ selectedSeat[0] ?? "Nincs" }}
      </div>

      <div v-if="data && data.group">
        <h2 class="mb-2 text-lg font-semibold">Az ültetési csoport tagjai:</h2>
        <ul class="pl-2">
          <li v-for="user in data.group.users">{{ user.fullname }}</li>
        </ul>
        <template v-if="data.group.reason">
          <h2 class="mb-2 mt-4 text-lg font-semibold">Az összeültetés oka:</h2>
          {{ data.group.reason }}
        </template>
      </div>

      <template #footer>
        <div class="flex flex-row flex-nowrap justify-end">
          <div class="space-x-2">
            <UButton label="Mégse" color="indigo" @click="emit('cancel')" />
            <UButton
              label="Megerősít"
              color="emerald"
              @click="handleSelfSeat()"
              :disabled="selectedSeat.length == 0 || loading"
              :loading="loading"
            />
          </div>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
const selectedSeat = ref([]);

const { data } = await useFetch("/api/seat/group/my");

type SeatDefinition = {
  name: string;
  color: string;
  selectable?: boolean;
  selectedColor?: string;
};

const loading = ref(false);

const inactive = "#059669";
const active = "#0687d6";

const seats = computed<SeatDefinition[]>(() => {
  const output: SeatDefinition[] = [];

  if (!data.value?.group) return output;

  output.push(
    ...data.value.group.seats.map((s) => ({
      name: s.name,
      color: s.owner ? "#b91c1c" : inactive,
      selectable: s.owner == null,
      selectedColor: s.owner ? undefined : active,
    })),
  );

  return output;
});

const emit = defineEmits<{
  cancel: [];
  success: [];
}>();

async function handleSelfSeat() {
  loading.value = true;

  const [error] = await catchError(
    $fetchCsrfNotification<NotificationResponse>("/api/seat/self", {
      method: "POST",
      body: {
        seatName: selectedSeat.value[0],
      },
    }),
  );

  loading.value = false;

  if (!error) {
    emit("success");
  }
}
</script>

<style></style>
