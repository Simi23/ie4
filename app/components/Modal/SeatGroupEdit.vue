<template>
  <UModal>
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">Ültetési csoport szerkesztése</h1>
      </template>
      <div class="mb-4">
        <ReactiveSeatMap
          svg-id="seatgroupeditmap"
          v-model="selectedSeats"
          :seats="seats"
        />
      </div>
      <MapLegend color="text-[#0687d6]">Kiválasztott hely</MapLegend>
      <MapLegend color="text-[#059669]">Szabad helyek</MapLegend>
      <MapLegend color="text-[#b91c1c]">Foglalt helyek</MapLegend>

      <div v-if="data && data.group">
        <div class="flex min-h-64 flex-row flex-nowrap gap-8 py-4">
          <div>
            <h2 class="mb-2 text-lg font-semibold">Felhasználók</h2>
            <ul>
              <li
                v-for="user in selectedUsers"
                class="flex flex-row flex-nowrap items-center gap-2"
              >
                <span>
                  {{ user.fullname }}
                </span>
                <UButton
                  size="2xs"
                  :ui="{ rounded: 'rounded-full' }"
                  variant="ghost"
                  icon="i-heroicons-trash"
                  color="red"
                  @click="removeUser(user.id)"
                />
              </li>
            </ul>
          </div>
          <div>
            <h2 class="mb-2 text-lg font-semibold">Ülőhelyek</h2>
            <ul>
              <li v-for="seat in selectedSeats">{{ seat }}</li>
            </ul>
          </div>
        </div>
        <UFormGroup class="my-4" label="Felhasználó hozzáadása">
          <USelectMenu
            v-model="toAddUser"
            :options="unseatedUsers"
            option-attribute="fullname"
            value-attribute="id"
            placeholder="Kiválasztás"
            searchable
            searchable-placeholder="Keresés..."
          />
        </UFormGroup>
        <UFormGroup
          label="Csoportkialakítás indoklása"
          description="Nem kötelező"
          class="my-4"
        >
          <UInput placeholder="pl. Valorant csapat miatt" v-model="reason" />
        </UFormGroup>
      </div>

      <template #footer>
        <div class="flex flex-row flex-nowrap justify-end">
          <div class="space-x-2">
            <UButton label="Mégse" color="indigo" @click="emit('cancel')" />
            <UButton
              label="Mentés"
              color="emerald"
              @click="handleSeatGroupEdit()"
              :disabled="
                selectedSeats.length == 0 ||
                selectedSeats.length !== selectedUsers.length ||
                loading
              "
              :loading="loading"
            />
          </div>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
type Props = {
  seatGroupId: string;
};

const props = defineProps<Props>();

const { data } = await useFetch(`/api/seat/group/${props.seatGroupId}`);
const { data: allSeatGroup } = await useFetch("/api/seat/group");
const { data: allSeats } = await useFetch("/api/seat");
const { data: regSeat } = await useFetch("/api/seat/regseat");

type SimpleUser = {
  id: string;
  fullname: string;
  className: string;
  username: string;
  seatId: string;
  seatName: string;
};

const selectedSeats = ref<string[]>([]);
const selectedUsers = ref<SimpleUser[]>([]);
const reason = ref<string>("");

const toAddUser = ref<string>();

const unseatedUsers = computed<SimpleUser[]>(() => {
  const output: SimpleUser[] = [];
  if (!regSeat.value) return output;
  const users = regSeat.value.regSeats.filter((s) => s.owner !== null);
  const unseatedUsers = users.filter(
    (s) =>
      s.owner!.seatingGroupId == null &&
      selectedUsers.value.every((u) => u.id !== s.owner!.id),
  );

  output.push(
    ...unseatedUsers.map((s) => ({
      id: s.owner!.id,
      fullname: s.owner!.fullname,
      className: s.owner!.class.name,
      username: s.owner!.username,
      seatId: s.id,
      seatName: s.name,
    })),
  );

  if (!data.value || !data.value.group) return output;

  output.push(
    ...data.value.group.users
      .filter((u) => selectedUsers.value.every((su) => su.id !== u.id))
      .map((u) => ({
        id: u.id,
        fullname: u.fullname,
        className: u.class.name,
        username: u.username,
        seatId: "",
        seatName: "",
      })),
  );

  return output;
});

// Select these seats by default
watch(
  data,
  (val) => {
    if (!val || !val.group) return;

    selectedSeats.value = [...val.group.seats.map((s) => s.name)];
    selectedUsers.value = val.group.users.map((u) => ({
      id: u.id,
      fullname: u.fullname,
      className: u.class.name,
      username: u.username,
      seatId: "",
      seatName: "",
    }));
    reason.value = val.group.reason ?? "";
  },
  {
    immediate: true,
  },
);

// Add user
watch(toAddUser, (val) => {
  console.log(val);
  if (val === undefined) return;
  if (!data.value || !data.value.group) return;

  const user = unseatedUsers.value.find((u) => u.id === val);

  if (!user) return;

  selectedUsers.value.push(user);
});

type SeatDefinition = {
  name: string;
  color: string;
  selectable?: boolean;
  selectedColor?: string;
};

const loading = ref(false);

const inactive = "#059669";
const active = "#0687d6";
const unreachable = "#b91c1c";

const seats = computed<SeatDefinition[]>(() => {
  const output: SeatDefinition[] = [];

  if (!data.value?.group) return output;

  // Add all the seats belonging to the current seating group
  output.push(
    ...data.value.group.seats.map((s) => ({
      name: s.name,
      color: inactive,
      selectable: true,
      selectedColor: active,
    })),
  );

  if (!allSeatGroup.value) return output;

  // Add seats belonging to all other seating groups as unreachable
  const takenSeats = allSeatGroup.value.group
    .filter((sg) => sg.id !== data.value?.group?.id)
    .map((sg) => {
      return sg.seats.map((s) => ({
        name: s.name,
        color: unreachable,
      }));
    });

  for (let i = 0; i < takenSeats.length; i++) {
    const element = takenSeats[i]!;
    output.push(...element);
  }

  if (!allSeats.value) return output;

  // Add all seats not belonging to any seating group as selectable
  output.push(
    ...allSeats.value
      .filter((s) => s.seatingGroupId === null)
      .map((s) => ({
        name: s.name,
        color: inactive,
        selectable: true,
        selectedColor: active,
      })),
  );

  return output;
});

const emit = defineEmits<{
  cancel: [];
  success: [];
}>();

async function handleSeatGroupEdit() {
  loading.value = true;

  const sgReason = reason.value.length == 0 ? undefined : reason.value;
  const userIds = selectedUsers.value.map((u) => u.id);
  const seatNames = selectedSeats.value;

  const [error] = await catchError(
    $fetchCsrfNotification<NotificationResponse>(
      `/api/seat/group/${props.seatGroupId}`,
      {
        method: "PUT",
        body: {
          reason: sgReason,
          userIds,
          seatNames,
        },
      },
    ),
  );

  loading.value = false;

  if (!error) {
    emit("success");
  }
}

function removeUser(id: string) {
  selectedUsers.value = selectedUsers.value.filter((u) => u.id !== id);
}
</script>

<style></style>
