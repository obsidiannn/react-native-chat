import { StackScreenProps } from "@react-navigation/stack";
import { Button } from "app/components";
import Navbar from "app/components/Navbar";
import { ColorsState } from "app/stores/system";
import { s } from "app/utils/size";
import { Text } from "react-native";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useRecoilValue } from "recoil";
import { App } from "types/app";

type Props = StackScreenProps<App.StackParamList, 'DonateScreen'>;
export const DonateScreen = (props: Props) => {
    const themeColor = useRecoilValue(ColorsState)
    return <View style={{
        flex: 1,
        backgroundColor: themeColor.background
    }}>
        <Navbar title="捐赠" />
        <View style={{
            padding: s(24), alignItems: 'center', display: 'flex', flexDirection: 'column',
            flex: 1,
        }}>
            <Text style={{
                color: themeColor.text,
                fontSize: s(16),

            }}>
                Hi! We're Cara, and we're a group of volunteers working on a new social media and portfolio platform for artists and art enthusiasts.
            </Text>
            <View style={{
                marginTop: s(46),
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <Button label="$5" size="large"
                    containerStyle={{
                        backgroundColor: themeColor.primary, marginRight: s(12)
                    }} />

                <Button label="$10" size="large" containerStyle={{
                    backgroundColor: themeColor.primary, marginRight: s(12)
                }} />
                <Button label="$15" size="large" containerStyle={{
                    backgroundColor: themeColor.primary, marginRight: s(12)
                }} />
                <Button label="$100" size="large" containerStyle={{
                    backgroundColor: themeColor.primary,
                }} />
            </View>
            <Button label="$100" size="large" containerStyle={{
                backgroundColor: themeColor.primary,
                marginTop: s(24),
                width: '80%'
            }} />

            <View style={{
                marginTop: s(24), alignItems: 'center'
            }}>
                <Text style={{
                    fontSize: s(18),
                    marginVertical: s(12)
                }}>捐赠加密货币
                </Text>
                <Text>我们接受USDT、USDC、bit coin、eth、sol等加密货币的捐赠</Text>
            </View>

            <View style={{
                width: '100%',
                marginTop: s(16)
            }}>
                <View style={{
                    marginBottom: s(12)
                }}>
                    <View style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',

                    }}>
                        <Text style={{
                            fontSize: s(16)
                        }}>以太坊地址</Text>
                        <TouchableOpacity><Text>复制</Text></TouchableOpacity>
                    </View>
                    <Text style={{
                        fontSize: s(12), marginTop: s(4)
                    }}>0x6D85d7Ea27fF9e243724c2133BD7F8CD149Be98A</Text>
                </View>
                <View style={{
                    marginBottom: s(12)
                }}>
                    <View style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',

                    }}>
                        <Text style={{
                            fontSize: s(16)
                        }}>以太坊地址</Text>
                        <TouchableOpacity><Text>复制</Text></TouchableOpacity>
                    </View>
                    <Text style={{
                        fontSize: s(12), marginTop: s(4)
                    }}>0x6D85d7Ea27fF9e243724c2133BD7F8CD149Be98A</Text>
                </View>
                <View style={{
                    marginBottom: s(12)
                }}>
                    <View style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',

                    }}>
                        <Text style={{
                            fontSize: s(16)
                        }}>以太坊地址</Text>
                        <TouchableOpacity><Text>复制</Text></TouchableOpacity>
                    </View>
                    <Text style={{
                        fontSize: s(12), marginTop: s(4)
                    }}>0x6D85d7Ea27fF9e243724c2133BD7F8CD149Be98A</Text>
                </View>
                <View style={{
                    marginBottom: s(12)
                }}>
                    <View style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',

                    }}>
                        <Text style={{
                            fontSize: s(16)
                        }}>以太坊地址</Text>
                        <TouchableOpacity><Text>复制</Text></TouchableOpacity>
                    </View>
                    <Text style={{
                        fontSize: s(12), marginTop: s(4)
                    }}>0x6D85d7Ea27fF9e243724c2133BD7F8CD149Be98A</Text>
                </View>

            </View>

        </View>
    </View>
}