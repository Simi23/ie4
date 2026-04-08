<template>
  <div class="p-5 md:p-7 lg:p-10">
    <UCard class="dark:bg-opacity-90">
      <template #header>
        <h1 class="text-xl font-bold">Mérkőzések</h1>
        <h2 class="text-gray-400">A sorrendbe rakott keretekből</h2>
      </template>

      <template v-if="data">
        <template v-for="(bracket, idx) in data.scheduleBrackets">
          <div class="my-2">
            <h2 class="text-xl font-bold">{{ bracket.title }}</h2>
            <h3 class="text-gray-400">{{ bracket.administrativeTitle }}</h3>
          </div>
          <div
            v-for="round in bracket.rounds"
            class="my-2 flex w-full flex-row flex-nowrap gap-8 bg-gray-700/40 p-4"
          >
            <h4 class="text-lg font-bold">{{ round.name }}</h4>
            <div class="flex flex-row flex-wrap gap-2">
              <UCard
                v-for="match in round.matches.toSorted(
                  (m1, m2) => m1.roundLocation - m2.roundLocation,
                )"
              >
                <template #header>
                  <h2 class="text-lg font-semibold">
                    Meccs
                    <span class="font-black">{{
                      match.roundLocation + 1
                    }}</span>
                  </h2>
                </template>

                <template
                  v-for="m in [
                    {
                      upper: {
                        name: bracket.teamCompetition
                          ? (match.teams[0]?.name ?? '?')
                          : (match.teams[0]?.users[0]?.fullname ?? '?'),
                        points: match.teams[0]?.points ?? [],
                        won: match.teams[0]?.won ?? false,
                        id: match.teams[0]?.bracketPartId ?? '',
                      },
                      lower: {
                        name: bracket.teamCompetition
                          ? (match.teams[1]?.name ?? '?')
                          : (match.teams[1]?.users[0]?.fullname ?? '?'),
                        points: match.teams[1]?.points ?? [],
                        won: match.teams[1]?.won ?? false,
                        id: match.teams[1]?.bracketPartId ?? '',
                      },
                      started: match.started,
                      ended: match.ended,
                      tracked: match.tracked,
                    },
                  ]"
                >
                  <BracketPart
                    :cell-data="m"
                    admin
                    class="cell-editing mb-6"
                    @click="editCell(m)"
                  />

                  <div v-if="match.canStart" class="text-emerald-400">
                    <UIcon name="i-heroicons-check" class="size-5 align-sub" />
                    Kezdődhet
                  </div>
                  <template v-else>
                    <div class="text-amber-400">
                      <UIcon
                        name="i-heroicons-exclamation-triangle"
                        class="size-5 align-sub"
                      />
                      Még nem kezdődhet
                    </div>
                    <ul class="list-disc pl-6">
                      <li v-if="match.teams.length < 2" class="my-2">
                        Még nincs meg mindkét ellenfél
                      </li>
                      <li v-for="reason in match.waitReason" class="my-2">
                        <NuxtLink
                          :to="`/dashboard/admin/user/${reason.user.id}`"
                          target="_blank"
                          class="font-semibold transition-colors hover:text-gray-400"
                          >{{ reason.user.fullname }}</NuxtLink
                        >
                        <br />
                        <NuxtLink
                          :to="`/dashboard/admin/bracket/${reason.bracket.id}`"
                          target="_blank"
                          class="transition-colors hover:text-gray-400"
                          >{{ reason.bracket.title }}</NuxtLink
                        ><span class="mb-2 ml-2 font-light text-gray-400"
                          >({{ reason.team.name }})</span
                        >
                        <br />
                        <span>{{ reason.round.name }}</span> /
                        <span>Meccs {{ reason.round.location + 1 }}</span>
                      </li>
                    </ul>
                  </template>
                </template>

                <template #footer>
                  <div v-if="match.schedule == undefined">
                    <UButton
                      label="Felvétel menetrendre"
                      icon="i-heroicons-clock"
                      @click="
                        scheduleBracketPart(
                          [
                            match.teams[0]?.bracketPartId ?? '',
                            match.teams[1]?.bracketPartId ?? '',
                          ],
                          bracket.defaultMediaId,
                        )
                      "
                    />
                  </div>
                  <div v-else>
                    <UButton
                      label="Törlés menetrendről"
                      color="red"
                      icon="i-heroicons-clock"
                      variant="soft"
                      @click="descheduleBracketPart(match.schedule.id)"
                    />
                    <div class="mt-2">
                      <span class="mr-2 font-semibold">Kezdés:</span>

                      <NuxtTime
                        :datetime="match.schedule.startTime"
                        :time-zone="match.schedule.timeZone"
                        locale="hu-HU"
                        year="numeric"
                        month="long"
                        day="numeric"
                        hour="2-digit"
                        minute="2-digit"
                        :hour12="false"
                      />
                    </div>
                  </div>
                </template>
              </UCard>
            </div>
          </div>
          <UDivider
            size="sm"
            class="my-16"
            v-if="idx != data.scheduleBrackets.length - 1"
          />
        </template>
      </template>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { CellData, NotificationResponse } from "~/utils/types";
import { ModalBracketPartEdit, ModalBracketSchedule } from "#components";

const { data, refresh } = await useFetch("/api/bracket/all");
const loadingSpinner = useLoadingSpinner();

const modal = useModal();
function editCell(init: CellData) {
  modal.open(ModalBracketPartEdit, {
    initData: init,
    onSuccess: () => {
      refresh();
      modal.close();
    },
  });
}

function scheduleBracketPart(bpIds: string[], defaultMediaId: string | null) {
  modal.open(ModalBracketSchedule, {
    bracketPartIds: bpIds,
    defaultMediaId: defaultMediaId ?? "",
    onSuccess: () => {
      refresh();
      modal.close();
    },
  });
}

async function descheduleBracketPart(scheduleId: string) {
  loadingSpinner.value = true;
  const [err] = await catchError(
    $fetchCsrfNotification<NotificationResponse>(
      `/api/event/match/${scheduleId}`,
      {
        method: "DELETE",
      },
    ),
  );
  if (!err) {
    await refresh();
  }
  loadingSpinner.value = false;
}

definePageMeta({
  layout: "dashboard-admin",
  middleware: "auth",
});
</script>

<style scoped>
.cell-editing {
  cursor: pointer;
  border-radius: 6px;
  transition: box-shadow 0.2s;
}

.cell-editing:hover {
  box-shadow: 0 0 6px 1px white;
}
</style>
