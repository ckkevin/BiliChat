import { Observable } from 'rxjs';

export class DouyuVendor {
    connect(roomid: number): Observable<any> {
        return new Observable<any>(subscriber => {

            let heartbeatHandler = null;

            const ws = new WebSocket('wss://danmuproxy.douyu.com:8502/');
            ws.binaryType = "arraybuffer";
            ws.onopen = () => {
                login(roomid);
                joinGroup(roomid);
                heartbeat();
                heartbeatHandler = setInterval(() => {
                    heartbeat();
                }, 10 * 1000);
                subscriber.next("connected successfully");
            }
            ws.onmessage = (e) => {
                bufferDecoder(e.data);
            }
            ws.close = () => {
                if (heartbeatHandler != null) {
                    clearInterval(heartbeatHandler);
                    heartbeatHandler = null;
                }
                subscriber.complete();
            }
            const UTF8TextEncoder: (input: string) => Uint8Array = typeof TextEncoder != "undefined" ? (() => {
                const fuck = (new TextEncoder());
                return fuck.encode.bind(fuck);
            })() : (input: string) => { throw new Error("还没实现"); };
            function login(roomid) {
                sendMessage(`type@=loginreq/roomid@=${roomid}/dfl@=/username@=visitor114514/uid@=1091412170/ver@=20190610/aver@=218101901/ct@=0/`);
            }

            function joinGroup(roomid) {
                sendMessage(`type@=joingroup/rid@=${roomid}/gid@=1/`);
            }

            function heartbeat() {
                sendMessage("type@=mrkl/");
            }

            function sendMessage(cmd: string) {
                sendBinaryPack(UTF8TextEncoder(cmd));
            }

            function sendBinaryPack(body: Uint8Array) {
                const head = new ArrayBuffer(12);
                const headDataView = new DataView(head);
                const contentLength = 4 + 4 + body.byteLength + 1;
                headDataView.setInt32(0, contentLength, true);
                headDataView.setInt32(4, contentLength, true);
                headDataView.setInt16(8, 689, true);
                headDataView.setInt16(10, 0, true)

                const tmp = new Uint8Array(12 + body.byteLength + 1);
                tmp.set(new Uint8Array(head), 0);
                tmp.set(body, 12);
                tmp[contentLength + 4] = 0; // end of message
                ws.send(tmp);
            }

            function bufferDecoder(buffer: Uint8Array) {
                const arr = new Uint8Array(buffer);
                const view = new DataView(arr.buffer);
                const contentPackLength = view.getInt32(0, true);
                const section = arr.slice(12, contentPackLength - 9);
                const stringk: string = new TextDecoder().decode(section);
                console.log(stringk);
            }

            return () => {

            };
        })
    }
}