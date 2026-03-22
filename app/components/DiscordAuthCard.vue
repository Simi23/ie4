<template>
  <UCard class="grow dark:bg-opacity-90">
    <template #header>
      <div class="flex flex-row flex-nowrap items-center justify-between">
        <h1 class="text-2xl font-bold">
          Discord
          <UBadge
            v-if="dcData?.dcConnected"
            :label="dcData?.dcGlobalName"
            size="md"
            variant="subtle"
          >
            <template #leading>
              <UAvatar :src="dcAvatar" size="3xs" crossorigin />
            </template>
          </UBadge>
          <span class="ml-2 text-xl font-extralight text-amber-500" v-else
            >Nincs csatlakoztatva</span
          >
        </h1>
      </div>
    </template>
    <UButton
      v-if="!dcData?.dcConnected"
      label="Fiók összekapcsolása"
      icon="i-heroicons-link"
      @click="redirectToDiscord"
    />

    <div v-else class="flex flex-row gap-2">
      <UButton
        label="Fiók leválasztása"
        icon="i-heroicons-link-slash"
        color="red"
        variant="soft"
        @click="disconnectDiscord"
      />
      <UButton
        label="Hitelesített rang újbóli igénylése"
        icon="i-heroicons-check-badge-solid"
        @click="refreshDiscordRole"
        :loading="refreshLoading"
        :disabled="refreshLoading"
      />
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import ModalConfirmAction from "~/components/Modal/ConfirmAction.vue";

const cfg = useRuntimeConfig();
const modal = useModal();

const { data: dcData, refresh } = useFetch("/api/discord/me");
const dcAvatar = computed(() => {
  return `https://cdn.discordapp.com/avatars/${dcData.value?.dcId}/${dcData.value?.dcAvatar}.jpg?size=128`;
});

const isNavigating = ref(false);

async function redirectToDiscord() {
  const redirect_uri_base = encodeURIComponent(
    `${cfg.public.siteName}/api/discord/onboardcallback`,
  );
  const redirect_uri = `://discord.com/oauth2/authorize?client_id=1338156490137141270&response_type=code&redirect_uri=${redirect_uri_base}&scope=identify`;

  await navigateTo("discord" + redirect_uri, {
    external: true,
    open: {
      target: "_self",
    },
  });

  setInterval(() => {
    if (document.hasFocus() && isNavigating.value == false) {
      isNavigating.value = true;
      return navigateTo("https" + redirect_uri, {
        external: true,
      });
    }
  }, 250);
}

async function disconnectDiscord() {
  modal.open(ModalConfirmAction, {
    description: "Biztosan leválasztod a Discord fiókodat?",
    onSuccess: async () => {
      const [error, data] = await catchError(
        $fetchCsrfNotification<NotificationResponse>(
          "/api/discord/disconnect",
          {
            method: "POST",
          },
        ),
      );

      modal.close();
      refresh();
    },
  });
}

const refreshLoading = ref(false);
async function refreshDiscordRole() {
  refreshLoading.value = true;
  await $fetchCsrfNotification("/api/discord/reassign", {
    method: "POST",
  }).catch();
  refreshLoading.value = false;
}
</script>

<style></style>
