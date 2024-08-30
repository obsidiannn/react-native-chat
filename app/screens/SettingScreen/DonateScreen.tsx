import { Button } from "app/components";
import { ScreenX } from "app/components/ScreenX";
import { ColorsState, ThemeState } from "app/stores/system";
import { s } from "app/utils/size";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useRecoilValue } from "recoil";

export const DonateScreen = () => {
    const themeColor = useRecoilValue(ColorsState)
    const [chooseIdx, setChooseIdx] = useState(0)
    const { t } = useTranslation("default")
    const btnStyle = (idx: number,) => {
        if (idx === chooseIdx) {
            return {
                backgroundColor: themeColor.primary,
                color: themeColor.textChoosed
            }
        }
        return {
            backgroundColor: themeColor.secondaryBackground,
            color: themeColor.text
        }

    }
    const $theme = useRecoilValue(ThemeState)
    return <ScreenX title={t('Donation')} theme={$theme}>
        <ScrollView style={{ flex: 1, paddingVertical: s(20) }}>
            <View style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                flex: 0.7,
                paddingHorizontal: s(12)
            }}>
                <View style={{
                    backgroundColor: themeColor.background,
                    borderRadius: s(12),
                    padding: s(12)
                }}>
                    <Text style={{
                        color: themeColor.text,
                        fontSize: s(16),
                    }}>
                        {t('donate.describe')}
                    </Text>
                    <View style={{
                        marginTop: s(46),
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Button theme={$theme} label="$5"
                            onPress={() => {
                                setChooseIdx(0)
                            }}
                            containerStyle={{
                                marginRight: s(12),
                            }} />

                        <Button theme={$theme}  label="$10"
                            onPress={() => {
                                setChooseIdx(1)
                            }}
                            containerStyle={{
                                marginRight: s(12),
                            }} />
                        <Button theme={$theme} label="$15"
                            onPress={() => {
                                setChooseIdx(2)
                            }}
                            textStyle={{ ...btnStyle(2), }}
                            containerStyle={{
                                marginRight: s(12),
                            }} />
                        <Button theme={$theme} label="$100"
                            onPress={() => {
                                setChooseIdx(3)
                            }}/>
                    </View>
                </View>

                <Button theme={$theme} label={t('Pay')} size="large"
                    fullRounded
                    containerStyle={{
                        marginTop: s(24),
                        width: '100%'
                    }} />
            </View>


            <View style={{
                flex: 1,
                marginTop: s(24),
                alignItems: 'center',
                backgroundColor: themeColor.background,
                borderTopLeftRadius: s(24),
                borderTopRightRadius: s(24),
                padding: s(12)
            }}>
                <Text style={{
                    color: themeColor.text,
                    fontSize: s(18),
                    marginVertical: s(12)
                }}>
                    {t('Donation Crypto')}
                </Text>
                <Text style={{
                    fontSize: s(14),
                    color: themeColor.text,
                }}>
                    {t('We accept donations of cryptocurrencies such as usdt, usdc, bit coin, eth, sol, etc.')}
                </Text>

                <View style={{
                    width: '100%',
                    marginTop: s(16),
                }}>
                    <View style={{
                        marginBottom: s(12),
                        backgroundColor: themeColor.secondaryBackground,
                        padding: s(12),
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: s(12)
                    }}>
                        <View style={{
                            width: '80%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <Text style={{
                                fontSize: s(16),
                                color: themeColor.text,

                            }}>{t('ETH Address')}</Text>
                            <Text style={{
                                color: themeColor.secondaryText,
                                fontSize: s(12), marginTop: s(4),
                                flexWrap: 'wrap'
                            }}>0x6D85d7Ea27fF9e243724c2133BD7F8CD149Be98A</Text>
                        </View>
                        <Button label={t('Copy')} type="primary" theme={$theme} />

                    </View>
                    <View style={{
                        marginBottom: s(12),
                        backgroundColor: themeColor.secondaryBackground,
                        padding: s(12),
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: s(12)
                    }}>
                        <View style={{
                            width: '80%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <Text style={{
                                color: themeColor.text,
                                fontSize: s(16)
                            }}>{t('ETH Address')}</Text>
                            <Text style={{
                                color: themeColor.secondaryText,
                                fontSize: s(12), marginTop: s(4),
                                flexWrap: 'wrap'
                            }}>0x6D85d7Ea27fF9e243724c2133BD7F8CD149Be98A</Text>
                        </View>
                        <Button label={t('Copy')} type="primary" theme={$theme} />

                    </View>
                    <View style={{
                        marginBottom: s(12),
                        backgroundColor: themeColor.secondaryBackground,
                        padding: s(12),
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: s(12)
                    }}>
                        <View style={{
                            width: '80%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <Text style={{
                                color: themeColor.text,
                                fontSize: s(16)
                            }}>{t('ETH Address')}</Text>
                            <Text style={{
                                color: themeColor.secondaryText,
                                fontSize: s(12), marginTop: s(4),
                                flexWrap: 'wrap'
                            }}>0x6D85d7Ea27fF9e243724c2133BD7F8CD149Be98A</Text>
                        </View>
                        <Button label={t('Copy')} type="primary" theme={$theme} />

                    </View>
                    <View style={{
                        marginBottom: s(12),
                        backgroundColor: themeColor.secondaryBackground,
                        padding: s(12),
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: s(12)
                    }}>
                        <View style={{
                            width: '80%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <Text style={{
                                color: themeColor.text,
                                fontSize: s(16)
                            }}>{t('ETH Address')}</Text>
                            <Text style={{
                                color: themeColor.secondaryText,
                                fontSize: s(12), marginTop: s(4),
                                flexWrap: 'wrap'
                            }}>0x6D85d7Ea27fF9e243724c2133BD7F8CD149Be98A</Text>
                        </View>
                        <Button label={t('Copy')} type="primary" theme={$theme} />
                    </View>
                </View>
            </View>
        </ScrollView>
    </ScreenX>
}
