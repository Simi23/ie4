<template>
  <div
    class="flex h-screen w-screen flex-row items-center justify-center overflow-hidden"
  >
    <BracketHolder
      v-if="bracket"
      :display-bracket="bracket"
      :editing="false"
      :round-count="roundCount"
      id="bracket"
    />
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();

const { data: bracket, refresh: refreshBracket } = useFetch(
  `/api/bracket/display/${route.params.id}`,
);

const roundCount = computed(() => {
  return calculateBracketSize(bracket.value?.numberOfCompetitors ?? 0);
});

function calculateBracketSize(numberOfCompetitors: number) {
  return Math.ceil(nLog(2, numberOfCompetitors));
}

function nLog(n: number, x: number) {
  return Math.log(x) / Math.log(n);
}

function resizeBracket() {
  const sW = window.innerWidth;
  const sH = window.innerHeight;
  const bracket = document.getElementById("bracket");
  if (bracket == null) {
    return;
  }
  const bW = bracket.offsetWidth ?? 1;
  const bH = bracket.offsetHeight ?? 1;

  const scaleFactor = Math.min(sW / bW, sH / bH);
  bracket.style.transform = `scale(${scaleFactor})`;
}

async function refreshContent() {
  await refreshBracket();
  await nextTick();
  resizeBracket();
}

useInterval(5000, {
  callback: refreshContent,
});

onMounted(async () => {
  await nextTick();
  resizeBracket();
});
</script>

<style>
#bracket {
  transition: transform 0.5s ease-in-out;
}
</style>
