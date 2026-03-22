<template>
  <div class="p-5 md:p-7 lg:p-10">
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
</script>

<style></style>
