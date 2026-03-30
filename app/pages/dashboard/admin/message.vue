<template>
  <div class="flex flex-col gap-5 p-5 md:gap-7 md:p-7 lg:gap-10 lg:p-10">
    <UCard class="dark:bg-opacity-90">
      <template #header>
        <h1 class="text-xl font-bold">Előtti napi információk</h1>
      </template>
      <UForm
        :state="beforeMessageState"
        class="w-96 max-w-96 space-y-6"
        @submit.prevent="sendBeforeConfirm"
      >
        <UFormGroup name="openTime" label="Nyitási idő (pl. '16:00')">
          <UInput v-model="beforeMessageState.openTime" />
        </UFormGroup>
        <UFormGroup name="startTime" label="Kezdési idő (pl. '17:00')">
          <UInput v-model="beforeMessageState.startTime" />
        </UFormGroup>
        <UButton type="submit" label="Email küldése" />
      </UForm>
    </UCard>

    <UCard class="dark:bg-opacity-90">
      <template #header>
        <h1 class="text-xl font-bold">Figyelmeztetés nem teljes csapatoknak</h1>
      </template>
      <UForm
        :state="unfullMessageState"
        class="w-96 max-w-96 space-y-6"
        @submit.prevent="sendUnfullConfirm"
      >
        <UFormGroup
          name="closeTime"
          label="Versenyjelentkezés zárás időpontja (pl. 'április 1-jén, 20 órakor')"
        >
          <UInput v-model="unfullMessageState.closeTime" />
        </UFormGroup>
        <UButton type="submit" label="Email küldése" />
      </UForm>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import ModalConfirmAction from "~/components/Modal/ConfirmAction.vue";

const modal = useModal();
const loadingSpinner = useLoadingSpinner();

definePageMeta({
  layout: "dashboard-admin",
  middleware: "auth",
});

const beforeMessageState = ref({
  openTime: "",
  startTime: "",
});

const unfullMessageState = ref({
  closeTime: "",
});

async function sendBeforeConfirm() {
  modal.open(ModalConfirmAction, {
    title: "Küldés megerősítése",
    description: "Biztosan elküldöd az emailt az összes felhasználónak?",
    confirmText: "Igen",
    cancelText: "Nem",
    onSuccess: () => {
      sendBeforeMail();
      modal.close();
    },
  });
}

async function sendBeforeMail() {
  loadingSpinner.value = true;

  const [error, resp] = await catchError(
    $fetchCsrfNotification<NotificationResponse>("/api/mail/mailbefore", {
      method: "POST",
      body: {
        openTime: beforeMessageState.value.openTime,
        startTime: beforeMessageState.value.startTime,
      },
    }),
  );

  loadingSpinner.value = false;
}

async function sendUnfullConfirm() {
  modal.open(ModalConfirmAction, {
    title: "Küldés megerősítése",
    description:
      "Biztosan elküldöd az emailt az összes érintett felhasználónak?",
    confirmText: "Igen",
    cancelText: "Nem",
    onSuccess: () => {
      sendUnfullMail();
      modal.close();
    },
  });
}

async function sendUnfullMail() {
  loadingSpinner.value = true;

  const [error, resp] = await catchError(
    $fetchCsrfNotification<NotificationResponse>("/api/mail/unfullteam", {
      method: "POST",
      body: {
        closeTime: unfullMessageState.value.closeTime,
      },
    }),
  );

  loadingSpinner.value = false;
}
</script>

<style></style>
