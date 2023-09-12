import { Calendar } from '@/src/components/Calendar'
import {
  Container,
  TimePicker,
  TimePickerHeader,
  TimePickerItem,
  TimePickerList,
} from './styles'
import { useState } from 'react'
import dayjs from 'dayjs'
import { api } from '@/src/lib/axios'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
interface Avalaibility {
  possibleTimes: number[]
  availableTimes: number[]
}
export function CalendarStep() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null) // esse estado controla qual o dia selecionado. A funcao setSelectedDate e passado como props para o componente Calendar, que vai acionar a mudanca de dias

  const router = useRouter()
  const username = String(router.query.username)

  const isDateSelected = !!selectedDate // determina se a funcionalidade de selecao de horas esta aparecendo na tela.

  const weekDay = selectedDate ? dayjs(selectedDate).format('dddd') : null
  const describedDate = selectedDate
    ? dayjs(selectedDate).format('DD[ de ]MMMM')
    : null

  const selectedDateWhitoutTime = selectedDate
    ? dayjs(selectedDate).format('YYYY-MM-DD')
    : null

  const { data: availability } = useQuery<Avalaibility>( // hook do react para chamadas de api. Substitui o useEffect. Possui camada de cache, tornando a aplicacao mais rapida
    ['availability', selectedDateWhitoutTime],
    async () => {
      const response = await api.get(`/users/${username}/availability`, {
        params: {
          date: selectedDateWhitoutTime,
        },
      })
      return response.data
    },
    {
      enabled: !!selectedDate,
    },
  )

  return (
    <Container isTimePickerOpen={isDateSelected}>
      <Calendar selectedDate={selectedDate} onDateSelected={setSelectedDate} />

      {isDateSelected && (
        <TimePicker>
          <TimePickerHeader>
            {weekDay} <span>{describedDate}</span>
          </TimePickerHeader>
          <TimePickerList>
            {availability?.possibleTimes.map((hour) => {
              return (
                <TimePickerItem
                  key={hour}
                  disabled={!availability.availableTimes.includes(hour)}
                >
                  {String(hour).padStart(2, '0')}:00h
                </TimePickerItem>
              )
            })}
          </TimePickerList>
        </TimePicker>
      )}
    </Container>
  )
}
