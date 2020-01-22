import { Observable } from 'rxjs';
import { Taf1 as Taf, TafMx1 as TafMx, HUYA1 as HUYA, List1 as List } from './taf.js';

export class HuyaVendor {
    connect(bodyroomid: any): Observable<any> {
        return new Observable((subscriber) => {
            console.log(bodyroomid);
            const body = bodyroomid;//get info from httprequest
            const subsid_array = body.match(/var SUBSID = '(.*)';/);
            const topsid_array = body.match(/var TOPSID = '(.*)';/);
            const yyuid_array = body.match(/ayyuid: '(.*)',/);
            
            console.log(yyuid_array);
            if (!subsid_array || !topsid_array || !yyuid_array) return
            const subsid = subsid_array[1] === '' ? 0 : parseInt(subsid_array[1]);
            const topsid = topsid_array[1] === '' ? 0 : parseInt(topsid_array[1]);
            const yyuid = parseInt(yyuid_array[1]);

            let _main_user_id = new HUYA.UserId();
            _main_user_id.lUid = yyuid;;
            _main_user_id.sHuYaUA = "webh5&1.0.0&websocket";

            let heartbeatHandler = null;
            const ws = new WebSocket('ws://ws.api.huya.com');
            ws.binaryType = "arraybuffer";
            ws.onopen = async () => {
                //heartbeat
                bindWsInfo(yyuid, topsid, subsid, _main_user_id.sGuid);
                sendHeartbeat();
                heartbeatHandler = setInterval(() => {
                    sendHeartbeat();
                }, 60 * 1000);
                subscriber.next("connected successfully");
            };
            ws.onmessage = (e) => {
                let stream = new Taf.JceInputStream(e.data)
                let command = new HUYA.WebSocketCommand()
                command.readFrom(stream)
                switch (command.iCmdType) {
                    case HUYA.EWebSocketCommandType.EWSCmd_WupRsp:
                        let wup = new Taf.Wup()
                        wup.decode(command.vData.buffer)
                        let map = new (TafMx.WupMapping[wup.sFuncName])()
                        wup.readStruct('tRsp', map, TafMx.WupMapping[wup.sFuncName])
                        //this._emitter.emit(wup.sFuncName, map)
                        console.log(wup.sFuncName);
                        console.log(map);
                        break
                    case HUYA.EWebSocketCommandType.EWSCmdS2C_MsgPushReq:
                        stream = new Taf.JceInputStream(command.vData.buffer)
                        let msg = new HUYA.WSPushMessage()
                        msg.readFrom(stream)
                        stream = new Taf.JceInputStream(msg.sMsg.buffer)
                        if (TafMx.UriMapping[msg.iUri]) {
                            let map = new (TafMx.UriMapping[msg.iUri])()
                            map.readFrom(stream)
                            //this._emitter.emit(msg.iUri, map)
                            console.log(msg.iUri);
                            console.log(map);
                        }
                        break
                    default:
                        break;
                }
            };
            ws.onerror = (e) => {

            };
            ws.onclose = () => {
                if (heartbeatHandler != null) {
                    clearInterval(heartbeatHandler);
                    heartbeatHandler = null;
                }
            };

            function bindWsInfo(yyuid, topsid, subsid, sGuid) {
                let ws_user_info = new HUYA.WSUserInfo;
                ws_user_info.lUid = yyuid
                ws_user_info.bAnonymous = 0 == yyuid
                ws_user_info.sGuid = sGuid
                ws_user_info.sToken = ""
                ws_user_info.lTid = topsid
                ws_user_info.lSid = subsid
                ws_user_info.lGroupId = yyuid
                ws_user_info.lGroupType = 3
                let jce_stream = new Taf.JceOutputStream()
                ws_user_info.writeTo(jce_stream)
                let ws_command = new HUYA.WebSocketCommand()
                ws_command.iCmdType = HUYA.EWebSocketCommandType.EWSCmd_RegisterReq
                ws_command.vData = jce_stream.getBinBuffer()
                jce_stream = new Taf.JceOutputStream()
                ws_command.writeTo(jce_stream)
                ws.send(jce_stream.getBuffer())
            }

            function sendHeartbeat() {
                let req = new HUYA.UserHeartBeatReq();
                let user_id = new HUYA.UserId();
                user_id.sHuYaUA = "webh5&1.0.0&websocket";
                req.tId = user_id;
                req.lTid = topsid;
                req.lSid = subsid;
                req.lPid = yyuid;
                req.eLineType = 1;
                sendPackage("onlineui", "OnUserHeartBeat", req);
            }

            function sendPackage(action: string, callback: string, req) {
                let wup = new Taf.Wup();
                wup.setServant(action);
                wup.setFunc(callback);
                wup.writeStruct("tReq", req);
                let command = new HUYA.WebSocketCommand();
                command.iCmdType = HUYA.EWebSocketCommandType.EWSCmd_WupReq;
                command.vData = wup.encode();
                let stream = new Taf.JceOutputStream();
                command.writeTo(stream);
                ws.send(stream.getBuffer());
            }

            return () => {
                ws.close();
            }
        });
    }
}