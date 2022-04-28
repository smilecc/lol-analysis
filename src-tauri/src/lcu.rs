use log::{info, debug};
use regex::Regex;
use serde::Serialize;
use std::collections::HashMap;
use wmi::*;

#[derive(Clone, Debug, Serialize)]
pub struct LCUCommandInfo {
    pub process_id: u32,
    pub port: i32,
    pub token: String,
}

#[derive(Clone, Debug, Serialize)]
pub enum LCUError {
    NotFoundLCU(),
}

fn regex_match(regex: Regex, text: &String) -> String {
    if regex.is_match(text) == false {
        return "".to_string();
    }

    let mut result = "";
    if let Some(m) = regex.captures(text) {
        result = m.get(1).unwrap().as_str()
    };
    result.to_string()
}

// static mut WMI_CON: Option<&mut WMIConnection> = None;

pub fn get_client_command() -> Result<LCUCommandInfo, LCUError> {
    let wmi_con = WMIConnection::new(COMLibrary::without_security().unwrap().into()).unwrap();

    // 查询LCU进程
    let results: Vec<HashMap<String, Variant>> = match wmi_con.raw_query(
        "select CommandLine, ProcessId from Win32_Process where Name='LeagueClientUx.exe'",
    ) {
        Ok(result) => result,
        Err(_) => return Err(LCUError::NotFoundLCU()),
    };

    debug!("WMI返回 {:#?}", results);
    if results.is_empty() {
        return Err(LCUError::NotFoundLCU());
    }

    let first_result = results.first().unwrap();

    // 获取进程命令
    let command = if first_result.contains_key("CommandLine") {
        first_result.get("CommandLine").unwrap()
    } else {
        return Err(LCUError::NotFoundLCU());
    };

    let error_command_line = &String::from("");
    let command_line = match command {
        Variant::String(str) => str,
        _ => error_command_line,
    };

    if command_line.len() == 0 {
        return Err(LCUError::NotFoundLCU());
    }

    let port: i32 = regex_match(Regex::new(r"--app-port=([0-9]*)").unwrap(), command_line)
        .parse()
        .unwrap_or(0);

    let token = regex_match(
        Regex::new(r"--remoting-auth-token=([\w-]*)").unwrap(),
        command_line,
    );

    let process_id: u32 = match first_result.get("ProcessId").unwrap() {
        Variant::UI4(i) => *i,
        _ => todo!(),
    };

    let info = LCUCommandInfo { port, token, process_id };

    info!("{:#?}", info);

    Ok(info)
}
