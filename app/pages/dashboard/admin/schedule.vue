<template>
  <div class="space-y-5 p-5 md:space-y-7 md:p-7 lg:space-y-10 lg:p-10">
    <UCard class="dark:bg-opacity-90">
      <template #header>
        <h1 class="text-xl font-bold">Megjelenítés</h1>
      </template>

      <UButton
        icon="i-heroicons-arrow-top-right-on-square"
        label="Link"
        to="/events"
        target="_blank"
      />
    </UCard>
    <UCard class="dark:bg-opacity-90">
      <template #header>
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold">Általános események</h1>
          <UButton
            icon="i-heroicons-plus"
            label="Új esemény"
            @click="newEvent"
          />
        </div>
      </template>
      <template v-if="generalEvents">
        <UTable :rows="generalEvents.events" :columns="generalColumns">
          <template #startTime-data="{ row }">
            <NuxtTime
              :datetime="row.startTime"
              :time-zone="row.timeZone"
              locale="hu-HU"
              year="numeric"
              month="long"
              day="numeric"
              hour="2-digit"
              minute="2-digit"
              :hour12="false"
            />
          </template>
          <template #started-data="{ row }">
            <UBadge
              v-if="row.started"
              label="Elkezdődött"
              color="emerald"
              size="xs"
              variant="subtle"
            />
            <UBadge
              v-else
              label="Még nem kezdődött el"
              color="gray"
              size="xs"
              variant="subtle"
            />
          </template>
          <template #show-data="{ row }">
            <UBadge
              v-if="row.show"
              label="Látható"
              color="emerald"
              size="xs"
              variant="subtle"
              icon="i-heroicons-eye"
            />
            <UBadge
              v-else
              label="Nem látható"
              color="gray"
              size="xs"
              variant="subtle"
              icon="i-heroicons-eye-slash"
            />
          </template>
          <template #action-data="{ row }">
            <div class="flex flex-row gap-2">
              <UButton
                label="Szerkesztés"
                icon="i-heroicons-pencil"
                @click="updateGeneralEvent(row.id)"
              />
              <UButton
                label="Törlés"
                icon="i-heroicons-trash"
                color="red"
                @click="deleteGeneralEvent(row.id)"
              />
            </div>
          </template>
        </UTable>
      </template>
    </UCard>
    <UCard class="dark:bg-opacity-90">
      <template #header>
        <h1 class="text-xl font-bold">Verseny menetrend</h1>
        <h2 class="text-gray-400">Meccs hozzáadása a Mérkőzések menüből!</h2>
      </template>
      <template v-if="matchEvents">
        <UTable :rows="matchEvents" :columns="competitionColumns">
          <template #opponents-data="{ row }">
            <template v-if="row.teamCompetition">
              <p class="mb-2">
                {{ row.teams[0].name ?? "?" }}
              </p>
              <p>
                {{ row.teams[1].name ?? "?" }}
              </p>
            </template>
            <template v-else>
              <p class="mb-2">
                {{ row.teams[0].users[0].fullname ?? "?" }}
              </p>
              <p>
                {{ row.teams[1].users[0].fullname ?? "?" }}
              </p>
            </template>
          </template>
          <template #startTime-data="{ row }">
            <NuxtTime
              :datetime="row.schedule.startTime"
              :time-zone="row.schedule.timeZone"
              locale="hu-HU"
              year="numeric"
              month="long"
              day="numeric"
              hour="2-digit"
              minute="2-digit"
              :hour12="false"
            />
          </template>
          <template #started-data="{ row }">
            <UBadge
              v-if="row.schedule.started"
              label="Elkezdődött"
              color="emerald"
              size="xs"
              variant="subtle"
            />
            <UBadge
              v-else
              label="Még nem kezdődött el"
              color="gray"
              size="xs"
              variant="subtle"
            />
          </template>
          <template #show-data="{ row }">
            <UBadge
              v-if="row.schedule.show"
              label="Látható"
              color="emerald"
              size="xs"
              variant="subtle"
              icon="i-heroicons-eye"
            />
            <UBadge
              v-else
              label="Nem látható"
              color="gray"
              size="xs"
              variant="subtle"
              icon="i-heroicons-eye-slash"
            />
          </template>
          <template #action-data="{ row }">
            <div class="flex flex-row gap-2">
              <UButton
                label="Szerkesztés"
                icon="i-heroicons-pencil"
                @click="updateMatchEvent(row.schedule.id)"
              />
              <UButton
                label="Törlés"
                icon="i-heroicons-trash"
                color="red"
                @click="deleteMatchEvent(row.schedule.id)"
              />
            </div>
          </template>
        </UTable>
      </template>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn } from "#ui/types";
import {
  ModalBracketPartEdit,
  ModalBracketSchedule,
  ModalEventSchedule,
} from "#components";

const { data: generalEvents, refresh: refreshGeneral } =
  await useFetch("/api/event/general");
const { data: bracketAll, refresh: refreshMatch } =
  await useFetch("/api/bracket/all");

const matchEvents = computed(() => {
  if (!bracketAll.value) return [];

  return bracketAll.value.scheduleBrackets
    .flatMap((sb) =>
      sb.rounds.flatMap((r) =>
        r.matches.map((m) => ({
          ...m,
          roundName: r.name,
          bracketName: sb.title,
          teamCompetition: sb.teamCompetition,
        })),
      ),
    )
    .filter((m) => m.schedule !== undefined);
});

const loadingSpinner = useLoadingSpinner();

const modal = useModal();

const generalColumns: TableColumn[] = [
  {
    key: "title",
    label: "Név",
  },
  {
    key: "startTime",
    label: "Időpont",
  },
  {
    key: "started",
    label: "Elkezdődött",
  },
  {
    key: "show",
    label: "Megjelenítés",
  },
  {
    key: "action",
    label: "Művelet",
  },
];
const competitionColumns: TableColumn[] = [
  {
    key: "bracketName",
    label: "Keret neve",
  },
  {
    key: "roundName",
    label: "Kör",
  },
  {
    key: "opponents",
    label: "Ellenfelek",
  },
  {
    key: "startTime",
    label: "Időpont",
  },
  {
    key: "started",
    label: "Elkezdődött",
  },
  {
    key: "show",
    label: "Megjelenítés",
  },
  {
    key: "action",
    label: "Művelet",
  },
];

function newEvent() {
  modal.open(ModalEventSchedule, {
    onSuccess: () => {
      refreshGeneral();
      modal.close();
    },
  });
}

function updateGeneralEvent(eventId: string) {
  const event = generalEvents.value?.events.find((e) => e.id === eventId);

  if (!event) return;

  modal.open(ModalEventSchedule, {
    init: {
      ...event,
      startTime: new Date(event.startTime),
      mediaId: event.mediaId ?? undefined,
      description: event.description ?? undefined,
      smallTitle: event.smallTitle ?? undefined,
    },
    onSuccess: () => {
      refreshGeneral();
      modal.close();
    },
  });
}

async function deleteGeneralEvent(eventId: string) {
  loadingSpinner.value = true;

  const [err] = await catchError(
    $fetchCsrfNotification<NotificationResponse>(
      `/api/event/general/${eventId}`,
      {
        method: "DELETE",
      },
    ),
  );

  if (!err) {
    await refreshGeneral();
  }

  loadingSpinner.value = false;
}

function updateMatchEvent(eventId: string) {
  const event = matchEvents.value.find((e) => e.schedule?.id === eventId);

  if (!event) return;

  modal.open(ModalBracketSchedule, {
    defaultMediaId: "",
    bracketPartIds: event.teams.map((t) => t.bracketPartId),
    init: {
      id: eventId,
      started: event.schedule?.started ?? false,
      show: event.schedule?.show ?? false,
      startTime: new Date(event.schedule!.startTime),
      mediaId: event.schedule?.mediaId ?? undefined,
    },
    onSuccess: () => {
      refreshMatch();
      modal.close();
    },
  });
}

async function deleteMatchEvent(eventId: string) {
  loadingSpinner.value = true;

  const [err] = await catchError(
    $fetchCsrfNotification<NotificationResponse>(
      `/api/event/match/${eventId}`,
      {
        method: "DELETE",
      },
    ),
  );

  if (!err) {
    await refreshMatch();
  }

  loadingSpinner.value = false;
}

definePageMeta({
  layout: "dashboard-admin",
  middleware: "auth",
});
</script>

<style scoped></style>
