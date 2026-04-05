<template>
  <div
    class="relative h-full overflow-hidden"
    :class="{ 'mask-edges': isOverflowing }"
    ref="containerRef"
  >
    <div
      class="flex flex-col"
      :class="{ 'marquee-track': isOverflowing }"
      :style="{ '--duration': duration }"
    >
      <div class="w-full" ref="contentRef">
        <slot />
      </div>
      <div class="w-full" v-if="isOverflowing">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
type Props = {
  duration?: string;
};

const { duration = "20s" } = defineProps<Props>();

const container = useTemplateRef("containerRef");
const content = useTemplateRef("contentRef");

const containerSize = useElementSize(container);
const contentSize = useElementSize(content);

const isOverflowing = computed(() => {
  return contentSize.height.value > containerSize.height.value;
});
</script>

<style scoped>
/* 1. Optional: Fades out the top and bottom edges so cards don't just abruptly cut off */
.mask-edges {
  mask-image: linear-gradient(
    to bottom,
    transparent,
    black 5%,
    black 95%,
    transparent
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent,
    black 5%,
    black 95%,
    transparent
  );
}

/* 2. Applies the continuous animation */
.marquee-track {
  animation: scroll-y var(--duration) linear infinite;
}

/* 4. The actual movement logic */
@keyframes scroll-y {
  from {
    transform: translateY(0);
  }
  to {
    /* Moves the track up by exactly half its height (one full set of your items) */
    transform: translateY(-50%);
  }
}
</style>
