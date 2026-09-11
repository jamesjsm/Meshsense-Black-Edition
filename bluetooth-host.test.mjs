import assert from 'node:assert/strict'
import {canProbeBluetooth} from './api/src/lib/bluetoothHost.ts'
assert.equal(canProbeBluetooth('linux',()=>[],()=>true),false)
assert.equal(canProbeBluetooth('linux',()=>['hci0'],()=>false),false)
assert.equal(canProbeBluetooth('linux',()=>{throw Error('absent')},()=>true),false)
assert.equal(canProbeBluetooth('linux',()=>['hci0'],()=>true),true)
assert.equal(canProbeBluetooth('win32',()=>{throw Error('must not inspect sysfs')}),true)
assert.equal(canProbeBluetooth('darwin',()=>{throw Error('must not inspect sysfs')}),true)
console.log('PASS: Linux no-adapter/no-bus checks; Mac and Windows discovery preserved')
