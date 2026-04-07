<template>
  <UModal :ui="{ background: 'bg-transparent dark:bg-transparent' }">
    <UCard>
      <template #header>
        <h1 class="text-2xl font-bold">Meccs menetrendre vétele</h1>
      </template>
      <UForm :state="state" :schema="schema" @submit.prevent="scheduleEvent">
        <div class="space-y-4">
          <UFormGroup label="Időpont" name="date">
            <div class="flex flex-col flex-nowrap gap-1">
              <UInput v-model="state.date.year" type="number" />
              <UInput v-model="state.date.month" type="number" />
              <UInput v-model="state.date.day" type="number" />
              <UInput v-model="state.date.hour" type="number" />
              <UInput v-model="state.date.minute" type="number" />
            </div>
          </UFormGroup>
          <div>
            <p>
              Kiválasztott idő:
              <NuxtTime
                :datetime="calcDate"
                locale="hu-HU"
                year="numeric"
                month="long"
                day="numeric"
                hour="2-digit"
                minute="2-digit"
                :hour12="false"
              />
            </p>
          </div>
          <UFormGroup label="Elkezdődött" name="started">
            <UToggle v-model="state.started" />
          </UFormGroup>
          <UFormGroup label="Látható" name="show">
            <UToggle v-model="state.show" />
          </UFormGroup>
          <UFormGroup label="Háttér" name="mediaId">
            <MediaSelect v-model="state.mediaId" />
          </UFormGroup>
          <div class="flex flex-row flex-nowrap justify-end">
            <UButton
              class="mt-6"
              type="submit"
              label="Időpont létrehozása"
              icon="i-heroicons-plus"
              :disabled="loading"
              :loading="loading"
            />
          </div>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
import z from "zod";

const loading = ref(false);

type Props = {
  bracketPartIds: string[];
  defaultMediaId: string;
};
const props = defineProps<Props>();
const emit = defineEmits<{
  success: [];
}>();

const current = new Date();
const state = ref({
  date: {
    year: current.getFullYear(),
    month: current.getMonth() + 1,
    day: current.getDate(),
    hour: current.getHours(),
    minute: current.getMinutes(),
  },
  started: false,
  show: false,
  mediaId: props.defaultMediaId,
  bracketPartIds: props.bracketPartIds,
});

const calcDate = computed(() => {
  return new Date(
    state.value.date.year,
    state.value.date.month - 1,
    state.value.date.day,
    state.value.date.hour,
    state.value.date.minute,
  );
});

const schema = z.object({
  date: z.object({
    year: z.number().min(1970).max(2100),
    month: z.number().min(1).max(12),
    day: z.number().min(1).max(31),
    hour: z.number().min(0).max(23),
    minute: z.number().min(0).max(59),
  }),
  started: z.boolean(),
  show: z.boolean(),
  mediaId: z.string().optional(),
  bracketPartIds: z.array(z.string()).length(2),
});

async function scheduleEvent() {
  loading.value = true;

  const [err] = await catchError(
    $fetchCsrfNotification<NotificationResponse>("/api/event/match", {
      method: "POST",
      body: {
        startTime: calcDate.value.getTime(),
        timeZone: "Europe/Budapest",
        started: state.value.started,
        show: state.value.show,
        mediaId: state.value.mediaId,
        bracketPartIds: state.value.bracketPartIds,
      },
    }),
  );

  loading.value = false;

  if (!err) {
    emit("success");
  }
}
</script>

<style></style>
