<template>
  <div class="space-y-5 p-5 md:space-y-7 md:p-7 lg:space-y-10 lg:p-10">
    <UCard class="dark:bg-opacity-90">
      <template #header>
        <h1 class="text-xl font-bold">
          Ülőhellyel nem rendelkező felhasználók
        </h1>
      </template>

      <p>
        Azon felhasználók listája, akik még nincsenek ültetési csoporthoz
        rendelve.
      </p>

      <UTable
        v-if="unseatedUsers"
        :rows="unseatedUsers"
        :columns="unseatedColumns"
        v-model="selectedUsers"
        class="mt-4"
      />
    </UCard>
    <UCard class="dark:bg-opacity-90">
      <template #header>
        <h1 class="text-xl font-bold">Csoport létrehozása</h1>
      </template>

      <div class="flex flex-row gap-6">
        <div class="w-96">
          <h2 class="mb-2 text-lg font-semibold">Csoport ülőhelyei</h2>
          <ReactiveSeatMap
            svg-id="seatinggroup"
            :seats="seatSelector"
            v-model="selectedSeats"
          />
        </div>

        <div>
          <h2 class="mb-2 text-lg font-semibold">Kijelölt felhasználók</h2>
          <ul class="list-disc pl-6">
            <li v-for="user in selectedUsers" :key="user.id">
              <span class="font-semibold">{{ user.fullname }}</span> ({{
                user.className
              }})
            </li>
          </ul>
        </div>

        <div>
          <h2 class="mb-2 text-lg font-semibold">
            Ülőhelyek ({{ selectedSeats.length }}/{{ selectedUsers.length }})
          </h2>
          <ul class="list-disc pl-6">
            <li v-for="seat in selectedSeats" :key="seat">
              {{ seat }}
            </li>
          </ul>
        </div>
      </div>

      <div class="my-6 w-96">
        <UFormGroup
          label="Csoportkialakítás indoklása"
          description="Nem kötelező"
        >
          <UInput
            placeholder="pl. Valorant csapat miatt"
            v-model="seatGroupReason"
          />
        </UFormGroup>
      </div>

      <UButton
        label="Csoport létrehozása a kijelöltekből"
        icon="i-heroicons-user-plus-solid"
        class="mt-4"
        :disabled="
          selectedUsers.length == 0 ||
          selectedUsers.length != selectedSeats.length
        "
        @click="createSeatGroup"
      />
    </UCard>
    <UCard class="dark:bg-opacity-90">
      <template #header>
        <h1 class="text-xl font-bold">Versenyek</h1>
      </template>

      <div v-for="(comp, index) in coloredCompetitions" :key="comp.id">
        <template
          v-for="csg in [
            {
              sg: competitionSeatingGroups.find((csg) => csg.id === comp.id)!,
              seats: competitionSeatBreakout.find((csb) => csb.id === comp.id)!,
            },
          ]"
        >
          <h2 class="mb-2 text-xl font-semibold">{{ comp.title }}</h2>
          <div class="my-4 w-[32rem]">
            <ReactiveSeatMap
              :svg-id="`sgcomp-${comp.id}`"
              :multi-colors="allSvgColorGradients"
              :seats="csg.seats.seats"
            />
          </div>

          <ul class="pl-6">
            <template v-if="comp.teamCompetition">
              <li v-for="team in comp.teams" :key="team.id">
                <div class="flex flex-row flex-nowrap items-center gap-2">
                  <div
                    class="size-4 rounded-md"
                    :style="{ 'background-color': team.color }"
                  ></div>
                  <span class="font-semibold">{{ team.name }}</span>
                </div>
                <ul class="mb-4 pl-8">
                  <li v-for="member in team.members" :key="member.id">
                    {{ member.fullname }}
                  </li>
                </ul>
              </li>
            </template>
            <template v-else>
              <li v-for="team in comp.teams" :key="team.id">
                {{ team.members[0]?.fullname ?? "" }}
              </li>
            </template>
          </ul>
        </template>
        <UDivider class="my-8" v-if="index != coloredCompetitions.length - 1" />
      </div>
    </UCard>
    <UCard class="dark:bg-opacity-90">
      <template #header>
        <h1 class="text-xl font-bold">Csoportok</h1>
      </template>

      <UTable
        v-if="seatGroup"
        :rows="seatGroup.group"
        :columns="seatGroupColumns"
      >
        <template #users-data="{ row }">
          <ul>
            <li v-for="user in row.users">{{ user.fullname }}</li>
          </ul>
        </template>
        <template #seats-data="{ row }">
          <ul>
            <li v-for="seat in row.seats">{{ seat.name }}</li>
          </ul>
        </template>
        <template #action-data="{ row }">
          <div class="flex flex-row gap-2">
            <UButton
              label="Törlés"
              color="red"
              icon="i-heroicons-trash"
              @click="deleteSeatGroup(row.id)"
            />
            <UButton
              label="Szerkesztés"
              color="cyan"
              icon="i-heroicons-pencil"
              @click="editSeatGroup(row.id)"
            />
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import { ModalSeatGroupEdit } from "#components";
import type { TableColumn } from "#ui/types";

definePageMeta({
  layout: "dashboard-admin",
  middleware: "auth",
});

const soloSeats = "#1381b6";

const modal = useModal();
const loadingSpinner = useLoadingSpinner();

const { data: regSeat, refresh } = await useFetch("/api/seat/regseat");
const { data: seatGroup, refresh: refreshSeatGroup } =
  await useFetch("/api/seat/group");

type SimpleUser = {
  id: string;
  fullname: string;
  className: string;
  username: string;
  seatId: string;
  seatName: string;
};

const selectedUsers = ref<SimpleUser[]>([]);
const unseatedUsers = computed<SimpleUser[] | null>(() => {
  if (!regSeat.value) return null;
  const users = regSeat.value.regSeats.filter((s) => s.owner !== null);
  const unseatedUsers = users.filter((s) => s.owner!.seatingGroupId == null);
  const output = unseatedUsers.map((s) => ({
    id: s.owner!.id,
    fullname: s.owner!.fullname,
    className: s.owner!.class.name,
    username: s.owner!.username,
    seatId: s.id,
    seatName: s.name,
  }));

  return output;
});
const unseatedColumns: TableColumn[] = [
  {
    key: "fullname",
    label: "Név",
    sortable: true,
  },
  {
    key: "className",
    label: "Osztály",
    sortable: true,
  },
  {
    key: "username",
    label: "Felhasználónév",
    sortable: true,
  },
  {
    key: "seatName",
    label: "Jelenlegi ülőhely",
    sortable: true,
  },
];

const seatGroupSeatIds = computed(() => {
  const output: string[] = [];
  if (!seatGroup.value) return output;
  const wide = seatGroup.value.group.map((g) => g.seats.map((s) => s.id));
  for (let i = 0; i < wide.length; i++) {
    output.push(...wide[i]!);
  }
  return output;
});

const freePublicSeats = computed<string[]>(() => {
  if (!regSeat.value) return [];

  const free = regSeat.value.regSeats
    .filter(
      (r) =>
        r.owner === null && r.public && !seatGroupSeatIds.value.includes(r.id),
    )
    .map((s) => s.name);

  return free;
});

const selectedSeats = ref<string[]>([]);
const seatSelector = computed(() => {
  const inactive = "#059669";
  const active = "#0687d6";
  return freePublicSeats.value.map((seat) => ({
    name: seat,
    color: inactive,
    selectable: true,
    selectedColor: active,
  }));
});

//
// Competition previews
//
type CompetitionType = {
  id: string;
  title: string;
  teamCompetition: boolean;
  teams: {
    id: string;
    name: string;
    members: {
      id: string;
      fullname: string;
      seatName: string;
      seatingGroupId: string;
    }[];
  }[];
};
const competitions = computed(() => {
  if (!regSeat.value) return [];

  const competitions: CompetitionType[] = [];

  // Currently selected users
  const selectedFullUsers = selectedUsers.value
    .map((u) => regSeat.value?.regSeats.find((y) => y.owner?.id == u.id))
    .filter((u) => u !== undefined);

  // Users already belonging to a seating group
  const publicSeats = regSeat.value.regSeats.filter(
    (r) => r.owner && r.owner.seatingGroupId,
  );

  const allRelevant = [...selectedFullUsers, ...publicSeats];

  for (let i = 0; i < allRelevant.length; i++) {
    const userComps = allRelevant[i]?.owner?.teams ?? [];

    const userId = allRelevant[i]?.owner?.id;
    const userFullname = allRelevant[i]?.owner?.fullname;
    const seatName = allRelevant[i]!.name;
    const seatingGroupId = allRelevant[i]?.owner?.seatingGroupId ?? "NEW";

    for (let j = 0; j < userComps.length; j++) {
      const compId = userComps[j]?.team.competition.id;
      const compTitle = userComps[j]?.team.competition.title;
      const isTeamComp = userComps[j]?.team.competition.teamCompetition;
      const teamId = userComps[j]?.team.id;
      const teamName = userComps[j]?.team.name;

      if (
        !compId ||
        !compTitle ||
        !teamId ||
        !teamName ||
        !userId ||
        !userFullname ||
        isTeamComp === undefined
      )
        continue;

      if (!competitions.some((c) => c.id === compId)) {
        competitions.push({
          id: compId,
          title: compTitle,
          teamCompetition: isTeamComp,
          teams: [],
        });
      }

      const comp = competitions.find((c) => c.id === compId);
      if (!comp) continue;

      if (!comp.teams.some((t) => t.id === teamId)) {
        comp.teams.push({
          id: teamId,
          name: teamName,
          members: [],
        });
      }

      const team = comp.teams.find((t) => t.id === teamId);
      if (!team) continue;

      if (!team.members.some((m) => m.id === userId)) {
        team.members.push({
          id: userId,
          fullname: userFullname,
          seatName,
          seatingGroupId,
        });
      }
    }
  }

  return competitions;
});

type ColoredCompetitionType = {
  id: string;
  title: string;
  teamCompetition: boolean;
  teams: {
    id: string;
    name: string;
    color: string;
    members: {
      id: string;
      fullname: string;
      seatName: string;
      seatingGroupId: string;
    }[];
  }[];
};
const coloredCompetitions = computed<ColoredCompetitionType[]>(() => {
  const output: ColoredCompetitionType[] = competitions.value.map((c) => {
    const teamColors = c.teamCompetition
      ? generateColors(c.teams.length)
      : repeatColor(soloSeats, c.teams.length);
    return {
      id: c.id,
      title: c.title,
      teamCompetition: c.teamCompetition,
      teams: c.teams.map((t, it) => ({
        id: t.id,
        name: t.name,
        color: teamColors[it]!,
        members: t.members.map((m) => ({
          id: m.id,
          fullname: m.fullname,
          seatName: m.seatName,
          seatingGroupId: m.seatingGroupId,
        })),
      })),
    };
  });

  return output;
});

type CompetitionSeatingGroupType = {
  id: string;
  title: string;
  seatingGroups: {
    id: string;
    seats: string[];
    colors: string[];
  }[];
};
const competitionSeatingGroups = computed<CompetitionSeatingGroupType[]>(() => {
  const output: CompetitionSeatingGroupType[] = coloredCompetitions.value.map(
    (c) => ({ id: c.id, title: c.title, seatingGroups: [] }),
  );

  for (let i = 0; i < coloredCompetitions.value.length; i++) {
    const c = coloredCompetitions.value[i]!;
    const orgC = output.find((oc) => oc.id == c.id)!;

    for (let j = 0; j < c.teams.length; j++) {
      const team = c.teams[j]!;

      for (let k = 0; k < team.members.length; k++) {
        const member = team.members[k]!;

        if (!orgC.seatingGroups.some((sg) => sg.id === member.seatingGroupId)) {
          orgC.seatingGroups.push({
            id: member.seatingGroupId,
            seats: [],
            colors: [],
          });
        }

        const sg = orgC.seatingGroups.find(
          (sg) => sg.id === member.seatingGroupId,
        )!;

        if (!sg.colors.includes(team.color)) {
          sg.colors.push(team.color);
        }
      }
    }

    for (let j = 0; j < orgC.seatingGroups.length; j++) {
      const sg = orgC.seatingGroups[j]!;

      if (sg.id == "NEW") {
        sg.seats = [...selectedSeats.value];
      } else {
        const origin = seatGroup.value?.group;
        if (!origin) continue;
        const exact = origin.find((o) => o.id == sg.id);
        if (!exact) continue;
        sg.seats = exact.seats.map((s) => s.name);
      }
    }
  }

  return output;
});

type CompetitionSeatDefinition = {
  id: string;
  seats: { name: string; color: string }[];
};
const competitionSeatBreakout = computed<CompetitionSeatDefinition[]>(() => {
  const seats: CompetitionSeatDefinition[] = competitionSeatingGroups.value.map(
    (c) => ({ id: c.id, seats: [] }),
  );

  for (let i = 0; i < competitionSeatingGroups.value.length; i++) {
    const csg = competitionSeatingGroups.value[i]!;
    const localCsg = seats.find((s) => s.id === csg.id)!;

    for (let j = 0; j < csg.seatingGroups.length; j++) {
      const sg = csg.seatingGroups[j]!;

      const converted = sg.seats.map((s) => {
        let col = "#374151";

        if (sg.colors.length == 1) {
          col = sg.colors[0]!;
        }

        if (sg.colors.length > 1) {
          col = `url(#${multiColorGradientId(sg.colors)})`;
        }

        return { name: s, color: col };
      });

      localCsg.seats.push(...converted);
    }
  }

  return seats;
});

const allSvgColorGradients = computed(() => {
  const multiColors: string[][] = [];
  const addedIds: string[] = [];

  for (let i = 0; i < competitionSeatingGroups.value.length; i++) {
    const csg = competitionSeatingGroups.value[i]!;
    for (let j = 0; j < csg.seatingGroups.length; j++) {
      const sg = csg.seatingGroups[j]!;
      if (sg.colors.length < 2) continue;

      const gradId = multiColorGradientId(sg.colors);
      if (!addedIds.includes(gradId)) {
        addedIds.push(gradId);
        multiColors.push([...sg.colors]);
      }
    }
  }

  return multiColors;
});

//
// SeatGroup display
//

const seatGroupColumns: TableColumn[] = [
  {
    key: "users",
    label: "Játékosok",
  },
  {
    key: "seats",
    label: "Ülőhelyek",
  },
  {
    key: "reason",
    label: "Indok",
  },
  {
    key: "action",
    label: "Műveletek",
  },
];

//
// Actions
//
const seatGroupReason = ref("");
async function createSeatGroup() {
  loadingSpinner.value = true;

  const [error, response] = await catchError(
    $fetchCsrfNotification<NotificationResponse>("/api/seat/group", {
      method: "POST",
      body: {
        reason: seatGroupReason.value,
        userIds: selectedUsers.value.map((u) => u.id),
        seatNames: selectedSeats.value,
      },
    }),
  );

  if (!error) {
    selectedSeats.value = [];
    selectedUsers.value = [];
    await Promise.all([refresh(), refreshSeatGroup()]);
  }

  loadingSpinner.value = false;
}

async function deleteSeatGroup(id: string) {
  loadingSpinner.value = true;

  const [error, response] = await catchError(
    $fetchCsrfNotification<NotificationResponse>(`/api/seat/group/${id}`, {
      method: "DELETE",
    }),
  );

  if (!error) {
    selectedSeats.value = [];
    selectedUsers.value = [];
    await Promise.all([refresh(), refreshSeatGroup()]);
  }

  loadingSpinner.value = false;
}

async function editSeatGroup(id: string) {
  modal.open(ModalSeatGroupEdit, {
    seatGroupId: id,
    onCancel: () => {
      modal.close();
    },
    onSuccess: () => {
      modal.close();
      refresh();
      refreshSeatGroup();
    },
  });
}
</script>

<style></style>
