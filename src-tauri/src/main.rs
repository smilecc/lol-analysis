#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::thread;

use lcu::LCUCommandInfo;
use log::{debug, info, warn};
use tauri::Manager;
use websocket::{native_tls, ClientBuilder, OwnedMessage};

mod lcu;
mod logger;

fn main() -> () {
    logger::init_logger();

    tauri::Builder::default()
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            let main_window_ = main_window.clone();

            // 加载LCU命令行信息
            main_window.listen("load-lcu-command", move |_event| {
                let lcu_info = match lcu::get_client_command() {
                    Ok(info) => info,
                    Err(err) => {
                        match err {
                            lcu::LCUError::NotFoundLCU() => {
                                warn!("找不到联盟客户端")
                            }
                        }
                        LCUCommandInfo {
                            port: 0,
                            token: "".to_string(),
                            process_id: 0,
                        }
                    }
                };

                main_window_.emit_all("lcu-command-info", lcu_info).unwrap();
            });

            // 监听LCU事件
            let main_window_ = main_window.clone();
            main_window.listen("listen-ws", move |event| {
                println!("{}", event.payload().unwrap());

                let payload = event.payload().unwrap();
                let attrs: Vec<&str> = payload.split(',').collect();
                let port = attrs.get(0).unwrap().to_string();
                let auth = attrs.get(1).unwrap().to_string();

                println!("{} {:#?}", port, attrs);
                let ws_host = format!("wss://127.0.0.1:{}", port);

                let window = main_window_.clone();

                thread::spawn(move || {
                    let ssl_config = native_tls::TlsConnector::builder()
                        // 忽略证书错误
                        .danger_accept_invalid_certs(true)
                        .build()
                        .unwrap();

                    // 构造请求头
                    let mut custom_headers = websocket::header::Headers::new();
                    custom_headers.set(websocket::header::Authorization(auth.clone()));

                    // 构造WS客户端
                    let mut client = ClientBuilder::new(&ws_host)
                        .unwrap()
                        .custom_headers(&custom_headers)
                        .connect_secure(Some(ssl_config))
                        .unwrap();

                    info!("开始WS队列监听 Host: {} Token: {}", ws_host, auth);

                    let _ = client
                        .send_message(&OwnedMessage::Text("[5, \"OnJsonApiEvent\"]".to_owned()));
                    for message in client.incoming_messages() {
                        debug!("WS收到消息 {:?}", message);
                        let message = match message {
                            Ok(m) => m,
                            Err(e) => {
                                warn!("WS队列错误 {:?}", e);
                                break;
                            }
                        };
                        match message {
                            OwnedMessage::Text(t) => {
                                // 下发消息给窗口
                                window.emit_all("on-ws", t).unwrap();
                            }
                            // Say what we received
                            _ => warn!("WS队列数据解析错误"),
                        }
                    }

                    info!("WS监听线程结束");
                });
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
