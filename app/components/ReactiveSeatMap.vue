<template>
  <SeatMap
    class="w-full"
    :svg-id="svgId"
    :letter-stroke="letterStroke"
    :seat-stroke="seatStroke"
    :arrow-stroke="arrowStroke"
    :multi-colors="multiColors"
    ref="reactiveseatmap"
    @chosen-seat="handleClick"
  />
</template>

<script lang="ts" setup>
import SeatMap from "~/components/SeatMap.vue";

const smRef = useTemplateRef<InstanceType<typeof SeatMap>>("reactiveseatmap");

const selectedSeats = defineModel<string[]>({ default: [] });

type SeatDefinition = {
  name: string;
  color: string;
  selectable?: boolean;
  selectedColor?: string;
};

type Props = {
  svgId: string;
  letterStroke?: string;
  seatStroke?: string;
  arrowStroke?: string;
  seats?: SeatDefinition[];
  defaultColor?: string;
  multiColors?: string[][];
  single?: boolean;
};

const {
  svgId,
  letterStroke = "#ffffff",
  seatStroke = "#222222",
  arrowStroke = "#ffffff",
  seats = [],
  defaultColor = "#374151",
  multiColors = [],
  single = false,
} = defineProps<Props>();

watch(() => seats, redraw, {
  deep: true,
});

function redraw() {
  if (!smRef.value) return;
  smRef.value.changeSeatColour("all", defaultColor);
  smRef.value.clearSeatEvents();

  for (let i = 0; i < seats.length; i++) {
    const s = seats[i];
    if (!s) return;

    if (s.selectedColor && selectedSeats.value.includes(s.name)) {
      smRef.value.changeSeatColour(s.name, s.selectedColor);
    } else {
      smRef.value.changeSeatColour(s.name, s.color);
    }

    if (s.selectable) {
      smRef.value.assignSeat(s.name);
    }
  }
}

function handleClick(seatName: string) {
  const idx = selectedSeats.value.indexOf(seatName);
  if (single) {
    if (selectedSeats.value.length == 0) {
      selectedSeats.value.push(seatName);
    } else {
      if (idx > -1) {
        selectedSeats.value.splice(0, 1);
      } else {
        selectedSeats.value.splice(0, 1);
        selectedSeats.value.push(seatName);
      }
    }
    redraw();
    return;
  }

  if (idx > -1) {
    selectedSeats.value.splice(idx, 1);
  } else {
    selectedSeats.value.push(seatName);
  }
  redraw();
}

onMounted(async () => {
  await nextTick();
  redraw();
});
</script>

<style></style>
