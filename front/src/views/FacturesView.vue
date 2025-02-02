<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue'
import { useDate } from 'vuetify'
import api from '../service/api'
import type { Facture } from '@/models/facture'
import factureList from '@/components/factures/facture-list.vue'

const date = useDate()
const factures: Ref<Facture[]> = ref([])
const generateMonthIndex: Ref<number> = ref(1)
const generateDaysWorked: Ref<number> = ref(20)
const generateFactureLoading: Ref<boolean> = ref(false)
const timelineError: Ref<boolean> = ref(false)
const timelineLoading: Ref<boolean> = ref(false)

const generatePDF = async (monthIndex: number, daysWorked: number) => {
  if (monthIndex != null) {
    try {
      generateFactureLoading.value = true
      const monthIndexString = ('00' + monthIndex).slice(-2)
      const templateParameters = {
        numfacture: date.getYear(new Date()) + monthIndexString + '-FINZZLEDIGITAL-0001',
        today: date.format(new Date(), 'fullDate'),
        days: daysWorked,
        ht: daysWorked * 475,
        tva: daysWorked * 475 * 0.2,
        month: 'Janvier',
        ttc: daysWorked * 475 * 1.2,
        monthend: '31/02/2025',
      }
      const file = await api.post(
        '/generate',
        {
          templateParameters,
          monthIndex: monthIndexString,
        },
        {
          responseType: 'blob',
        },
      )
      const el = document.createElement('a')
      el.href = URL.createObjectURL(file.data)
      el.download = templateParameters.numfacture
      document.body.appendChild(el)
      el.click()
      el.remove()
      await getFactures()
      generateFactureLoading.value = false
    } catch (err) {
      generateFactureLoading.value = false
    }
  }
}

const getFactures = async () => {
  try {
    timelineLoading.value = true
    const lastFactures = (await api.get('/factures')).data.map((facture: Facture) => ({
      ...facture,
      month: date.format(facture.date, 'month').toUpperCase(),
    }))

    factures.value = lastFactures
    const lastFacture = factures.value[factures.value.length - 1]
    const lastFactureDate = new Date(lastFacture.date!)
    generateMonthIndex.value = (date.getNextMonth(lastFactureDate) as Date).getMonth() + 1
    timelineLoading.value = false
  } catch (e) {
    timelineError.value = true
    timelineLoading.value = false
  }
}

const downloadPDF = (filename: string) => {
  console.log(filename)
}

onMounted(() => {
  getFactures().catch()
})
</script>

<template>
  <main class="mx-auto">
    <div class="d-flex justify-center">
      <v-sheet color="secondary" height="56px" class="w-100"></v-sheet>
    </div>

    <factureList
      :timelineError="timelineError"
      :timelineLoading="timelineLoading"
      :factures="factures"
      :monthIndex="generateMonthIndex"
      :daysWorked="generateDaysWorked"
      :loading="generateFactureLoading"
      @onDownloadPDF="downloadPDF"
      @onGeneratePDF="generatePDF"
    ></factureList>

    <v-divider></v-divider>
    <v-card tile color="background" elevation="0" class="pa-9">
      <v-row align-content="space-around" class="ga-4">
        <v-card
          class="mx-auto"
          color="var(-v-theme--surface-variant)"
          title="Et ton activité client ?"
          width="300"
        >
          <template v-slot:prepend>
            <v-icon color="secondary" icon="mdi-account-tie"></v-icon>
          </template>
          <v-card-text>T'as pensé à faire ton CRA / valider ton temps client ?</v-card-text>
          <v-divider></v-divider>
          <v-list-item
            append-icon="mdi-chevron-right"
            lines="two"
            subtitle="Remplir le Abraxio"
            link
          ></v-list-item>
        </v-card>
        <v-card class="mx-auto" color="" title="Côté comptable" width="300">
          <template v-slot:prepend>
            <v-icon color="secondary" icon="mdi-bank"></v-icon>
          </template>
          <v-card-text>Oublie pas d'envoyer ton CA mensuel et tes frais du mois ;) </v-card-text>
          <v-divider></v-divider>
          <v-list-item
            append-icon="mdi-chevron-right"
            lines="two"
            subtitle="Envoyer à Franck"
            link
          ></v-list-item>
        </v-card>
      </v-row>
    </v-card>
  </main>
</template>

<style>
main {
  max-width: 900px;
}
</style>
