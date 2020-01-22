import { Observable } from 'rxjs';
import { inflate } from 'pako';

export class BilibiliVendor {
    connect(roomid: number): Observable<any> {
        return new Observable((subscriber) => {
            const ws = new WebSocket('wss://broadcastlv.chat.bilibili.com/sub');
            ws.binaryType = 'arraybuffer';
            let heartbeatHandler = null;
            //let errorRetry = 0;
            ws.onopen = (e) => {
                const obj = {
                    uid: 0,
                    roomid: Number(roomid),
                    protover: 2,
                    platform: 'web',
                    clientver: '1.5.15'
                };
                sendObject(7, obj);
                heartbeatHandler = setInterval(() => {
                    sendHearbeat();
                }, 30 * 1000);
                subscriber.next("connected successfully");
            }
            ws.onmessage = (e) => {
                // ? check render?
                const packs = bufferDecoder(e.data);
                //process
            }
            ws.onerror = (e) => {
                //onerror
            }
            ws.onclose = (e) => {
                if (heartbeatHandler != null) {
                    clearInterval(heartbeatHandler);
                    heartbeatHandler = null;
                }
                subscriber.complete();
            }
            const UTF8TextEncoder: (input: string) => Uint8Array = typeof TextEncoder != "undefined" ? (new TextEncoder()).encode : (input: string) => { throw new Error("还没实现"); };
            function sendHearbeat() {
                sendBinary(2, UTF8TextEncoder('[object Object]'));
            }
            function sendObject(type: number, obj: any) {
                sendBinary(type, UTF8TextEncoder(JSON.stringify(obj)));
            }
            function sendBinary(type: number, body: Uint8Array) {
                const head = new ArrayBuffer(16);
                const headDataView = new DataView(head);
                headDataView.setInt32(0, head.byteLength + body.byteLength);
                headDataView.setInt16(4, 16);
                headDataView.setInt16(6, 1);
                headDataView.setInt32(8, type); // verify
                headDataView.setInt32(12, 1);

                const tmp = new Uint8Array(16 + body.byteLength);
                tmp.set(new Uint8Array(head), 0);
                tmp.set(body, 16);

                ws.send(tmp);
            }
            function bufferDecoder(buffer: Uint8Array): Array<any> {
                const arr = new Uint8Array(buffer);
                const view = new DataView(arr.buffer);
                const packs = [];
                let offset = 0;
                while (offset < arr.byteLength) {
                    const protocol = view.getInt16(6 + offset);
                    const type = view.getInt32(8 + offset);
                    if (type === 5) {
                        const section = arr.slice(offset + view.getInt16(4 + offset), view.getInt32(offset) + offset);
                        if (protocol === 0) {
                            packs.push(JSON.parse(new TextDecoder().decode(section)));
                        }
                        if (protocol === 2) {
                            packs.push(...bufferDecoder(inflate(section)));
                        }
                    }
                    offset += view.getInt32(offset);
                }
                return packs;
            };
            return () => {
                ws.close();
            }

        })
    }
}