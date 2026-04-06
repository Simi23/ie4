<template>
  <USelectMenu
    v-model="modelValue"
    :options="media"
    value-attribute="id"
    option-attribute="name"
    placeholder="Kép kiválasztása"
    :popper="smPopper"
    :ui="smUi"
  />
</template>

<script lang="ts" setup>
type Props = {
  smPopper?: any;
  smUi?: any;
};

const props = defineProps<Props>();

const modelValue = defineModel<string>();

const { data: media } = useFetch("/api/media", {
  default: () => [],
  lazy: true,
});
</script>

<style></style>
