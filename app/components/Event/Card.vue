<template>
  <div
    class="eventcard h-96 w-full rounded-md p-4 ring-2 ring-cyan-950"
    :style="{
      '--bgurl': `url(${imageUrl})`,
    }"
  >
    <div
      class="content flex h-full flex-row flex-nowrap items-center justify-between gap-16 p-8"
    >
      <div>
        <slot />
      </div>
      <div
        class="timedisplay flex h-64 w-[32rem] shrink-0 flex-row items-center justify-end rounded-lg p-8 text-right"
      >
        <div>
          <template v-if="started">
            <div class="flex flex-row flex-nowrap items-center gap-4">
              <div class="relative size-8">
                <div class="pulsating-circle"></div>
              </div>
              <p class="text-5xl font-semibold text-emerald-500">Elkezdődött</p>
            </div>
          </template>
          <template v-else>
            <p class="text-2xl font-semibold uppercase text-gray-400">Kezdés</p>
            <div class="text-8xl font-semibold text-gray-50">
              <NuxtTime
                :datetime="startTime"
                hour="2-digit"
                :hour12="false"
                locale="hu-HU"
                class="font-inconsolata"
              />
              <span class="mx-2 text-7xl text-gray-200">:</span>
              <NuxtTime
                :datetime="startTime"
                minute="2-digit"
                locale="hu-HU"
                class="font-inconsolata"
              />
            </div>
            <div class="text-4xl text-gray-300">
              <NuxtTime :datetime="startTime" relative locale="hu-HU" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
type Props = {
  backgroundUrl: string;
  startTime: number;
  started: boolean;
};
const props = defineProps<Props>();
const img = useImage();

const imageUrl = computed(() => {
  const link = img(props.backgroundUrl);

  return link;
});
</script>

<style scoped>
.content {
  opacity: 100%;
}

.eventcard {
  background:
    linear-gradient(
      to right,
      rgba(11, 16, 26, 0.95) 25%,
      rgba(11, 16, 26, 0.6) 100%
    ),
    var(--bgurl);
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 95%;
}

.timedisplay {
  background: rgba(11, 16, 26, 0.5);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.pulsating-circle {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 30px;
  height: 30px;

  &:before {
    content: "";
    position: relative;
    display: block;
    width: 300%;
    height: 300%;
    box-sizing: border-box;
    margin-left: -100%;
    margin-top: -100%;
    border-radius: 45px;
    background-color: #10b981;
    animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  }

  &:after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    display: block;
    width: 100%;
    height: 100%;
    background-color: #10b981;
    border-radius: 15px;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
    animation: pulse-dot 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s
      infinite;
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.33);
  }
  80%,
  100% {
    opacity: 0;
  }
}

@keyframes pulse-dot {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.8);
  }
}
</style>
