<template>
  <div class="flex h-screen w-full flex-col bg-[#0f1521] px-48 py-8">
    <!-- HEADER -->
    <div class="flex shrink-0 grow-0 flex-row flex-nowrap justify-between p-2">
      <div class="border-l-4 border-x-cyan-500 py-2 pl-8">
        <p class="text-2xl font-medium text-cyan-500">INFÓSOK ÉJSZAKÁJA</p>
        <h1 class="text-8xl font-black">MENETREND</h1>
      </div>
      <div class="text-right">
        <p class="text-2xl font-medium text-gray-500">JELENLEGI IDŐ</p>
        <div class="text-8xl font-semibold text-cyan-500">
          <span class="font-inconsolata">{{ time.h }}</span>
          <span class="mx-2 text-7xl text-cyan-800">:</span>
          <span class="font-inconsolata">{{ time.m }}</span>
          <span class="mx-2 text-7xl text-cyan-800">:</span>
          <span class="font-inconsolata">{{ time.s }}</span>
        </div>
      </div>
    </div>
    <!-- CARDS -->
    <div class="relative mb-2 mt-4 shrink grow basis-auto overflow-y-hidden">
      <VerticalMarquee :duration="duration">
        <div class="flex flex-col flex-nowrap gap-4 p-2">
          <template v-if="data">
            <EventCard
              v-for="event in data.events"
              :key="event.id"
              :start-time="event.startTime"
              :background-url="event.backgroundUrl ?? ''"
              :started="event.started"
            >
              <EventCompetition
                v-if="event.type === 'match'"
                :title="event.data.title"
                :team-a="event.data.teamA"
                :team-b="event.data.teamB"
              />
              <EventGeneral
                v-else-if="event.type === 'general'"
                :title="event.data.title"
                :description="event.data.description"
                :small-title="event.data.smallTitle"
              />
            </EventCard>
          </template>
        </div>
      </VerticalMarquee>
    </div>
  </div>
</template>

<script lang="ts" setup>
const now = useNow();

const { data, refresh } = useFetch("/api/event/schedule");

const duration = computed(() => {
  const length = data.value?.events.length;
  if (!length) return "10s";

  return `${length * 10}s`;
});

const isMounted = ref(false);
const time = computed(() => {
  if (!isMounted.value) return { h: "00", m: "00", s: "00" };
  const formatter = new Intl.DateTimeFormat("hu-HU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const [h, _1, m, _2, s] = formatter.formatToParts(now.value);
  return { h: h?.value ?? "00", m: m?.value ?? "00", s: s?.value ?? "00" };
});

useIntervalFn(refresh, 5000);

onMounted(() => {
  isMounted.value = true;
});
</script>

<style></style>
