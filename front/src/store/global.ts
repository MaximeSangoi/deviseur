import { AppErrors } from '@/models/appErrors';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useGlobalStore = defineStore('global', () => {

    const appErrors = ref<AppErrors[]>([]);

    const addError = (error: AppErrors) =>  {
        appErrors.value.push(error);
    }

    const clearErrors = () =>  {
        appErrors.value = [];
    }

    return {
        appErrors,
        addError,
        clearErrors,
    };
});