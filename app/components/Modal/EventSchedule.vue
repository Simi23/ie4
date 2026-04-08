<template>
  <UModal :ui="{ background: 'bg-transparent dark:bg-transparent' }">
    <UCard>
      <template #header>
        <h1 class="text-2xl font-bold">
          Esemény {{ init ? "szerkesztése" : "felvétele" }}
        </h1>
      </template>
      <UForm :state="state" :schema="schema" @submit="scheduleEvent">
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
          <UFormGroup label="Cím" name="title">
            <UInput v-model="state.title" />
          </UFormGroup>
          <UFormGroup
            label="Kis cím (felső)"
            name="smallTitle"
            description="Nem kötelező"
          >
            <UInput v-model="state.smallTitle" />
          </UFormGroup>
          <UFormGroup
            label="Leírás"
            name="description"
            description="Nem kötelező"
          >
            <UInput v-model="state.description" />
          </UFormGroup>
          <div class="flex flex-row flex-nowrap justify-end">
            <UButton
              class="mt-6"
              type="submit"
              :label="`Esemény ${init ? 'mentése' : 'létrehozása'}`"
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
  init?: {
    id: string;
    startTime: Date;
    started: boolean;
    show: boolean;
    title: string;
    mediaId?: string;
    smallTitle?: string;
    description?: string;
  };
};
const props = defineProps<Props>();
const emit = defineEmits<{
  success: [];
}>();

const current = new Date();
const state = ref({
  date: {
    year: (props.init?.startTime ?? current).getFullYear(),
    month: (props.init?.startTime ?? current).getMonth() + 1,
    day: (props.init?.startTime ?? current).getDate(),
    hour: (props.init?.startTime ?? current).getHours(),
    minute: (props.init?.startTime ?? current).getMinutes(),
  },
  started: props.init?.started ?? false,
  show: props.init?.show ?? false,
  mediaId: props.init?.mediaId ?? "",
  title: props.init?.title ?? "",
  smallTitle: props.init?.smallTitle ?? "",
  description: props.init?.description ?? "",
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
  title: z.string(),
  smallTitle: z.string().optional(),
  description: z.string().optional(),
});

async function scheduleNewEvent() {
  loading.value = true;

  const [err] = await catchError(
    $fetchCsrfNotification<NotificationResponse>("/api/event/general", {
      method: "POST",
      body: {
        startTime: getTimeString(
          state.value.date.year,
          state.value.date.month,
          state.value.date.day,
          state.value.date.hour,
          state.value.date.minute,
        ),
        timeZone: "Europe/Budapest",
        started: state.value.started,
        show: state.value.show,
        title: state.value.title,
        smallTitle: state.value.smallTitle,
        description: state.value.description,
        mediaId: state.value.mediaId,
      },
    }),
  );

  if (!err) {
    emit("success");
  }

  loading.value = false;
}

async function updateEvent() {
  loading.value = true;

  const [err] = await catchError(
    $fetchCsrfNotification<NotificationResponse>(
      `/api/event/general/${props.init!.id}`,
      {
        method: "PUT",
        body: {
          startTime: getTimeString(
            state.value.date.year,
            state.value.date.month,
            state.value.date.day,
            state.value.date.hour,
            state.value.date.minute,
          ),
          timeZone: "Europe/Budapest",
          started: state.value.started,
          show: state.value.show,
          title: state.value.title,
          smallTitle: state.value.smallTitle,
          description: state.value.description,
          mediaId: state.value.mediaId,
        },
      },
    ),
  );

  if (!err) {
    emit("success");
  }

  loading.value = false;
}

async function scheduleEvent() {
  if (props.init) {
    await updateEvent();
  } else {
    await scheduleNewEvent();
  }
}
</script>

<style></style>
