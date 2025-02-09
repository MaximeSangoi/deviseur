<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { VTreeview } from 'vuetify/labs/VTreeview'
import api from './service/api'
import { useGlobalStore } from './store/global'
import { storeToRefs } from 'pinia'

const route = useRoute()
const globalStore = useGlobalStore()

const { appErrors } = storeToRefs(globalStore)

const snackbarMessage: Ref<string> = ref('')
const showSnackbar: Ref<boolean> = ref(false)

watch(appErrors.value, (newValue) => {
  showSnackbar.value = true
  snackbarMessage.value = newValue[0].name as string
})
const currentRoute: Ref<number> = computed(() => {
  switch (route.path) {
    case '/facture':
      return 0
    case '/devis':
      return 2
    default:
      return 0
  }
})

const dialog = ref(false)
const folderPath = ref('')
const valid = ref(false)
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
        children: [{ id: 6, title: 'input.docx', file: 'file-document-outline' }],
      },
    ],
  },
])

const setEnvVar = (folderPath: string) => {
  api.post('/env', {
    clientFolder: folderPath,
  })
}
</script>

<template>
  <v-sheet height="56" width="100vw" class="top-0 left-0 position-fixed top-bar" elevation="2">
    <div class="w-50 h-100 mx-auto d-flex align-end justify-end ga-2">
      <v-btn
        color="primary"
        icon="mdi-cog"
        size="small"
        style="top: 25px"
        @click="dialog = true"
      ></v-btn>
    </div>
  </v-sheet>
  <div class="container">
    <RouterView />
  </div>
  <v-layout>
    <v-bottom-navigation color="secondary" :model-value="currentRoute" elevation="3">
      <v-btn to="/factures" selected-class="activeButton">
        <v-icon>mdi-cash</v-icon>
        Factures
      </v-btn>

      <v-btn :disabled="true" elevation="3">
        <v-icon icon="mdi-sheep"></v-icon>
      </v-btn>

      <v-btn to="/devis" selected-class="activeButton">
        <v-icon>mdi-account-cash</v-icon>
        <span>Devis</span>
      </v-btn>
    </v-bottom-navigation>

    <v-snackbar v-model="showSnackbar" color="primary" variant="flat">
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn variant="text" icon="mdi-close" size="small" @click="showSnackbar = false"> </v-btn>
      </template>
    </v-snackbar>
  </v-layout>

  <v-dialog v-model="dialog" max-width="800" transition="dialog-bottom-transition">
    <v-card title="Configuration" append-icon="mdi-cog" color="#eee">
      <v-card-item>
        <v-form v-model="valid">
          <v-row>
            <v-col cols="12" md="12">
              <v-text-field v-model="folderPath" label="Chemin fichiers" required></v-text-field>
              <v-alert
                text="Ce chemin correspond à l'emplacement du dossier <Société> qui aura la forme suivante : "
                border-color="primary-darken-1"
                variant="text"
              >
                <v-treeview disabled :items="items" item-value="id" open-all>
                  <template v-slot:prepend="{ item }">
                    <v-icon v-if="!item.file"> mdi-folder-open </v-icon>
                    <v-icon v-else> {{ 'mdi-' + item.file }} </v-icon>
                  </template>
                </v-treeview>
              </v-alert>
            </v-col>
          </v-row>
        </v-form>
      </v-card-item>

      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>

        <v-btn text="Annuler" variant="plain" @click="dialog = false"></v-btn>
        <v-btn
          color="primary"
          text="Sauvegarder"
          variant="elevated"
          :disabled="!valid"
          @click="setEnvVar(folderPath)"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style>
.top-bar {
  z-index: 1000 !important;
}
.container {
  height: calc(100vh - 56px - 56px);
  margin-top: 56px;
}

.v-bottom-navigation {
  overflow: initial;
}

.v-btn--disabled {
  opacity: 1 !important;
  color: rgb(var(--v-theme-secondary));
  border-radius: 20px 20px 0 0 !important;
  background-color: rgb(var(--v-theme-surface)) !important;
  height: 80px !important;
  top: -15px;
  width: 100px !important;
  font-size: 1.6rem !important;
}

.v-treeview {
  background-color: transparent;
}

.v-snackbar__wrapper {
  top: -4px !important;
}
</style>
