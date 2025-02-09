<script setup lang="ts">
import { onMounted } from 'vue'
import factureList from '@/components/factures/facture-list.vue'
import { useGlobalStore } from '../store/global'
import { useInvoiceStore } from '../store/invoice'
import { storeToRefs } from 'pinia'
import { AppErrors } from '@/models/appErrors'

const globalStore = useGlobalStore()
const invoiceStore = useInvoiceStore()

const {
  invoices,
  timelineError,
  timelineLoading,
  generateMonthIndex,
  generateDaysWorked,
  generateFactureLoading,
} = storeToRefs(invoiceStore)
const { generatePDF, getInvoices } = invoiceStore

const generate = (monthIndex: number, daysWorked: number) => {
  generatePDF(monthIndex, daysWorked).catch((e) => {
    invoiceStore.setGenerateLoading(false)
    invoiceStore.setGenerateError(true)
    globalStore.addError(
      new AppErrors({
        name: 'Erreur lors de la génération de la facture',
        message: e.message,
      }),
    )
  })
}

const getFactures = () => {
  getInvoices().catch((e) => {
    invoiceStore.setLoading(false)
    invoiceStore.setError(true)
    globalStore.addError(
      new AppErrors({
        name: 'Erreur lors de la récupération des factures',
        message: e.message,
      }),
    )
  })
}

const downloadPDF = (filename: string) => {
  console.log(filename)
}

onMounted(() => {
  getFactures()
})
</script>

<template>
  <main class="mx-auto">
    <!-- <div class="d-flex justify-center">
      <v-sheet color="secondary" height="56px" class="w-100"></v-sheet>
    </div> -->

    <factureList
      :timelineError="timelineError"
      :timelineLoading="timelineLoading"
      :factures="invoices"
      :monthIndex="generateMonthIndex"
      :daysWorked="generateDaysWorked"
      :loading="generateFactureLoading"
      @onDownloadPDF="downloadPDF"
      @onGeneratePDF="generate"
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
