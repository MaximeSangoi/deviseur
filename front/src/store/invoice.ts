import { Facture } from '@/models/facture';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useDate } from 'vuetify';
import api from '../service/api'

export const useInvoiceStore = defineStore('invoice', () => {
    const date = useDate();

    const invoices = ref<Facture[]>([]);
    const timelineError = ref<boolean>(false);
    const timelineLoading = ref<boolean>(false);
    const generateMonthIndex = ref(1)
    const generateDaysWorked = ref(20)
    const generateFactureLoading = ref(false)
    const generateFactureError = ref(false)

    const generatePDF = async (monthIndex: number, daysWorked: number) => {
        if (monthIndex != null) {
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
            await getInvoices()
            generateFactureLoading.value = false
        }
      }

    const getInvoices = async () => {
        timelineLoading.value = true;
        const newInvoices = (await api.get('/factures')).data

        invoices.value = newInvoices.map((facture: Facture) => ({
            ...facture,
            month: date.format(facture.date, 'month').toUpperCase(),
        }));
        const lastFacture = invoices.value[invoices.value.length - 1]
        generateMonthIndex.value =
          (date.getNextMonth(new Date(lastFacture.date!)) as Date).getMonth() + 1
        timelineLoading.value = false
    }

    const setLoading = (loading: boolean) => {
        timelineLoading.value = loading
    }

    const setError = (hasError: boolean) => {
        timelineError.value = hasError
    }

    const setGenerateLoading = (loading: boolean) => {
        generateFactureLoading.value = loading
    }

    const setGenerateError = (hasError: boolean) => {
        generateFactureError.value = hasError
    }

    return {
        invoices,
        generateMonthIndex,
        generateDaysWorked,
        generateFactureLoading,
        generateFactureError,
        timelineError,
        timelineLoading,
        generatePDF,
        getInvoices,
        setError,
        setLoading,
        setGenerateLoading,
        setGenerateError,
    };
});