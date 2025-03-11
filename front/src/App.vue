<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'
import { RouterView } from 'vue-router'
import { useGlobalStore } from './store/global'
import { storeToRefs } from 'pinia'

const globalStore = useGlobalStore()

const { appErrors } = storeToRefs(globalStore)

const snackbarMessage: Ref<string> = ref('')
const showSnackbar: Ref<boolean> = ref(false)

watch(appErrors.value, (newValue) => {
  showSnackbar.value = true
  snackbarMessage.value = newValue[0].name as string
})
</script>

<template>
  <v-sheet height="56" width="100vw" class="top-0 left-0 position-fixed top-bar" elevation="2">
  </v-sheet>
  <div class="container">
    <RouterView />
  </div>
  <v-layout>
    <v-bottom-navigation color="secondary" elevation="3">
      <v-btn to="/template" selected-class="activeButton">
        <v-icon>mdi-file-code-outline</v-icon>
        Template
      </v-btn>
      <v-btn to="/factures" selected-class="activeButton">
        <v-icon>mdi-cash</v-icon>
        Factures
      </v-btn>

      <v-btn :disabled="true" elevation="3">
        <v-icon icon="mdi-sheep"></v-icon>
      </v-btn>

      <v-btn to="/devis" selected-class="activeButton">
        <v-icon>mdi-calendar-end</v-icon>
        <span>Devis</span>
      </v-btn>
      <v-btn to="/compta" selected-class="activeButton">
        <v-icon>mdi-account-cash</v-icon>
        <span>Compta</span>
      </v-btn>
    </v-bottom-navigation>

    <v-snackbar v-model="showSnackbar" color="primary" variant="flat">
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn variant="text" icon="mdi-close" size="small" @click="showSnackbar = false"> </v-btn>
      </template>
    </v-snackbar>
  </v-layout>
</template>

<style>
.top-bar {
  z-index: 1000 !important;
}
.container {
  margin-bottom: 40px;
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

.v-snackbar__wrapper {
  top: -4px !important;
}
</style>
