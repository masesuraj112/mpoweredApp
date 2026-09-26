// Native build: polyfill a synchronous localStorage backed by SQLite.
import 'expo-sqlite/localStorage/install'

export const authStorage = localStorage
