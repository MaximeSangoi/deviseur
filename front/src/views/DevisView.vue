<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDate, useDisplay } from 'vuetify'

const showAnimation = ref(false)
const date = useDate()
const startDate = ref(date.startOfMonth(new Date()))
const endDate = ref(date.endOfMonth(date.addMonths(startDate.value, 2)))

const startDateFormatted = computed(() => {
  return date.format(startDate.value, 'keyboardDate')
})
const endDateFormatted = computed(() => {
  return date.format(endDate.value, 'keyboardDate')
})
const daysBetween = computed(() => {
  return date.getDiff(endDate.value, startDate.value, 'days')
})
const totalDevis = computed(() => {
  return date.getDiff(endDate.value, startDate.value, 'days') * 475
})

const setToMonthStart = () => {
  startDate.value = date.startOfMonth(startDate.value)
  showAnimation.value = true
  setTimeout(() => (showAnimation.value = false), 200)
}
const setToMonthMinus1 = () => {
  startDate.value = date.addMonths(startDate.value, -1)
  showAnimation.value = true
  setTimeout(() => (showAnimation.value = false), 200)
}
const setToMonthPlus1 = () => {
  startDate.value = date.addMonths(startDate.value, 1)
  showAnimation.value = true
  setTimeout(() => (showAnimation.value = false), 200)
}
const setToStartDatePlusMonth = (numberOfMonths: number) => {
  const startDay = date.getDate(startDate.value)
  endDate.value = date.setDate(date.addMonths(startDate.value, numberOfMonths), startDay - 1)
  showAnimation.value = true
  setTimeout(() => (showAnimation.value = false), 200)
}

const { name } = useDisplay()

const direction = computed(() => {
  switch (name.value) {
    case 'xs':
      return 'vertical'
    case 'sm':
      return 'vertical'
    case 'md':
      return 'vertical'
    case 'lg':
      return 'horizontal'
    case 'xl':
      return 'horizontal'
    case 'xxl':
      return 'horizontal'
    default:
      return undefined
  }
})
</script>

<template>
  <!-- START DATE -->

  <v-timeline
    :direction="direction"
    side="end"
    density="default"
    dot-color="secondary"
    class="pt-4"
  >
    <v-timeline-item size="15">
      <template v-slot:opposite>
        <div class="d-flex flex-column align-center justify-end date-container">
          <div>
            <v-chip
              size="large"
              label
              class="date-chip"
              :class="{ 'less-padding': name === 'xs' || name === 'sm' }"
              >{{ startDateFormatted }}</v-chip
            >
          </div>
          <div style="height: 50px">
            <div class="d-flex ga-3">
              <v-btn
                density="default"
                icon="mdi-calendar-arrow-left"
                v-tooltip:bottom-end="'Mois précédent'"
                @click="setToMonthMinus1()"
              ></v-btn>
              <v-btn
                density="default"
                icon="mdi-sort-calendar-descending"
                v-tooltip:bottom="'Début du mois'"
                @click="setToMonthStart()"
              ></v-btn>
              <v-btn
                density="default"
                icon="mdi-calendar-arrow-right"
                v-tooltip:bottom-start="'Mois suivant'"
                @click="setToMonthPlus1()"
              ></v-btn>
            </div>
          </div>
        </div>
      </template>
      <v-date-picker
        elevation="2"
        :hide-header="true"
        :show-adjacent-months="false"
        v-model="startDate"
      ></v-date-picker>
    </v-timeline-item>

    <!-- GENERATE CARD -->

    <v-timeline-item hide-dot class="generate-card" :class="{ vertical: direction === 'vertical' }">
      <template v-slot:opposite>
        <v-card elevation="1" variant="flat" :class="{ emphasize: showAnimation }" min-width="156">
          <v-card-item>
            <div class="d-flex flex-column">
              <v-chip prepend-icon="mdi-calendar-clock" variant="text" size="x-large" label>
                {{ daysBetween }} jours
              </v-chip>
              <v-chip prepend-icon="mdi-currency-eur" variant="text" size="x-large" label>
                {{ totalDevis }} euros
              </v-chip>
            </div>
            <div class="d-flex justify-center">
              <v-btn color="primary" variant="flat" class="mt-3">Générer</v-btn>
            </div>
          </v-card-item>
        </v-card>
      </template>
    </v-timeline-item>

    <!-- END DATE -->

    <v-timeline-item size="15">
      <template v-slot:opposite>
        <div class="d-flex flex-column align-center justify-end date-container">
          <div>
            <v-chip
              size="large"
              label
              class="date-chip"
              :class="{ 'less-padding': name === 'xs' || name === 'sm' }"
              >{{ endDateFormatted }}</v-chip
            >
          </div>
          <div style="height: 50px">
            <div class="d-flex ga-3 btn-end-date">
              <v-btn
                density="default"
                icon="mdi-numeric-3"
                v-tooltip:bottom-end="'Début + 3 mois'"
                @click="setToStartDatePlusMonth(3)"
              ></v-btn>
              <v-btn
                density="default"
                icon="mdi-numeric-6"
                v-tooltip:bottom="'Début + 6 mois'"
                @click="setToStartDatePlusMonth(6)"
              ></v-btn>
              <v-btn
                density="default"
                icon="mdi-numeric-9"
                v-tooltip:bottom-start="'Début + 9 mois'"
                @click="setToStartDatePlusMonth(9)"
              ></v-btn>
            </div>
          </div>
        </div>
      </template>
      <v-date-picker
        elevation="2"
        :hide-header="true"
        :show-adjacent-months="false"
        v-model="endDate"
      ></v-date-picker>
    </v-timeline-item>
  </v-timeline>
</template>

<style>
.btn-end-date {
  .v-btn__content::before {
    content: '+ ' !important;
    margin-top: -3px !important;
    margin-right: -10px !important;
  }
  .v-btn__content i {
    margin-right: -3px;
    font-size: 1.6rem;
  }
}

.date-container {
  height: 100%;

  .date-chip {
    font-family: Slabo;
    padding: 40px 124px !important;
    height: calc(var(--v-chip-height) + 40px) !important;
    margin-bottom: -20px;
    background-color: rgb(var(--v-theme-surface-light));
    border: 1px solid #fbe9e7;
    color: #fbe9e7;

    &.less-padding {
      padding: 40px 60px !important;
    }
  }
}

.fade-transition-enter-active {
  transition: all 0.5s ease !important;
}
.fade-transition-leave-active {
  transition: all 0.5s ease !important;
}
.v-date-picker-month__day--hide-adjacent {
  display: none !important;
}

.generate-card .v-timeline-item__opposite {
  margin-bottom: -110px !important;
}

.generate-card.vertical .v-timeline-item__opposite {
  margin-bottom: 0 !important;
  margin-right: -125px !important;
}

@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}

.emphasize {
  animation-name: emphasize;
  animation-duration: 0.15s;
}

@keyframes emphasize {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>
