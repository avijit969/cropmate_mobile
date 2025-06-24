import Button from '@/components/Button'
import ScreenWrapper from '@/components/ScreenWrapper'
import { ThemedText } from '@/components/ThemedText'
import { supabase } from '@/lib/supabase'
import React from 'react'
import { StyleSheet } from 'react-native'

const home = () => {
  return (
    <ScreenWrapper>
      <ThemedText>Home</ThemedText>
      <Button title='SignOut' onPress={() => {
        supabase.auth.signOut();
      }} />
    </ScreenWrapper>
  )
}

export default home

const styles = StyleSheet.create({})