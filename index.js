import { install } from 'react-native-quick-crypto';

install();
import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);