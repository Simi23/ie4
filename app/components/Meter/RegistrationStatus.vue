<template>
  <div>
    <h2 class="mb-2 text-lg font-semibold">Regisztrációs állapot</h2>
    <p>
      Regisztráció állapota:
      <span :class="selected.color">{{ selected.text }}</span>
    </p>
  </div>
</template>

<script lang="ts" setup>
const regOption = ref(0);
const dRegOptions = [
  { text: "Még nem indult el", color: "text-amber-400" },
  { text: "Nyitva", color: "text-emerald-500" },
  { text: "Lezárult", color: "text-red-500" },
];

const defaultOption = {
  text: "Ismeretlen",
  color: "text-amber-400",
};

const selected = computed(() => {
  return dRegOptions[regOption.value] ?? defaultOption;
});

const { refresh: refreshRegOption } = useFetch("/api/admin/regstatus", {
  lazy: true,
  onResponse: (r) => {
    regOption.value = Number(r.response._data);
  },
});
</script>

<style></style>
