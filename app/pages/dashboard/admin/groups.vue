<template>
  <div class="p-2">
    <UTable
      class="rounded-sm bg-gray-800/65"
      :columns="tableCols"
      :rows="tableRows"
      :loading="status === 'pending'"
      :loading-state="{
        icon: 'i-heroicons-arrow-path-20-solid',
        label: 'Betöltés...',
      }"
      :empty-state="{
        icon: 'i-heroicons-circle-stack-20-solid',
        label: 'Nincs megjeleníthető adat',
      }"
    >
      <template #name-data="{ row }">
        <div class="flex flex-row flex-nowrap gap-2">
          <img v-if="row.logoUrl" :src="row.logoUrl" class="size-6" />
          <span>
            {{ row.name }}
          </span>
        </div>
      </template>
      <template #logo-data="{ row }">
        <template v-if="row.logoUrl">
          <UBadge
            v-if="row.logoApproved"
            label="Elfogadva"
            icon="i-heroicons-check-circle-solid"
            color="emerald"
          />
          <UBadge
            v-else
            label="Elfogadásra vár"
            icon="i-heroicons-question-mark-circle-solid"
            color="orange"
          />
        </template>
        <template v-else>
          <UBadge label="Nincs logó" color="gray" />
        </template>
      </template>
      <template #competitionName-data="{ row }">
        <NuxtLink
          :to="`/dashboard/admin/competition/${row.competitionId}`"
          class="underline underline-offset-4"
        >
          {{ row.competitionName }}
        </NuxtLink>
      </template>
      <template #action-data="{ row }">
        <template v-if="row.logoUrl">
          <div class="flex flex-row flex-nowrap gap-2">
            <UTooltip text="Megtekintés">
              <UButton
                color="cyan"
                icon="i-heroicons-eye"
                :square="true"
                @click="displayImage(row.name, row.logoUrl)"
              />
            </UTooltip>
            <UButton
              v-if="!row.logoApproved"
              color="emerald"
              icon="i-heroicons-check"
              label="Logó elfogadása"
              @click="approveLogo(row.id)"
            />
            <UButton
              color="red"
              icon="i-heroicons-trash"
              label="Logó törlése"
              @click="deleteLogo(row.id)"
            />
          </div>
        </template>
        <template v-else>
          <span class="italic text-gray-400">Nincs elérhető művelet</span>
        </template>
      </template>
    </UTable>
  </div>
</template>

<script lang="ts" setup>
import { ModalImageDisplay } from "#components";

definePageMeta({
  layout: "dashboard-admin",
  middleware: "auth",
});

const modal = useModal();

const {
  data: tableRows,
  status,
  refresh,
} = await useFetchNotification("/api/team/logo", {
  default: () => [],
});

const tableCols = [
  {
    label: "Csapatnév",
    key: "name",
    sortable: true,
  },
  {
    label: "Verseny",
    key: "competitionName",
    sortable: true,
  },
  {
    label: "Logó státusz",
    key: "logo",
    sortable: false,
  },
  {
    label: "Művelet",
    key: "action",
    sortable: false,
  },
];

async function displayImage(name: string, path: string) {
  modal.open(ModalImageDisplay, {
    title: name,
    path: path,
    regular: true,
  });
}

async function approveLogo(teamId: string) {
  const [error] = await catchError(
    $fetchCsrfNotification<NotificationResponse>("/api/team/logo/approve", {
      method: "POST",
      body: {
        teamId: teamId,
      },
    }),
  );

  if (error) return;

  await refresh();
}

async function deleteLogo(teamId: string) {
  const [error] = await catchError(
    $fetchCsrfNotification<NotificationResponse>(`/api/team/logo/${teamId}`, {
      method: "DELETE",
    }),
  );

  if (error) return;

  await refresh();
}
</script>

<style></style>
