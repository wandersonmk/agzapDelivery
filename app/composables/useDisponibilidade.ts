import type { Categoria, DiaSemana } from '@shared/types/cardapio.types'

export const useDisponibilidade = () => {
  /**
   * Converte uma string de horário "HH:mm" para minutos desde 00:00
   */
  const converterHoraParaMinutos = (hora?: string): number => {
    if (!hora) return 0
    const [horas, minutos] = hora.split(':').map(Number)
    return (horas || 0) * 60 + (minutos || 0)
  }

  /**
   * Obtém o dia da semana atual em português
   */
  const getDiaSemanaAtual = (): DiaSemana => {
    const dias: DiaSemana[] = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
    return dias[new Date().getDay()] as DiaSemana
  }

  /**
   * Obtém o horário atual em minutos desde 00:00
   */
  const getHorarioAtualEmMinutos = (): number => {
    const agora = new Date()
    return agora.getHours() * 60 + agora.getMinutes()
  }

  /**
   * Verifica se a categoria está disponível no momento atual
   */
  const categoriaDisponivelAgora = (categoria: Categoria): boolean => {
    // Se não tem configuração de disponibilidade, está sempre disponível
    if (!categoria.dias_disponiveis) return true

    // Modo "sempre" está sempre disponível
    if (categoria.dias_disponiveis.modo === 'sempre') return true

    const diaAtual = getDiaSemanaAtual()
    const horaAtual = getHorarioAtualEmMinutos()

    // Filtrar regras do dia atual
    const regrasHoje = categoria.dias_disponiveis.regras.filter(r => r.dia === diaAtual)

    // Se não há regras para hoje, não está disponível
    if (regrasHoje.length === 0) return false

    // Se alguma regra não tem horário definido, está disponível o dia todo
    const semHorario = regrasHoje.find(r => !r.horario_inicio && !r.horario_fim)
    if (semHorario) return true

    // Verificar se está dentro de algum horário configurado
    return regrasHoje.some(regra => {
      if (!regra.horario_inicio || !regra.horario_fim) return true

      const inicio = converterHoraParaMinutos(regra.horario_inicio)
      const fim = converterHoraParaMinutos(regra.horario_fim)

      // Tratar horários que passam da meia-noite (ex: 22:00 às 02:00)
      if (fim < inicio) {
        return horaAtual >= inicio || horaAtual <= fim
      }

      return horaAtual >= inicio && horaAtual <= fim
    })
  }

  /**
   * Retorna uma descrição textual da disponibilidade da categoria
   */
  const getDescricaoDisponibilidade = (categoria: Categoria): string => {
    if (!categoria.dias_disponiveis || categoria.dias_disponiveis.modo === 'sempre') {
      return 'Disponível todos os dias'
    }

    const diasNomes: Record<DiaSemana, string> = {
      domingo: 'Domingo',
      segunda: 'Segunda',
      terca: 'Terça',
      quarta: 'Quarta',
      quinta: 'Quinta',
      sexta: 'Sexta',
      sabado: 'Sábado'
    }

    const diasUnicos = [...new Set(categoria.dias_disponiveis.regras.map(r => r.dia))]
    const diasTexto = diasUnicos.map(d => diasNomes[d]).join(', ')

    return `Disponível: ${diasTexto}`
  }

  /**
   * Verifica se uma categoria tem horários restritos (não é 24h)
   */
  const temHorariosRestritos = (categoria: Categoria): boolean => {
    if (!categoria.dias_disponiveis || categoria.dias_disponiveis.modo === 'sempre') {
      return false
    }

    return categoria.dias_disponiveis.regras.some(r => r.horario_inicio || r.horario_fim)
  }

  return {
    categoriaDisponivelAgora,
    getDescricaoDisponibilidade,
    temHorariosRestritos,
    getDiaSemanaAtual,
    converterHoraParaMinutos,
    getHorarioAtualEmMinutos
  }
}
