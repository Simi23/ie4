<template>
  <div class="space-y-5 p-5 md:space-y-7 md:p-7 lg:space-y-10 lg:p-10">
    <UCard class="dark:bg-opacity-90">
      <template #header>
        <h1 class="text-xl font-bold">Discord beállítások</h1>
      </template>

      <UFormGroup
        name="guildid"
        label="Szerver azonosító (Guild ID)"
        class="my-2 h-20"
      >
        <div class="flex flex-row flex-nowrap">
          <div class="w-48">
            <UInput v-model="guildId" />
          </div>
          <UButton
            size="xs"
            label="Mentés"
            class="ml-2"
            @click.prevent="updateGuildId"
          />
        </div>
      </UFormGroup>

      <UFormGroup
        name="roleid"
        label="Rang azonosító (Role ID)"
        class="my-2 h-20"
      >
        <div class="flex flex-row flex-nowrap">
          <div class="w-48">
            <UInput v-model="roleId" />
          </div>
          <UButton
            size="xs"
            label="Mentés"
            class="ml-2"
            @click.prevent="updateRoleId"
          />
        </div>
      </UFormGroup>
    </UCard>
    <UCard class="dark:bg-opacity-90">
      <template #header>
        <h1 class="text-xl font-bold">Discord csatornák</h1>
      </template>

      <h2 class="mb-2 font-semibold">Versenyek kijelölése a művelethez:</h2>

      <UCheckbox
        v-for="c in fCompetitions"
        :label="c.title"
        v-model="competitionSelector[c.id]"
      />

      <div class="mt-6">
        <UButton
          label="Csatornák létrehozása"
          icon="i-heroicons-squares-plus"
          @click="createChannels()"
          class="mr-2"
        />
        <UButton
          label="Csatornák törlése"
          icon="i-heroicons-trash"
          color="red"
          @click="deleteChannels()"
        />
      </div>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "dashboard-admin",
  middleware: "auth",
});

const guildId = ref("");
const roleId = ref("");

const { refresh: refreshGuild } = await useFetch("/api/discord/guild", {
  onResponse: (r) => {
    guildId.value = r.response._data?.guildId ?? "";
  },
});
const { refresh: refreshRole } = await useFetch("/api/discord/role", {
  onResponse: (r) => {
    roleId.value = r.response._data?.roleId ?? "";
  },
});

const loadingSpinner = useLoadingSpinner();

async function updateGuildId() {
  loadingSpinner.value = true;
  await $fetchCsrfNotification("/api/discord/guild", {
    method: "POST",
    body: {
      guildId: guildId.value,
    },
  }).catch();
  await refreshGuild();
  loadingSpinner.value = false;
}

async function updateRoleId() {
  loadingSpinner.value = true;
  await $fetchCsrfNotification("/api/discord/role", {
    method: "POST",
    body: {
      roleId: roleId.value,
    },
  }).catch();
  await refreshRole();
  loadingSpinner.value = false;
}

const competitionSelector = ref<Record<string, boolean>>({});
const selectedCompetitions = computed(() => {
  return Object.keys(competitionSelector.value).filter(
    (k) => competitionSelector.value[k],
  );
});

const { data: competitions } = await useFetch("/api/competition");
const fCompetitions = computed(() => {
  if (!competitions.value) return [];

  return competitions.value
    .filter((c) => c.teamCompetition)
    .map((c) => ({ id: c.id, title: c.title }));
});

async function modifyChannels(method: "POST" | "DELETE") {
  loadingSpinner.value = true;
  await catchError(
    $fetchCsrfNotification<NotificationResponse>("/api/discord/channels", {
      method,
      body: {
        competitionIds: selectedCompetitions.value,
      },
    }),
  );
  loadingSpinner.value = false;
}

async function createChannels() {
  await modifyChannels("POST");
}

async function deleteChannels() {
  await modifyChannels("DELETE");
}
</script>

<style></style>
