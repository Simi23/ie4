<template>
  <div class="p-5 md:p-7 lg:p-10">
    <UCard class="dark:bg-opacity-90">
      <template #header>
        <div class="flex flex-row flex-nowrap justify-between">
          <h1 class="text-xl font-bold">Keretek sorrendje</h1>
          <UButton
            label="Mentés"
            icon="i-heroicons-check"
            color="emerald"
            @click="save()"
          />
        </div>
      </template>

      <div class="mb-4">
        <h2 class="text-lg">Keret hozzáadása</h2>
        <div class="my-2 flex flex-row flex-nowrap gap-2">
          <div class="w-48">
            <BracketSelect v-model="selectedBracket" />
          </div>
          <UButton
            label="Hozzáadás"
            icon="i-heroicons-plus"
            @click="addBracket()"
          />
        </div>
      </div>

      <UTable
        :rows="localBracketSchedule"
        :columns="columns"
        :ui="{ base: 'pb-96', wrapper: 'pb-96' }"
      >
        <template #defaultMediaId-data="{ row }">
          <div class="w-64">
            <MediaSelect v-model="row.defaultMediaId" />
          </div>
        </template>

        <template #action-data="{ row }">
          <div class="space-x-2">
            <UButton
              icon="i-heroicons-chevron-up"
              :disabled="row.order == 0"
              @click="up(row.order)"
            />
            <UButton
              icon="i-heroicons-chevron-down"
              :disabled="row.order == localBracketSchedule.length - 1"
              @click="down(row.order)"
            />
            <UButton
              icon="i-heroicons-trash"
              color="red"
              variant="soft"
              @click="deleteRow(row.order)"
            />
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn } from "#ui/types";

definePageMeta({
  layout: "dashboard-admin",
  middleware: "auth",
});

const toast = useToast();
const loadingSpinner = useLoadingSpinner();

const selectedBracket = ref("");

const { data, refresh } = await useFetch("/api/event/competition");

const { data: brackets } = useFetch("/api/bracket");

type TableType = {
  bracketId: string;
  bracketTitle: string;
  bracketAdminTitle: string;
  order: number;
  defaultMediaId?: string;
};
const localBracketSchedule = ref<TableType[]>([]);

watch(
  data,
  (val) => {
    if (!val || !val.brackets) return;
    localBracketSchedule.value = val.brackets.map((b) => ({
      bracketId: b.bracketId,
      bracketTitle: b.bracket.title,
      bracketAdminTitle: b.bracket.administrativeTitle,
      order: b.order,
      defaultMediaId: b.defaultMediaId ?? undefined,
    }));
  },
  {
    immediate: true,
  },
);

const columns: TableColumn[] = [
  {
    key: "bracketTitle",
    label: "Keret neve",
  },
  {
    key: "bracketAdminTitle",
    label: "Adminisztratív név",
  },
  {
    key: "defaultMediaId",
    label: "Alapértelmezett háttér",
  },
  {
    key: "action",
    label: "Műveletek",
  },
];

function addBracket() {
  if (
    localBracketSchedule.value
      .map((lbs) => lbs.bracketId)
      .includes(selectedBracket.value)
  ) {
    toast.add({
      color: "red",
      title: "Hiba",
      description: "A keret már benne van a sorrendben!",
      icon: "i-heroicons-x-mark",
    });
    return;
  }
  const bracketData = brackets.value?.find(
    (b) => b.id === selectedBracket.value,
  );
  if (!bracketData) {
    toast.add({
      color: "red",
      title: "Hiba",
      description: "Nem található információ a keretről!",
      icon: "i-heroicons-x-mark",
    });
    return;
  }

  localBracketSchedule.value.push({
    bracketId: bracketData.id,
    bracketTitle: bracketData.title,
    bracketAdminTitle: bracketData.administrativeTitle,
    order: localBracketSchedule.value.length,
  });
}

function up(order: number) {
  localBracketSchedule.value[order]!.order--;
  localBracketSchedule.value[order - 1]!.order++;
  resort();
}

function down(order: number) {
  localBracketSchedule.value[order]!.order++;
  localBracketSchedule.value[order + 1]!.order--;
  resort();
}

function deleteRow(order: number) {
  localBracketSchedule.value = localBracketSchedule.value.filter(
    (lbs) => lbs.order !== order,
  );
  renumber();
}

function renumber() {
  localBracketSchedule.value = localBracketSchedule.value.map((lbs, index) => ({
    ...lbs,
    order: index,
  }));
}

function resort() {
  localBracketSchedule.value.sort((a, b) => a.order - b.order);
}

async function save() {
  loadingSpinner.value = true;

  const [err] = await catchError(
    $fetchCsrfNotification<NotificationResponse>("/api/event/competition", {
      method: "POST",
      body: {
        brackets: localBracketSchedule.value.map((lbs) => ({
          bracketId: lbs.bracketId,
          order: lbs.order,
          defaultMediaId: lbs.defaultMediaId,
        })),
      },
    }),
  );

  if (!err) {
    await refresh();
  }

  loadingSpinner.value = false;
}
</script>

<style></style>
