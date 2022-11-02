import {
  Box,
  Button,
  Input,
  Select,
  useToast,
  VStack,
  Center,
  Wrap,
  WrapItem,
  Spinner,
} from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import { AxisOptions, Chart } from 'react-charts'
import { PnlClient, PnlData, PnlPeriod, PnlStep } from './pnl-client'

interface IPnlData {
  address: string
  step: PnlStep
  period: PnlPeriod
  frames: PnlData | undefined
}

const initialState: IPnlData = {
  address: '0xbdfa4f4492dd7b7cf211209c4791af8d52bf5c50',
  step: '1D',
  period: '1M',
  frames: undefined,
}

type PnlFrameData = {
  date: Date
  usd: number
}

type Series = {
  label: string
  data: PnlFrameData[]
}

const duration = (t1: Date, t2: Date): number => Math.round((Number(t2) - Number(t1)) / 1000)

export const Pnl = () => {
  const pnlClient = new PnlClient()

  const [pnlFormData, setPnlFormData] = useState<IPnlData>(initialState)
  const [pnlSeries, setPnlSeries] = useState<Series[]>([
    {
      label: `${initialState.address} PNL`,
      data: [{ date: new Date(), usd: 0 }],
    },
  ])
  const [isFetching, setFetch] = useState<boolean>(false)

  const toast = useToast()

  useEffect(() => {
    if (!pnlFormData.frames && !isFetching) {
      fetchPnl(pnlFormData.address, pnlFormData.step, pnlFormData.period)
    }
  })

  function pnlDataToSeries(pnlData: PnlData): PnlFrameData[] {
    return Object.entries(pnlData).map(([key, usd]) => ({
      date: new Date(Number(key) * 1000),
      usd,
    }))
  }

  async function fetchPnl(address: string, step: PnlStep, period: PnlPeriod): Promise<void> {
    let pnlData: PnlData | undefined
    // update form state
    setPnlFormData({ address, step, period, frames: undefined })

    setFetch(true)

    const startTime = new Date()
    let endTime: Date

    try {
      pnlData = await pnlClient.getPnl(address, step, period)
      setFetch(false)
    } catch (error) {
      setFetch(false)

      endTime = new Date()
      console.error(error)

      toast({
        title: `Fetch PNL error. ${duration(startTime, endTime)}sec`,
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
    }

    if (!pnlData) return

    endTime = new Date()

    toast({
      title: `${address} Step: ${step} Period: ${period} ${duration(startTime, endTime)} sec`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    // update state
    setPnlFormData({ address, step, period, frames: pnlData })
    setPnlSeries([{ label: `${address} PNL`, data: pnlDataToSeries(pnlData) }])
  }

  const primaryAxis = React.useMemo(
    (): AxisOptions<PnlFrameData> => ({
      getValue: (datum) => datum.date,
      scaleType: 'time',
    }),
    [],
  )

  const secondaryAxes = React.useMemo(
    (): AxisOptions<PnlFrameData>[] => [
      {
        getValue: (datum) => datum.usd,
        elementType: 'area',
        showDatumElements: true,
      },
    ],
    [],
  )

  return (
    <VStack w='100%' h='100%'>
      <Box w='100%' h='70%' borderWidth='1px' borderRadius='lg'>
        <Chart
          options={{
            data: pnlSeries,
            primaryAxis,
            secondaryAxes,
          }}
        />
      </Box>
      <Box w='100%' h='30%' p={3}>
        <Wrap>
          <WrapItem>
            <Box p={2} display='flex' alignItems='baseline' fontSize='md'>
              PNL step
            </Box>
            <Center w='120px'>
              {/* '1h' | '1D' | '1W' | '1M' */}
              <Select
                placeholder='Step'
                onChange={(element) =>
                  setPnlFormData({ ...pnlFormData, step: element.target.value as PnlStep })
                }
              >
                <option value='1h'>Hour</option>
                <option value='1D'>Day</option>
                <option value='1W'>Week</option>
                <option value='1M'>Month</option>
              </Select>
            </Center>
          </WrapItem>
          <WrapItem>
            <Box p={2} display='flex' alignItems='baseline' fontSize='md'>
              PNL period
            </Box>
            <Center w='120px'>
              {/* '1M' | '2M' | '3M' | '4M' | '5M' | '6M' | '1Y' | '2Y' | 'ALL' */}
              <Select
                placeholder='Period'
                onChange={(element) =>
                  setPnlFormData({ ...pnlFormData, period: element.target.value as PnlPeriod })
                }
              >
                <option value='1M'>1M</option>
                <option value='2M'>2M</option>
                <option value='3M'>3M</option>
                <option value='4M'>4M</option>
                <option value='5M'>5M</option>
                <option value='6M'>6M</option>
                <option value='1Y'>1Y</option>
                <option value='2Y'>2Y</option>
                <option value='ALL'>ALL</option>
              </Select>
            </Center>
          </WrapItem>
          <WrapItem>
            <Box p={2} display='flex' alignItems='baseline' fontSize='md'>
              Address
            </Box>
            <Center w='420px'>
              <Input
                size='md'
                placeholder={pnlFormData.address}
                onChange={(element) =>
                  setPnlFormData({ ...pnlFormData, address: element.target.value })
                }
              />
            </Center>
          </WrapItem>
          <WrapItem>
            <Center w='120px'>
              <Button
                variant='solid'
                colorScheme='blue'
                size='md'
                onClick={() => fetchPnl(pnlFormData.address, pnlFormData.step, pnlFormData.period)}
              >
                {' '}
                Update PNL
              </Button>
            </Center>
          </WrapItem>
          <WrapItem>
            <Center w='40px'>{isFetching ? <Spinner /> : ''}</Center>
          </WrapItem>
        </Wrap>
      </Box>
    </VStack>
  )
}
