<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { VTreeview } from 'vuetify/labs/VTreeview'

import api from '../service/api'

const loading = ref(false)
const disabled = ref(true)
const valid = ref(false)
const clientName = ref('')
const clientAddress = ref('')
const clientSIRET = ref('')
const clientTJM = ref('')
const clientContact = ref('')
const clientEmail = ref('')
const companyAddress = ref('')
const companySIRET = ref('')
const companyTVA = ref('')
const companyIBAN = ref('')
const companyBIC = ref('')
const companyEmail = ref('')
const folderPath = ref(localStorage.getItem('clientFolderPath') || '')
const items = ref([
  {
    id: 1,
    title: '<Société>',
    file: null,
    children: [
      {
        id: 2,
        title: 'factures',
        children: [
          {
            id: 3,
            title: '<YYYYMM>-<societe>-<version>.pdf',
            file: 'file-document-outline',
          },
          {
            id: 4,
            title: '<YYYYMM>-<societe>-<version>.pdf',
            file: 'file-document-outline',
          },
        ],
      },
      {
        id: 5,
        title: 'templates',
        children: [
          { id: 6, title: 'Facture-template.docx', file: 'file-document-outline' },
          { id: 7, title: 'template.xml', file: 'file-document-outline' },
        ],
      },
    ],
  },
])

const updateClientAndCompany = () => {
  loading.value = true
  disabled.value = true
  api
    .get('/templateXML')
    .then(({ data }) => {
      clientName.value = data.client.name
      clientContact.value = data.client.contact
      clientAddress.value = data.client.address
      clientSIRET.value = data.client.siret
      clientTJM.value = data.client.tjm
      clientEmail.value = data.client.email

      companyAddress.value = data.company.address
      companyEmail.value = data.company.email
      companySIRET.value = data.company.siret
      companyTVA.value = data.company.tva
      companyIBAN.value = data.company.iban
      companyBIC.value = data.company.bic

      disabled.value = false
    })
    .catch(() => {
      disabled.value = true
    })
    .finally(() => {
      loading.value = false
    })
}

const setEnvVar = (folderPath: string) => {
  api
    .post('/env', {
      clientFolder: folderPath,
    })
    .then(() => {
      localStorage.setItem('clientFolderPath', folderPath)
      updateClientAndCompany()
    })
}

const saveTemplateXML = () => {
  loading.value = true
  disabled.value = true
  api
    .post('/templateXML', {
      client: {
        name: clientName.value,
        address: clientAddress.value.split(',')[0],
        postalCode: clientAddress.value.split(',')[1],
        city: clientAddress.value.split(',')[2],
        siret: clientSIRET.value,
        tjm: clientTJM.value,
        contact: clientContact.value,
        email: clientEmail.value,
      },
      company: {
        address: companyAddress.value.split(',')[0],
        postalCode: companyAddress.value.split(',')[1],
        city: companyAddress.value.split(',')[2],
        siret: companySIRET.value,
        tva: companyTVA.value,
        iban: companyIBAN.value,
        bic: companyBIC.value,
        email: companyEmail.value,
      },
    })
    .finally(() => {
      loading.value = false
      disabled.value = false
    })
}

onMounted(() => {
  updateClientAndCompany()
})
</script>

<template>
  <div class="pt-4">
    <v-card
      prepend-icon="mdi-cog"
      subtitle="Le chemin d'accès aux fichiers client pour paramétrer cette appli"
      class="mx-auto"
      color="primary"
    >
      <template v-slot:title>
        <span class="font-weight-black">Dossier client</span>
      </template>
      <v-card-text class="bg-surface-light pt-4">
        <v-form v-model="valid">
          <v-row>
            <v-col cols="12" md="12">
              <v-text-field v-model="folderPath" label="Chemin des fichiers" required>
                <template v-slot:append>
                  <v-tooltip>
                    <v-alert
                      text="Ce chemin correspond à l'emplacement du dossier <Société> qui aura la forme suivante : "
                      border-color="primary-darken-1"
                      variant="text"
                    >
                      <v-treeview disabled :items="items" item-value="id" open-all>
                        <template v-slot:prepend="{ item }">
                          <v-icon v-if="!item.file" color="white"> mdi-folder-open </v-icon>
                          <v-icon v-else color="white"> {{ 'mdi-' + item.file }} </v-icon>
                        </template>
                      </v-treeview>
                    </v-alert>
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" icon="mdi-information"></v-icon>
                    </template>
                  </v-tooltip>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-list-item
        append-icon="mdi-chevron-right"
        lines="two"
        subtitle="Sauvegarder"
        @click="setEnvVar(folderPath)"
        link
      ></v-list-item>
    </v-card>
  </div>
  <div class="d-flex flex-wrap justify-center ga-4 pt-5">
    <v-card
      prepend-icon="mdi-account-heart"
      subtitle="Ton amour, ta priorité"
      class="flex-grow-1 align-self-start"
      color="primary"
      :loading="loading"
      :disabled="disabled"
    >
      <template v-slot:title>
        <span class="font-weight-black">Ton client</span>
      </template>

      <v-card-text class="bg-surface-light pt-4">
        <v-form v-model="valid">
          <div class="d-flex flex-column">
            <v-text-field v-model="clientName" label="Nom du client" required></v-text-field>
            <v-text-field v-model="clientContact" label="Contact du client" required></v-text-field>
            <v-text-field v-model="clientAddress" label="Adresse du client" required></v-text-field>
            <v-text-field v-model="clientEmail" label="Email client" required></v-text-field>
            <v-text-field
              v-model="clientSIRET"
              label="Numéro SIRET du client"
              required
            ></v-text-field>
            <v-text-field v-model="clientTJM" label="Taux Journalier moyen" required></v-text-field>
          </div>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>

      <v-list-item
        append-icon="mdi-chevron-right"
        lines="two"
        subtitle="Mettre à jour"
        @click="saveTemplateXML"
        link
      ></v-list-item>
    </v-card>
    <v-card
      prepend-icon="mdi-account-tie"
      subtitle="Professionnel, toujours."
      class="flex-grow-1"
      :loading="loading"
      :disabled="disabled"
      color="primary"
    >
      <template v-slot:title>
        <span class="font-weight-black">Ton entreprise</span>
      </template>

      <v-card-text class="bg-surface-light pt-4">
        <v-form v-model="valid">
          <div class="d-flex flex-column">
            <v-text-field v-model="companyAddress" label="Ton adresse" required></v-text-field>
            <v-text-field v-model="companyEmail" label="Ton email" required></v-text-field>
            <v-text-field v-model="companySIRET" label="Ton SIRET" required></v-text-field>
            <v-text-field v-model="companyTVA" label="Ton numéro TVA" required></v-text-field>
            <v-text-field v-model="companyIBAN" label="Ton IBAN" required></v-text-field>
            <v-text-field v-model="companyBIC" label="Ton BIC" required></v-text-field>
          </div>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>

      <v-list-item
        append-icon="mdi-chevron-right"
        lines="two"
        subtitle="Mettre à jour"
        @click="saveTemplateXML"
        link
      ></v-list-item>
    </v-card>
  </div>
</template>

<style>
.v-treeview {
  background-color: transparent;
}
</style>
