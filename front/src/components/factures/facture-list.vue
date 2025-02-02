<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { computed, ref, watchEffect } from 'vue'
import { Facture } from '../../models/facture'

const props = defineProps({
  timelineError: Boolean,
  timelineLoading: Boolean,
  factures: Array<Facture>,
  monthIndex: { type: Number, required: true },
  daysWorked: { type: Number, required: true },
  loading: Boolean,
})

const emit = defineEmits<{
  onDownloadPDF: [filename: string]
  onGeneratePDF: [monthIndex: number, daysWorked: number]
}>()

const { name } = useDisplay()

const width = computed(() => {
  switch (name.value) {
    case 'xs':
      return 200
    case 'sm':
      return 260
    case 'md':
      return 370
    case 'lg':
      return 550
    case 'xl':
      return 600
    case 'xxl':
      return 700
    default:
      return undefined
  }
})

const monthsGenerateList = ref([
  { name: 'Janvier', date: new Date('2025-01'), number: 1 },
  { name: 'Février', date: new Date('2025-02'), number: 2 },
  { name: 'Mars', date: new Date('2025-03'), number: 3 },
  { name: 'Avril', date: new Date('2025-04'), number: 4 },
  { name: 'Mai', date: new Date('2025-05'), number: 5 },
  { name: 'Juin', date: new Date('2025-06'), number: 6 },
  { name: 'Juillet', date: new Date('2025-07'), number: 7 },
  { name: 'Août', date: new Date('2025-08'), number: 8 },
  { name: 'Septembre', date: new Date('2025-09'), number: 9 },
  { name: 'Octobre', date: new Date('2025-10'), number: 10 },
  { name: 'Novembre', date: new Date('2025-11'), number: 11 },
  { name: 'Décembre', date: new Date('2025-12'), number: 12 },
])

const monthIndex = ref(props.monthIndex)
const daysWorked = ref(props.daysWorked)

watchEffect(() => (monthIndex.value = props.monthIndex))
</script>

<template>
  <div class="timeline-container">
    <v-timeline side="end" v-if="!props.timelineError && !props.timelineLoading">
      <v-timeline-item dot-color="background" fill-dot size="35">
        <template v-slot:icon>
          <v-icon color="primary">mdi-upload-multiple</v-icon>
        </template>
        <template v-slot:default>
          <v-btn color="primary" variant="tonal" density="default">Charger plus...</v-btn>
        </template>
      </v-timeline-item>
      <v-timeline-item
        v-for="facture in props.factures"
        :key="facture.month!"
        dot-color="primary"
        size="15"
      >
        <template v-slot:opposite>
          <div>{{ facture.month }}</div>
        </template>
        <v-hover>
          <template v-slot:default="{ isHovering, props }">
            <v-list v-bind="props">
              <v-list-item :width="width">
                <template v-slot:subtitle>
                  <div v-if="facture.totalTTC" class="totalTTC">{{ facture.totalTTC }} €</div>
                  <div v-else>Aucune donnée</div>
                </template>
                <template v-slot:append>
                  <div class="d-flex ga-4 align-center">
                    <v-chip v-if="isHovering && facture.versions?.length > 0" class="cursor-pointer"
                      >Versions</v-chip
                    >
                    <v-icon
                      v-tooltip:end="'Télécharger'"
                      class="cursor-pointer"
                      @click="emit('onDownloadPDF', facture.name!)"
                      >mdi-download</v-icon
                    >
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </template>
        </v-hover>
      </v-timeline-item>

      <v-timeline-item hide-dot>
        <template v-slot:opposite>
          <v-divider color="black" width="100"></v-divider>
        </template>
        <v-divider color="black" width="100"></v-divider>
      </v-timeline-item>

      <v-timeline-item dot-color="#ccc" fill-dot size="35">
        <template v-slot:icon>
          <v-icon color="secondary">mdi-calculator</v-icon>
        </template>
        <template v-slot:opposite>
          <div>
            <v-select
              label="Mois travaillé"
              v-model="monthIndex"
              :items="monthsGenerateList"
              item-title="name"
              item-value="number"
              variant="solo"
              rounded="0"
              hide-details
              :width="name === 'xs' ? '130px' : '150px'"
            ></v-select>
          </div>
        </template>

        <v-sheet :width="width" height="64" class="d-flex ga-2 pt-3 pb-3 align-center" color="#ccc">
          <div class="flex-grow-1">
            <v-text-field
              hide-details
              variant="solo"
              v-model="daysWorked"
              rounded="0"
              :label="name === 'xs' ? 'Nombre jours' : 'Quantité de jours travaillés'"
              required
            >
            </v-text-field>
          </div>
          <div>
            <v-btn
              v-if="name === 'lg' || name === 'xl' || name === 'xxl'"
              color="secondary"
              rounded="0"
              variant="elevated"
              prepend-icon="mdi-auto-fix"
              height="56"
              :loading="props.loading"
              @click="emit('onGeneratePDF', monthIndex, daysWorked)"
            >
              Générer
            </v-btn>
            <v-btn
              v-else
              icon="mdi-auto-fix"
              color="secondary"
              rounded="0"
              variant="elevated"
              height="56"
              :loading="props.loading"
              @click="emit('onGeneratePDF', monthIndex, daysWorked)"
            ></v-btn>
          </div>
        </v-sheet>
      </v-timeline-item>
      <v-timeline-item hide-dot></v-timeline-item>
    </v-timeline>

    <!-- Errors & Empty states -->
    <v-container style="height: 573px" v-if="props.timelineLoading || props.timelineError">
      <v-row
        align-content="center"
        class="fill-height"
        justify="center"
        v-if="props.timelineLoading"
      >
        <v-col class="text-subtitle-1 text-center" cols="12"> On récupère les sous... </v-col>
        <v-col cols="6">
          <v-progress-linear color="secondary" height="6" indeterminate rounded></v-progress-linear>
        </v-col>
      </v-row>
      <v-row align-content="center" class="fill-height" justify="center" v-if="props.timelineError">
        <v-empty-state
          icon="mdi-cash-100"
          text="Impossible de récupérer les factures. Le chemin d'accès aux factures est-il bien spécifié ?"
          title="Oups, il manque de l'argent là"
        ></v-empty-state>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.v-timeline {
  overflow-y: auto;
  max-height: 70vh;
}

.totalTTC {
  font-family: Slabo;
}
</style>
