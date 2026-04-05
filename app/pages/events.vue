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
          <NuxtTime
            :datetime="now"
            hour="2-digit"
            :hour12="false"
            locale="hu-HU"
            class="font-inconsolata"
          />
          <span class="mx-2 text-7xl text-cyan-800">:</span>
          <NuxtTime
            :datetime="now"
            minute="2-digit"
            locale="hu-HU"
            class="font-inconsolata"
          />
          <span class="mx-2 text-7xl text-cyan-800">:</span>
          <NuxtTime
            :datetime="now"
            second="2-digit"
            locale="hu-HU"
            class="font-inconsolata"
          />
        </div>
      </div>
    </div>
    <!-- CARDS -->
    <div class="relative mb-2 mt-4 shrink grow basis-auto overflow-y-hidden">
      <VerticalMarquee>
        <div class="flex flex-col flex-nowrap gap-4 p-2">
          <EventCard v-bind="card1">
            <EventCompetition v-bind="card1" />
          </EventCard>
          <EventCard v-bind="card2">
            <EventCompetition v-bind="card2" />
          </EventCard>
          <EventCard v-bind="card3">
            <EventGeneral
              title="Kapunyitás"
              description="A kapu 10 percig lesz nyitva"
            />
          </EventCard>
        </div>
      </VerticalMarquee>
    </div>
  </div>
</template>

<script lang="ts" setup>
const now = useNow();

const card1 = ref({
  title: "Counter-Strike 2: 1. kör",
  teamA: "Lanon Nincsen Demó",
  teamB: "Medgyesegyházi szeretetszolgálat",
  backgroundUrl: "/images/cmnlqmcsy0002b0kuezen1g04.png",
  startTime: Date.now() + 10 * 60 * 1000,
  started: true,
});

const card2 = ref({
  title: "League of Legends: döntő",
  teamA: "Adom vissza a vezérlést",
  teamB: "League of Boosted",
  backgroundUrl: "/images/cmnlwp6250004b0kusjjmy613.png",
  startTime: Date.now() + 130 * 60 * 1000,
  started: false,
});
const card3 = ref({
  title: "League of Legends: döntő",
  teamA: "Adom vissza a vezérlést",
  teamB: "League of Boosted",
  backgroundUrl: "/images/cmnm0zwcp0006b0kulbbx5myh.png",
  startTime: Date.now() + 130 * 60 * 1000,
  started: false,
});

// const timeString = computed(() =>
//   now.value.toLocaleString("hu-HU", {
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//   }),
// );
</script>

<style></style>
