import { ChakraProvider, Box, VStack, Grid, theme } from '@chakra-ui/react'
import { Pnl } from './components/pnl/Pnl'

import { ColorModeSwitcher } from './components/theme/ColorModeSwitcher'

export const App = () => (
  <ChakraProvider theme={theme}>
    <Box textAlign='center' fontSize='xl'>
      <Grid minH='100vh' p={3}>
        <ColorModeSwitcher justifySelf='flex-end' />
        <VStack spacing={8}>
          <Pnl />
        </VStack>
      </Grid>
    </Box>
  </ChakraProvider>
)
