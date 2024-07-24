import "./i18n"
import "./utils/ignoreWarnings"
import React from "react"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import { AppNavigator, useNavigationPersistence } from "./navigators"
import { ErrorBoundary } from "./screens/ErrorScreen/ErrorBoundary"
import * as storage from "./utils/storage"
import Config from "./config"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { ViewStyle } from "react-native"
import { RecoilRoot } from 'recoil';
import { SocketProvider } from "app/components/socket"

export const NAVIGATION_PERSISTENCE_KEY = "Login"


interface AppProps {
  hideSplashScreen: () => Promise<boolean>
}

const App = (props: AppProps) => {
  const { hideSplashScreen } = props
  const {
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)



  if (!isNavigationStateRestored) {
    return null
  }
  return (
    <RecoilRoot>
      <SocketProvider>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <ErrorBoundary catchErrors={Config.catchErrors}>
            <GestureHandlerRootView style={$container}>
              <AppNavigator />
            </GestureHandlerRootView>
          </ErrorBoundary>
        </SafeAreaProvider>
      </SocketProvider>
    </RecoilRoot>
  )
}

export default App

const $container: ViewStyle = {
  flex: 1,
}