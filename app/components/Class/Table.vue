<template>
  <div>
    <UTable
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
    />
  </div>
</template>

<script lang="ts" setup>
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";

const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");

const csrf = useCsrf();
const loadingSpinner = useLoadingSpinner();
const eventBus = useMittBus();

const {
  data: tableRows,
  status,
  refresh: refreshTable,
} = await useFetchNotification<any>("/api/classes/list", {
  lazy: true,
  default: () => {
    return [] as any;
  },
});

const tableCols: TableColumn<any>[] = [
  {
    header: "Név",
    accessorKey: "name",
    enableSorting: true,
  },
  {
    header: "Évfolyam",
    accessorKey: "group",
    enableSorting: true,
  },
  {
    header: "Láthatóság",
    id: "state",
    enableSorting: true,
    cell: ({ row }) => {
      h(UBadge, {
        size: "xs",
        variant: "soft",
        label: row.original.hidden ? "Rejtett" : "Nyilvános",
        color: row.original.hidden ? "neutral" : "success",
      });
    },
  },
  {
    header: "Művelet",
    id: "action",
    enableSorting: false,
    cell: ({ row }) => {
      h(UButton, {
        size: "xs",
        label: "Törlés",
        variant: "soft",
        onClick: () => {
          deleteClass(row.original.id);
        },
      });
    },
  },
];

async function deleteClass(id: string) {
  loadingSpinner.value = true;
  await $fetchNotification(`/api/classes/${id}`, {
    method: "DELETE",
    headers: {
      "csrf-token": csrf.csrf,
    },
  }).catch(() => {
    loadingSpinner.value = false;
  });

  eventBus.emit("update-class");

  loadingSpinner.value = false;
}

eventBus.on("update-class", () => {
  refreshTable();
});
</script>

<style></style>
