# BLE Connection State Diagram

`BLEService` wraps `react-native-ble-plx`. `isManagerReady` becomes `true`
on the first `onStateChange` callback (PoweredOn **or** PoweredOff) so the
UI can show a "Bluetooth off" message rather than a blank screen.

```mermaid
stateDiagram-v2
    [*] --> Unknown : BleManager instantiated\nonStateChange registered

    Unknown --> PoweredOff : onStateChange(PoweredOff)\nisManagerReady = true
    Unknown --> PoweredOn  : onStateChange(PoweredOn)\nisManagerReady = true

    PoweredOff --> PoweredOn : user enables Bluetooth

    state PoweredOn {
        [*] --> Idle

        Idle --> Scanning : startScan(onDeviceFound)
        Scanning --> Idle : stopScan()

        Idle --> Connected : connectToDevice(deviceId)
        Scanning --> Connected : connectToDevice(deviceId)\n(scan auto-stopped)

        Connected --> Idle : disconnectDevice()\nOR device.onDisconnected fires\nconnectedDevice = null
    }

    PoweredOn --> PoweredOff : user disables Bluetooth
    PoweredOn --> Destroyed  : destroy()
    PoweredOff --> Destroyed : destroy()
    Destroyed --> [*]
```

## Key fields per state

| State | `connectedDevice` | `isManagerReady` |
|---|---|---|
| Unknown | null | false |
| PoweredOff | null | true |
| Idle | null | true |
| Scanning | null | true |
| Connected | `Device` instance | true |
| Destroyed | null | false |
