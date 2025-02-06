<script setup lang="ts">
import { computed, ref, type Ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { VTreeview } from 'vuetify/labs/VTreeview'
import api from './service/api'

const route = useRoute()
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
  <RouterView />
  <v-layout>
    <v-bottom-navigation color="primary" :model-value="currentRoute">
      <v-btn to="/factures" selected-class="activeButton">
        <v-icon>mdi-cash</v-icon>
        Factures
      </v-btn>

      <v-btn :disabled="true">
        <v-icon icon="mdi-cash-register" size="x-large"></v-icon>
      </v-btn>

      <v-btn to="/devis" selected-class="activeButton">
        <v-icon>mdi-account-cash</v-icon>
        <span>Devis</span>
      </v-btn>
    </v-bottom-navigation>

    <v-dialog v-model="dialog" max-width="800" transition="dialog-bottom-transition">
      <template v-slot:activator="{ props: activatorProps }">
        <div class="d-flex fixed-container">
          <div class="d-flex w-50 mx-auto fab-container">
            <v-fab
              color="primary"
              class="ms-4"
              icon="mdi-file-cog-outline"
              location="bottom end"
              size="small"
              v-bind="activatorProps"
            ></v-fab>
          </div>
        </div>
      </template>

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
  </v-layout>
</template>

<style scoped>
.fixed-container {
  pointer-events: none;
  z-index: 1005 !important;
  bottom: 0px;
  left: 0px;
  width: 100%;
  position: fixed;
  justify-content: center;
  height: 56px;
  line-height: 1.5;
}

.fab-container {
  justify-content: end;
  align-items: flex-start;
  min-width: 390px;
}

.v-fab {
  flex: none !important;
}

.activeButton {
  background-color: rgb(var(--v-theme-secondary));
  color: rgb(var(--v-theme-on-surface-variant)) !important;
}

.v-btn--disabled {
  opacity: 1 !important;
  color: rgb(var(--v-theme-primary));
}

header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
  margin-bottom: 3rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
}

.v-treeview {
  background-color: transparent;
}
</style>
