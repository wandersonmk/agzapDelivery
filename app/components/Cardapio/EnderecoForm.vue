<script setup lang="ts">
import type { DadosCheckout } from '~/../../shared/types/cardapio'

const props = defineProps<{
  modelValue?: DadosCheckout['endereco']
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DadosCheckout['endereco']]
}>()

const endereco = computed({
  get: () => props.modelValue || {
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    referencia: ''
  },
  set: (value) => emit('update:modelValue', value)
})

// Formatar CEP
const formatarCep = (valor: string) => {
  const numeros = valor.replace(/\D/g, '')
  return numeros.replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9)
}

const atualizarCep = (event: Event) => {
  const input = event.target as HTMLInputElement
  const formatado = formatarCep(input.value)
  endereco.value = { ...endereco.value, cep: formatado }
}

// Buscar CEP (placeholder para futura integração com ViaCEP)
const buscandoCep = ref(false)
const buscarCep = async () => {
  const cep = endereco.value.cep.replace(/\D/g, '')
  if (cep.length !== 8) return

  buscandoCep.value = true
  try {
    // TODO: Integrar com API ViaCEP
    // const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    // const data = await response.json()
    // if (!data.erro) {
    //   endereco.value = {
    //     ...endereco.value,
    //     logradouro: data.logradouro,
    //     bairro: data.bairro,
    //     cidade: data.localidade,
    //     estado: data.uf
    //   }
    // }
    console.log('Buscar CEP:', cep)
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
  } finally {
    buscandoCep.value = false
  }
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
    <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6">
      Endereço de Entrega
    </h2>

    <div class="space-y-4">
      <!-- CEP -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          CEP *
        </label>
        <div class="flex gap-2">
          <input
            :value="endereco.cep"
            @input="atualizarCep"
            @blur="buscarCep"
            type="text"
            placeholder="00000-000"
            maxlength="9"
            class="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
          <button
            type="button"
            @click="buscarCep"
            :disabled="buscandoCep"
            class="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            {{ buscandoCep ? '...' : 'Buscar' }}
          </button>
        </div>
      </div>

      <!-- Logradouro -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rua/Avenida *
        </label>
        <input
          v-model="endereco.logradouro"
          type="text"
          placeholder="Nome da rua"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          required
        />
      </div>

      <!-- Número e Complemento -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Número *
          </label>
          <input
            v-model="endereco.numero"
            type="text"
            placeholder="Nº"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Complemento
          </label>
          <input
            v-model="endereco.complemento"
            type="text"
            placeholder="Apto, bloco..."
            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Bairro -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Bairro *
        </label>
        <input
          v-model="endereco.bairro"
          type="text"
          placeholder="Nome do bairro"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          required
        />
      </div>

      <!-- Cidade e Estado -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cidade *
          </label>
          <input
            v-model="endereco.cidade"
            type="text"
            placeholder="Cidade"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado *
          </label>
          <input
            v-model="endereco.estado"
            type="text"
            placeholder="UF"
            maxlength="2"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent uppercase"
            required
          />
        </div>
      </div>

      <!-- Ponto de Referência -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ponto de Referência
        </label>
        <input
          v-model="endereco.referencia"
          type="text"
          placeholder="Próximo ao mercado..."
          class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>
    </div>
  </div>
</template>
