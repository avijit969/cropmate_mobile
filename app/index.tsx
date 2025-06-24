import Loading from '@/components/Loading'
import { StyleSheet, View } from 'react-native'

const index = () => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>
      <Loading />
    </View>
  )
}

export default index

const styles = StyleSheet.create({})