import Obniz from 'obniz'
import { App, AppInstanceType, Worker } from 'obniz-app-sdk'

const LOGTTA_CO2 = Obniz.getPartsClass('Logtta_CO2');

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

class MyWorker extends Worker<Obniz> {
  async bleScan(obniz: Obniz) {
    await obniz.ble!.scan.startOneWait({
      deviceAddress: process.env.LOGTTA_CO2_ADDRESS,
    }, {
      duration: null
    });
  }

  async onObnizConnect(obniz: Obniz) {
    await obniz.ble!.initWait();

    obniz.ble!.scan.onfind = async (p) => {
      if (LOGTTA_CO2.isAdvDevice(p)) {
        let data = LOGTTA_CO2.getData(p);
        console.log(data);

        await sleep(5000);
      }

      await this.bleScan(obniz)
    };

    await this.bleScan(obniz)
  }
}

const app = new App({
  appToken: process.env.APP_TOKEN,
  workerClass: MyWorker,
  instanceType: AppInstanceType.Master,
  obnizClass: Obniz
})

app.start();
