<template>
  <UModal :ui="{ background: 'bg-transparent dark:bg-transparent' }">
    <UCard>
      <template #header>
        <div
          v-if="carouselStage == 1"
          class="flex flex-row flex-nowrap items-center justify-between gap-2"
        >
          <UForm
            v-if="renaming"
            :state="renameState"
            @submit.prevent="saveNewName"
          >
            <UFormGroup label="Új csapatnév">
              <UInput v-model="renameState.newName" />
            </UFormGroup>
          </UForm>
          <div v-else>
            <h1 class="text-2xl font-extrabold">{{ team?.name }}</h1>
            <h2 class="text-lg font-bold text-gray-500">
              {{ team?.competitionTitle }}
            </h2>
          </div>
          <div v-if="!renaming" class="flex flex-row flex-nowrap gap-2">
            <UTooltip text="Csapat törlése" v-if="imLeader">
              <UButton
                color="red"
                variant="soft"
                icon="i-heroicons-trash"
                @click="showConfirm('delTeam')"
              />
            </UTooltip>
            <UTooltip text="Kilépés a csapatból" v-else>
              <UButton
                color="red"
                variant="soft"
                icon="i-heroicons-arrow-right-on-rectangle"
                @click="showConfirm('leave')"
              />
            </UTooltip>

            <UTooltip text="Csapat átnevezése" v-if="imLeader">
              <UButton
                icon="i-heroicons-pencil"
                variant="soft"
                color="indigo"
                @click="renameTeam"
              />
            </UTooltip>
          </div>
          <UButton
            v-else-if="renaming"
            icon="i-heroicons-check"
            color="emerald"
            label="Mentés"
            @click="saveNewName"
            :loading="loading.rename"
            :disabled="loading.rename"
          />
        </div>

        <template v-else>
          <h1 class="text-2xl font-extrabold">Csapatlogó</h1>
          <h2 class="text-lg font-bold text-gray-500">
            {{ team?.competitionTitle }}
          </h2>
        </template>
      </template>

      <CarouselMenu :pagecount="3" name="teamedit" ref="teamedit" maxwidth>
        <template #page1>
          <div class="min-w-[340px]">
            <h2 class="text-lg font-bold">Csapattagok</h2>
            <ul class="ml-2 list-inside list-disc">
              <li v-for="member in team?.users" :key="member.id" class="my-1">
                <span class="text-lg">{{ member.name }}</span>

                <UTooltip
                  v-if="imLeader && !member.isMe"
                  text="Kirúgás"
                  class="ml-3 align-bottom"
                >
                  <UButton
                    icon="i-heroicons-x-mark"
                    color="red"
                    variant="soft"
                    size="xs"
                    @click="showConfirm('kick', member.id)"
                  />
                </UTooltip>

                <UBadge
                  v-if="member.isLeader"
                  class="ml-3 align-text-bottom"
                  icon="i-heroicons-chevron-double-up-16-solid"
                  label="Csapatvezető"
                  variant="subtle"
                  color="amber"
                  size="xs"
                  :ui="{ rounded: 'rounded-full' }"
                />
              </li>
              <li
                v-for="member in team?.invites"
                :key="member.id"
                class="my-1 text-gray-300"
              >
                <span class="text-lg">{{ member.name }}</span>

                <UTooltip
                  v-if="imLeader"
                  text="Kirúgás"
                  class="ml-3 align-bottom"
                >
                  <UButton
                    icon="i-heroicons-x-mark"
                    color="red"
                    variant="soft"
                    size="xs"
                    @click="showConfirm('kick', member.id)"
                  />
                </UTooltip>

                <UBadge
                  class="ml-3 align-text-bottom"
                  icon="i-heroicons-envelope"
                  label="Meghívott"
                  variant="subtle"
                  color="indigo"
                  size="xs"
                  :ui="{ rounded: 'rounded-full' }"
                />
              </li>
            </ul>

            <template v-if="imLeader">
              <UDivider class="my-4" />

              <h2 class="mb-2 text-lg font-bold">Csapattársak felvétele</h2>
              <div>
                <UForm :state="inviteState" @submit.prevent="inviteUser">
                  <UButtonGroup v-if="imLeader">
                    <UInput
                      placeholder="Felhasználónév"
                      v-model="inviteState.username"
                      :disabled="fullTeam"
                    />
                    <UTooltip text="Meghívás" :prevent="fullTeam">
                      <UButton
                        icon="i-heroicons-user-plus"
                        color="indigo"
                        type="submit"
                        :loading="loading.invite"
                        :disabled="loading.invite || fullTeam"
                      />
                    </UTooltip>
                  </UButtonGroup>
                </UForm>
              </div>

              <UDivider class="my-4" />

              <h2 class="mb-2 text-lg font-bold">Csapatlogó</h2>
              <UButton
                label="Csapatlogó szerkesztése"
                icon="i-heroicons-photo"
                class="mb-4"
                @click="gotoPage(2)"
              />
            </template>
          </div>
        </template>

        <template #page2>
          <div class="min-w-[340px] text-justify">
            <p>
              Ahogy a főoldalon olvasható, lehetőség nyílt csapatlogót
              beállítani. A feltöltött logónak az alábbi technikai feltételeket
              kell teljesítenie:
              <span class="italic text-gray-400"
                >(A tartalmi megfelelőség mellett)</span
              >
            </p>

            <ul class="mt-4 list-disc pl-4">
              <li>A logó kör alakú</li>
              <li>Átlátszó háttér</li>
              <li>Képméret legalább 400x400px</li>
              <li>
                A kép aránya 1:1
                <span class="italic text-gray-400"
                  >(A rendszer automatikusan négyzetre vágja a képet, ha ez nem
                  teljesül!)</span
                >
              </li>
              <li>
                Jól nézzen ki akár 80x80px-en megjelenítve is
                <span class="text-gray-200"
                  >(Ne legyenek rajta túl apró részletek)</span
                >
              </li>
            </ul>
          </div>
        </template>

        <template #page3>
          <div class="w-full">
            <div>
              <h2 class="mb-2 text-lg font-bold">Logó feltöltése</h2>
              <UInput
                :loading="loading.upload"
                :disabled="loading.upload"
                loading-icon="i-heroicons-arrow-path"
                type="file"
                placeholder="Fájl kiválasztása..."
                class="mb-3 w-fit"
                @change="getFileChange"
                icon="i-heroicons-archive-box"
                v-model="uploadName"
              />
              <UButton label="Feltöltés" @click="uploadImage" />
            </div>
            <UDivider class="my-4" />
            <div>
              <div class="mb-2 flex flex-row flex-nowrap gap-3">
                <h2 class="text-lg font-bold">Jelenlegi logó</h2>
                <template v-if="teamLogo?.logoUrl">
                  <UBadge
                    v-if="teamLogo.logoApproved"
                    label="Elfogadva"
                    icon="i-heroicons-check-circle-solid"
                    color="emerald"
                    variant="subtle"
                  />
                  <UBadge
                    v-else
                    label="Elfogadásra vár"
                    icon="i-heroicons-question-mark-circle-solid"
                    color="orange"
                    variant="subtle"
                  />
                </template>
                <template v-else>
                  <UBadge label="Nincs logó" color="gray" variant="subtle" />
                </template>
              </div>
              <div v-if="teamLogo?.logoUrl">
                <UButton
                  label="Logó törlése"
                  icon="i-heroicons-trash"
                  color="red"
                  size="xs"
                  variant="soft"
                  @click="deleteLogo"
                />
                <img :src="teamLogo.logoUrl" class="mt-2 size-48" />
              </div>
            </div>
          </div>
        </template>
      </CarouselMenu>

      <template #footer>
        <div class="flex flex-row justify-end gap-2">
          <UButton
            v-if="carouselStage > 1"
            label="Vissza"
            @click="gotoPage(carouselStage - 1)"
            variant="soft"
          />

          <UButton
            v-if="carouselStage == 1"
            label="Kész"
            @click="modal.close"
            :disabled="renaming"
          />
          <UButton
            v-if="carouselStage == 2"
            label="Következő"
            @click="gotoPage(3)"
            :disabled="renaming"
          />
          <UButton
            v-if="carouselStage == 3"
            label="Kész"
            @click="modal.close"
            :disabled="loading.upload"
          />
        </div>
      </template>
    </UCard>

    <Transition name="slide">
      <UCard class="mt-2" v-show="confirmCard">
        <div class="flex flex-row flex-nowrap items-center justify-between">
          <div>
            <h1 class="text-2xl font-extrabold">Megerősítés</h1>
            <h2 class="text-lg font-bold text-gray-500">
              {{ confirmText }}
            </h2>
          </div>
          <div class="flex flex-col flex-nowrap">
            <UButton
              color="red"
              label="Nem"
              icon="i-heroicons-x-mark"
              variant="soft"
              block
              @click="hideConfirm"
            />
            <UButton
              color="emerald"
              label="Igen"
              icon="i-heroicons-check"
              class="mt-1"
              block
              @click="confirmAction"
            />
          </div>
        </div>
      </UCard>
    </Transition>

    <!-- <UCard>
          <template #header>
            <h1 class="text-2xl font-extrabold">Csapatlogó</h1>
            <h2 class="text-lg font-bold text-gray-500">
              {{ team?.competitionTitle }}
            </h2>
          </template>

          

          <template #footer>
            <div class="flex flex-row justify-end gap-2">
              <UButton label="Vissza" @click="gotoPage(1)" variant="soft" />
              <UButton label="Tovább" @click="gotoPage(3)" />
            </div>
          </template>
        </UCard>

        <UCard>
          <template #header>
            <h1 class="text-2xl font-extrabold">Csapatlogó</h1>
            <h2 class="text-lg font-bold text-gray-500">
              {{ team?.competitionTitle }}
            </h2>
          </template>

          <template #footer>
            <div class="flex flex-row justify-end gap-2">
              <UButton label="Vissza" @click="gotoPage(2)" variant="soft" />
              <UButton label="Kész" @click="modal.close" />
            </div>
          </template>
        </UCard> -->
  </UModal>
</template>

<script lang="ts" setup>
import type { CarouselMenu } from "#components";

type t_CarouselMenu = InstanceType<typeof CarouselMenu>;
const teamEditRef = useTemplateRef<t_CarouselMenu>("teamedit");
const carouselStage = ref(1);

interface Props {
  teamId: string;
}

const inviteState = ref({
  username: "",
});

const renameState = ref({
  newName: "",
});

const props = defineProps<Props>();
const toast = useToast();
const modal = useModal();
const loadingSpinner = useLoadingSpinner();

const loading = ref({
  rename: false,
  invite: false,
  upload: false,
});

const { data: teamLogo, refresh: refreshTeamLogo } = await useFetch<{
  teamId: string;
  logoUrl: string | null;
  logoApproved: boolean;
  logoFullUrl: string;
}>(`/api/team/logo/${props.teamId}`);

const confirmCard = ref(false);
const confirmText = ref("Biztosan kilépsz a csapatból?");
const kickUserId = ref("");
const currentAction = ref<"delTeam" | "leave" | "kick">();

const renaming = ref(false);

const { data: team, refresh } = await useFetch(`/api/team/${props.teamId}`);

const emit = defineEmits<{
  finish: [refresh: boolean];
}>();

const imLeader = computed<boolean>(() => {
  return team.value?.users.find((u) => u.isMe)?.isLeader ?? false;
});
const fullTeam = computed<boolean>(() => {
  return (
    (team.value?.users.length ?? 0) + (team.value?.invites.length ?? 0) >=
    (team.value?.teamLimit ?? 0)
  );
});

function renameTeam() {
  renameState.value.newName = team.value?.name ?? "Új csapat";
  renaming.value = true;
}

async function saveNewName() {
  if (renameState.value.newName.length < 1) {
    toast.add({
      description: "A csapatnév nem lehet üres!",
      color: "red",
      title: "Hiba",
      icon: "i-heroicons-x-mark-20-solid",
    });
    return;
  }

  loading.value.rename = true;

  const [error, data] = await catchError(
    $fetchCsrfNotification<NotificationResponse>(`/api/team/${props.teamId}`, {
      method: "PUT",
      body: {
        newName: renameState.value.newName,
      },
    }),
  );

  await refresh();

  loading.value.rename = false;
  if (error === undefined) {
    renaming.value = false;
  }
}

async function inviteUser() {
  loading.value.invite = true;

  const [error, data] = await catchError(
    $fetchCsrfNotification<NotificationResponse>("/api/invite", {
      method: "POST",
      body: {
        teamId: props.teamId,
        username: inviteState.value.username,
      },
    }),
  );
  if (error === undefined) {
    inviteState.value.username = "";
  }
  await refresh();
  loading.value.invite = false;
  await nextTick();
  teamEditRef.value?.recalc();
}

async function showConfirm(
  action: "delTeam" | "leave" | "kick",
  userId?: string,
) {
  confirmCard.value = true;
  currentAction.value = action;

  let userName = "";
  if (userId) {
    userName =
      team.value?.users.find((u) => u.id == userId)?.name ??
      team.value?.invites.find((i) => i.id == userId)?.name ??
      "ismeretlen";
    kickUserId.value = userId;
  }

  switch (action) {
    case "delTeam":
      confirmText.value = "Biztosan kitörlöd a csapatot?";
      break;

    case "leave":
      confirmText.value = "Biztosan kilépsz a csapatból?";
      break;

    case "kick":
      confirmText.value = `Biztosan kirúgod "${userName}" felhasználót?`;
      break;

    default:
      break;
  }
}

async function hideConfirm() {
  confirmCard.value = false;
}

async function confirmAction() {
  if (currentAction.value == "kick") {
    kickUser();
  } else {
    leaveCompetition();
  }
}

async function kickUser() {
  loadingSpinner.value = true;

  const isInvite = team.value?.invites.some((i) => i.id == kickUserId.value);

  const [error, data] = await catchError(
    $fetchCsrfNotification<NotificationResponse>("/api/team/kick", {
      method: "POST",
      body: {
        teamId: props.teamId,
        kickId: kickUserId.value,
        invite: isInvite,
      },
    }),
  );

  await refresh();
  loadingSpinner.value = false;
  if (error === undefined) {
    hideConfirm();
  }
  await nextTick();
  teamEditRef.value?.recalc();
}

async function leaveCompetition() {
  loadingSpinner.value = true;

  const [error, data] = await catchError(
    $fetchCsrfNotification<NotificationResponse>(
      `/api/competition/leave/${team.value?.competitionId}`,
      {
        method: "POST",
      },
    ),
  );

  loadingSpinner.value = false;
  if (error === undefined) {
    emit("finish", true);
  }
}

function gotoPage(pageNum: number) {
  if (!teamEditRef.value) return;

  teamEditRef.value.jumpTo(pageNum);
  carouselStage.value = pageNum;
}

const upload = ref<File>();
const uploadName = ref<string>("");

async function uploadImage() {
  if (upload.value == undefined) return;
  loading.value.upload = true;
  let fd = new FormData();
  fd.append("image", upload.value);

  const [error] = await catchError(
    $fetchCsrfNotification<NotificationResponse>(
      `/api/team/logo/${props.teamId}`,
      {
        method: "POST",
        body: fd,
      },
    ),
  );

  loading.value.upload = false;
  if (error) return;
  await refreshTeamLogo();
  await nextTick();
  teamEditRef.value?.recalc();
}

function getFileChange(fl: FileList) {
  const item = fl.item(0);
  if (item == null) return;
  upload.value = item;
}

async function deleteLogo() {
  const teamId = props.teamId;
  const [error] = await catchError(
    $fetchCsrfNotification<NotificationResponse>(`/api/team/logo/${teamId}`, {
      method: "DELETE",
    }),
  );

  if (error) return;

  await refreshTeamLogo();
  await nextTick();
  teamEditRef.value?.recalc();
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.slide-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-enter-to {
  transform: translateY(0);
  opacity: 1;
}

.slide-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
