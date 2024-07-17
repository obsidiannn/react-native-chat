if (__DEV__) {
  require("./devtools/ReactotronConfig.ts")
}
import "./i18n"
import "./utils/ignoreWarnings"
import { useFonts } from "expo-font"
import React from "react"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import { useInitialRootStore } from "./models"
import { AppNavigator, useNavigationPersistence } from "./navigators"
import { ErrorBoundary } from "./screens/ErrorScreen/ErrorBoundary"
import * as storage from "./utils/storage"
import { customFontsToLoad } from "./theme"
import Config from "./config"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { ViewStyle } from "react-native"
import { RecoilRoot } from 'recoil';

export const NAVIGATION_PERSISTENCE_KEY = "Login"


interface AppProps {
  hideSplashScreen: () => Promise<boolean>
}

const App = (props: AppProps) => {
  const { hideSplashScreen } = props
  const {
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad)

  const { rehydrated } = useInitialRootStore(() => {
    setTimeout(hideSplashScreen, 500)
  })
  if (!rehydrated || !isNavigationStateRestored || (!areFontsLoaded && !fontLoadError)) {
    return null
  }
  return (
    <RecoilRoot>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ErrorBoundary catchErrors={Config.catchErrors}>
          <GestureHandlerRootView style={$container}>
            <AppNavigator />
          </GestureHandlerRootView>
        </ErrorBoundary>
      </SafeAreaProvider>
    </RecoilRoot>
  )
}

export default App

const $container: ViewStyle = {
  flex: 1,
}