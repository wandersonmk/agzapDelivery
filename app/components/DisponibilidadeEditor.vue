<template>
  <div class="space-y-4">
    <!-- Toggle: Sempre disponível vs Dias específicos -->
    <div class="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
      <div>
        <label class="text-sm font-medium text-foreground">Disponibilidade</label>
        <p class="text-xs text-muted-foreground">
          {{ modelValue.modo === 'sempre' ? 'Sempre disponível' : 'Disponível em dias/horários específicos' }}
        </p>
      </div>
      <button
        type="button"
        @click="toggleModo"
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
        :class="modelValue.modo === 'sempre' ? 'bg-primary' : 'bg-border'"
      >
        <span
          class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          :class="modelValue.modo === 'sempre' ? 'translate-x-6' : 'translate-x-1'"
        ></span>
      </button>
    </div>

    <!-- Editor de dias específicos -->
    <div v-if="modelValue.modo === 'dias_especificos'" class="space-y-3">
      <p class="text-sm text-muted-foreground">
        Selecione os dias da semana e horários em que esta categoria estará disponível:
      </p>

      <!-- Lista de dias da semana -->
      <div 
        v-for="dia in diasDaSemana" 
        :key="dia.value"
        class="border border-border rounded-lg overflow-hidden"
      >
        <!-- Checkbox do dia -->
        <div 
          class="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/10 transition-colors"
          :class="{ 'bg-muted/20': diaEstaSelecionado(dia.value) }"
          @click="toggleDia(dia.value)"
        >
          <div class="flex items-center gap-3">
            <div 
              class="w-5 h-5 border-2 rounded flex items-center justify-center transition-colors"
              :class="diaEstaSelecionado(dia.value) 
                ? 'border-primary bg-primary' 
                : 'border-muted-foreground'"
            >
              <font-awesome-icon 
                v-if="diaEstaSelecionado(dia.value)"
                icon="check" 
                class="w-3 h-3 text-primary-foreground" 
              />
            </div>
            <span class="text-sm font-medium text-foreground">{{ dia.label }}</span>
          </div>

          <!-- Indicador de horários -->
          <div v-if="diaEstaSelecionado(dia.value)" class="flex items-center gap-2 text-xs text-muted-foreground">
            <font-awesome-icon icon="clock" class="w-3 h-3" />
            <span>{{ getDescricaoHorarios(dia.value) }}</span>
          </div>
        </div>

        <!-- Editor de horários (expansível) -->
        <div 
          v-if="diaEstaSelecionado(dia.value)"
          class="border-t border-border bg-muted/5 p-3 space-y-2"
        >
          <div 
            v-for="(regra, index) in getRegrasDoDia(dia.value)" 
            :key="index"
            class="flex items-center gap-2"
          >
            <!-- Horário início -->
            <div class="flex-1">
              <label class="block text-xs text-muted-foreground mb-1">Início</label>
              <input
                type="time"
                v-model="regra.horario_inicio"
                @change="validarHorarios(dia.value, index)"
                class="w-full px-2 py-1.5 text-sm bg-input border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <!-- Horário fim -->
            <div class="flex-1">
              <label class="block text-xs text-muted-foreground mb-1">Fim</label>
              <input
                type="time"
                v-model="regra.horario_fim"
                @change="validarHorarios(dia.value, index)"
                class="w-full px-2 py-1.5 text-sm bg-input border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <!-- Botão remover horário -->
            <button
              v-if="getRegrasDoDia(dia.value).length > 1"
              type="button"
              @click="removerHorario(dia.value, index)"
              class="mt-5 p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
              title="Remover horário"
            >
              <font-awesome-icon icon="trash" class="w-3 h-3" />
            </button>
          </div>

          <!-- Botão adicionar novo horário -->
          <button
            type="button"
            @click="adicionarHorario(dia.value)"
            class="w-full py-2 text-sm text-primary hover:bg-primary/10 rounded transition-colors flex items-center justify-center gap-2"
          >
            <font-awesome-icon icon="plus" class="w-3 h-3" />
            <span>Adicionar outro horário</span>
          </button>

          <!-- Nota sobre todo o dia -->
          <p class="text-xs text-muted-foreground italic">
            💡 Deixe os horários em branco para disponibilizar o dia inteiro
          </p>
        </div>
      </div>

      <!-- Mensagem se nenhum dia selecionado -->
      <div 
        v-if="modelValue.regras.length === 0"
        class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-600"
      >
        <font-awesome-icon icon="exclamation-triangle" class="w-4 h-4 mr-2" />
        Nenhum dia selecionado. Esta categoria não estará disponível.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DisponibilidadeCategoria, DiaSemana, RegraDisponibilidade } from '@shared/types/cardapio.types'

interface Props {
  modelValue: DisponibilidadeCategoria
}

interface Emits {
  'update:modelValue': [value: DisponibilidadeCategoria]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Lista de dias da semana
const diasDaSemana = [
  { value: 'domingo' as DiaSemana, label: 'Domingo' },
  { value: 'segunda' as DiaSemana, label: 'Segunda-feira' },
  { value: 'terca' as DiaSemana, label: 'Terça-feira' },
  { value: 'quarta' as DiaSemana, label: 'Quarta-feira' },
  { value: 'quinta' as DiaSemana, label: 'Quinta-feira' },
  { value: 'sexta' as DiaSemana, label: 'Sexta-feira' },
  { value: 'sabado' as DiaSemana, label: 'Sábado' }
]

// Toggle entre "sempre" e "dias_especificos"
const toggleModo = () => {
  const novoModo = props.modelValue.modo === 'sempre' ? 'dias_especificos' : 'sempre'
  
  emit('update:modelValue', {
    modo: novoModo,
    regras: novoModo === 'sempre' ? [] : props.modelValue.regras
  })
}

// Verifica se um dia está selecionado
const diaEstaSelecionado = (dia: DiaSemana): boolean => {
  return props.modelValue.regras.some(r => r.dia === dia)
}

// Retorna todas as regras de um dia específico
const getRegrasDoDia = (dia: DiaSemana): RegraDisponibilidade[] => {
  return props.modelValue.regras.filter(r => r.dia === dia)
}

// Retorna descrição dos horários de um dia
const getDescricaoHorarios = (dia: DiaSemana): string => {
  const regras = getRegrasDoDia(dia)
  
  if (regras.length === 0) return 'Todo o dia'
  
  const horarios = regras.map(r => {
    if (!r.horario_inicio && !r.horario_fim) return 'Todo o dia'
    if (!r.horario_inicio) return `até ${r.horario_fim}`
    if (!r.horario_fim) return `a partir de ${r.horario_inicio}`
    return `${r.horario_inicio} - ${r.horario_fim}`
  })
  
  return horarios.join(', ')
}

// Toggle seleção de um dia
const toggleDia = (dia: DiaSemana) => {
  const novasRegras = [...props.modelValue.regras]
  
  if (diaEstaSelecionado(dia)) {
    // Remove todas as regras deste dia
    const regrasFiltradas = novasRegras.filter(r => r.dia !== dia)
    emit('update:modelValue', { ...props.modelValue, regras: regrasFiltradas })
  } else {
    // Adiciona uma regra para este dia (horário vazio = todo o dia)
    novasRegras.push({
      dia,
      horario_inicio: undefined,
      horario_fim: undefined
    })
    emit('update:modelValue', { ...props.modelValue, regras: novasRegras })
  }
}

// Adiciona um novo horário para um dia
const adicionarHorario = (dia: DiaSemana) => {
  const novasRegras = [...props.modelValue.regras]
  novasRegras.push({
    dia,
    horario_inicio: undefined,
    horario_fim: undefined
  })
  emit('update:modelValue', { ...props.modelValue, regras: novasRegras })
}

// Remove um horário específico
const removerHorario = (dia: DiaSemana, index: number) => {
  const regrasDoDia = getRegrasDoDia(dia)
  const regrasOutrosDias = props.modelValue.regras.filter(r => r.dia !== dia)
  
  // Remove o horário específico
  regrasDoDia.splice(index, 1)
  
  // Se não sobrou nenhum horário, remove o dia completamente
  const novasRegras = regrasDoDia.length > 0 
    ? [...regrasOutrosDias, ...regrasDoDia]
    : regrasOutrosDias
  
  emit('update:modelValue', { ...props.modelValue, regras: novasRegras })
}

// Valida horários (opcional: pode adicionar lógica de validação)
const validarHorarios = (dia: DiaSemana, index: number) => {
  // Aqui você pode adicionar validações customizadas se necessário
  // Por exemplo: verificar se horário_inicio < horario_fim
  // Por enquanto, apenas emite o update
  emit('update:modelValue', { ...props.modelValue })
}
</script>
