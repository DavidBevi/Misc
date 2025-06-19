"D:\WATG\Cargo.toml"
```
[package]
name = "WATG"
version = "0.1.0"
edition = "2024"

[dependencies]
tauri = { version = "2.0.0", features = ["tray-icon", "shell-open", "window-close"] }
tauri-plugin-positioner = "2.0"
tauri-plugin-store = "2.0"
tauri-plugin-window-state = "2.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

[build-dependencies]
tauri-build = "2.0"

[[bin]]
name = "WATG"
path = "src/main.rs"
```



"D:\WATG\src\main.rs"
```
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{collections::HashMap, fs};
use std::path::PathBuf;
use tauri::{
    CustomMenuItem, SystemTray, SystemTrayEvent, Manager, AppHandle, WindowBuilder,
    Wry,
};
use tauri_plugin_store::{StoreBuilder, StoreCollection};
use tauri_plugin_window_state::Builder as WindowStateBuilder;
use serde::{Deserialize};

#[derive(Deserialize)]
struct ZoomPayload {
    id: String,
    zoom: f64,
}

#[derive(Deserialize)]
struct LoadPayload {
    id: String,
}

fn main() {
    tauri::Builder::default()
        .plugin(WindowStateBuilder::default().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let _ = WindowBuilder::new(
                app,
                "main",
                tauri::WindowUrl::App("index.html".into()),
            )
            .title("WATG")
            .build();
            Ok(())
        })
        .system_tray(setup_tray())
        .on_system_tray_event(handle_tray)
        .invoke_handler(tauri::generate_handler![save_zoom, load_zoom])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}

fn setup_tray() -> SystemTray {
    let show = CustomMenuItem::new("toggle".to_string(), "Show/Hide");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit app");
    let tray_menu = tauri::SystemTrayMenu::new().add_item(show).add_item(quit);
    SystemTray::new().with_menu(tray_menu)
}

fn handle_tray(app: &AppHandle<Wry>, event: SystemTrayEvent) {
    if let SystemTrayEvent::MenuItemClick { id, .. } = event {
        match id.as_str() {
            "toggle" => {
                let win = app.get_window("main").unwrap();
                if win.is_visible().unwrap() {
                    win.hide().unwrap();
                } else {
                    win.show().unwrap();
                    win.set_focus().unwrap();
                }
            }
            "quit" => {
                std::process::exit(0);
            }
            _ => {}
        }
    }
}

#[tauri::command]
fn save_zoom(app: AppHandle, id: String, zoom: f64) -> Result<(), String> {
    let store_path = app.path_resolver()
        .app_config_dir()
        .ok_or("No config dir")?
        .join("zoom.store");

    let mut store = StoreBuilder::new(store_path.clone()).build();
    store.insert(id, zoom).map_err(|e| e.to_string())?;
    store.save(store_path).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_zoom(app: AppHandle, id: String) -> Result<Option<f64>, String> {
    let store_path = app.path_resolver()
        .app_config_dir()
        .ok_or("No config dir")?
        .join("zoom.store");

    if !store_path.exists() {
        return Ok(None);
    }

    let mut store = StoreBuilder::new(store_path.clone()).build();
    store.load().map_err(|e| e.to_string())?;
    match store.get(&id) {
        Some(val) => val.as_f64().ok_or("Not a float".into()).map(Some),
        None => Ok(None),
    }
}
```


"D:\WATG\index.html"
```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>WATG</title>
    <style>
      body { margin: 0; overflow: hidden; }
      #tabs { display: flex; height: 100vh; flex-direction: column; }
      #tab-buttons { display: flex; }
      #tab-buttons button {
        flex: 1;
        padding: 1em;
        font-size: 1em;
        cursor: pointer;
      }
      #views { flex: 1; position: relative; }
      webview {
        position: absolute;
        width: 100%;
        height: 100%;
        border: none;
        display: none;
      }
      webview.active { display: block; }
    </style>
  </head>
  <body>
    <div id="tabs">
      <div id="tab-buttons">
        <button onclick="switchTab('wa')">Whatsapp</button>
        <button onclick="switchTab('tg')">Telegram</button>
      </div>
      <div id="views">
        <webview id="wa" src="https://web.whatsapp.com" class="active"></webview>
        <webview id="tg" src="https://web.telegram.org"></webview>
      </div>
    </div>
    <script>
      function switchTab(id) {
        document.querySelectorAll('webview').forEach(wv => wv.classList.remove('active'));
        document.getElementById(id).classList.add('active');
      }

      const zoomStore = {};
      document.addEventListener('keydown', (e) => {
        const active = document.querySelector('webview.active');
        const id = active.id;
        zoomStore[id] = zoomStore[id] ?? 1.0;

        if (e.ctrlKey) {
          if (['-', '=', '+'].includes(e.key)) {
            e.preventDefault();
            zoomStore[id] += (e.key === '-') ? -0.1 : 0.1;
            zoomStore[id] = Math.max(0.1, Math.min(zoomStore[id], 3.0));
            active.setZoomFactor(zoomStore[id]);
            window.__TAURI__.invoke('save_zoom', { id, zoom: zoomStore[id] });
          }
        }
      });

      window.addEventListener('DOMContentLoaded', async () => {
        const ids = ['wa', 'tg'];
        for (const id of ids) {
          const zoom = await window.__TAURI__.invoke('load_zoom', { id });
          if (zoom) {
            zoomStore[id] = zoom;
            document.getElementById(id).addEventListener('dom-ready', () => {
              document.getElementById(id).setZoomFactor(zoom);
            });
          }
        }
      });
    </script>
  </body>
</html>
```



"D:\WATG\src-tauri\Cargo.toml"
```
[package]
name = "app"
version = "0.1.0"
description = "A Tauri App"
authors = ["you"]
license = ""
repository = ""
edition = "2021"
rust-version = "1.77.2"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

# ▼ NOT NEEDED ANYMORE IN TAURI2 according to chatgpt
# [lib] 
# name = "app_lib"
# crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2.2.0", features = [] }

[dependencies]
serde_json = "1.0"
serde = { version = "1.0", features = ["derive"] }
log = "0.4"
tauri = { version = "2.5.0", features = [] }
tauri-plugin-log = "2.0.0-rc"
``` 



"D:\WATG\src-tauri\tauri.conf.json"
```
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "WATG",
  "version": "0.1.0",
  "identifier": "com.your.watg",
  "build": {},
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "WATG",
        "width": 1024,
        "height": 768,
        "resizable": true,
        "fullscreen": false,
        "url": "index.html",
        "skipTaskbar": false
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/icon.ico"
    ]
  }
}
```


Console:
```
D:\WATG>cargo clean
     Removed 0 files

D:\WATG>cargo tauri dev
     Running DevCommand (`cargo  run --no-default-features --color always --`)
        Info Watching D:\WATG\src-tauri for changes...
   Compiling serde_derive v1.0.219
   Compiling zerovec-derive v0.11.1
   Compiling displaydoc v0.2.5
   Compiling zerofrom-derive v0.1.6
   Compiling yoke-derive v0.8.0
   Compiling thiserror-impl v2.0.12
   Compiling proc-macro-hack v0.5.20+deprecated
   Compiling cssparser-macros v0.6.1
   Compiling derive_more v0.99.20
   Compiling darling_macro v0.20.11
   Compiling unic-char-range v0.9.0
   Compiling thiserror v1.0.69
   Compiling thin-slice v0.1.1
error: linking with `rust-lld` failed: exit code: 1
  |
  = note: "rust-lld" "-flavor" "gnu" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustck8PJFX\\list.def" "--dynamicbase" "--disable-auto-image-base" "-m" "i386pep" "--high-entropy-va" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained\\dllcrt2.o" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsbegin.o" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustck8PJFX\\symbols.o" "<2 object files omitted>" "D:\\WATG\\src-tauri\\target\\debug\\deps\\darling_macro-a7aebcd527d807a4.2glap9f6lyem0eu7hs3yh18bs.rcgu.rmeta" "<1 object files omitted>" "-Bstatic" "D:\\WATG\\src-tauri\\target\\debug\\deps/{libdarling_core-af79eeb10aa38849.rlib,libstrsim-a17d9e4f193cd93c.rlib,libfnv-70a500e822530206.rlib,libident_case-3ccbd76135922753.rlib,libsyn-3cd2291dfc477a9c.rlib,libquote-1fbfa083aab3e3d1.rlib,libproc_macro2-384037bd613fa7f4.rlib,libunicode_ident-a92a9d4b0c49f45e.rlib}.rlib" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib/{libproc_macro-*,libstd-*,libpanic_unwind-*,libobject-*,libmemchr-*,libaddr2line-*,libgimli-*,libwindows_targets-*,librustc_demangle-*,libstd_detect-*,libhashbrown-*,librustc_std_workspace_alloc-*,libminiz_oxide-*,libadler2-*,libunwind-*,libcfg_if-*,liblibc-*,liballoc-*,librustc_std_workspace_core-*,libcore-*,libcompiler_builtins-*}.rlib" "-Bdynamic" "-lkernel32" "-lkernel32" "-lntdll" "-luserenv" "-lws2_32" "-ldbghelp" "-lgcc_eh" "-l:libpthread.a" "-lmsvcrt" "-lmingwex" "-lmingw32" "-lgcc" "-lmsvcrt" "-lmingwex" "-luser32" "-lkernel32" "--nxcompat" "-L" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained" "-o" "D:\\WATG\\src-tauri\\target\\debug\\deps\\darling_macro-a7aebcd527d807a4.dll" "--gc-sections" "-shared" "--out-implib=D:\\WATG\\src-tauri\\target\\debug\\deps\\libdarling_macro-a7aebcd527d807a4.dll.a" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsend.o"
  = note: some arguments are omitted. use `--verbose` to show all linker arguments
  = note: rust-lld: error: <root>: undefined symbol: _DllMainCRTStartup␍


error: could not compile `darling_macro` (lib) due to 1 previous error
warning: build failed, waiting for other jobs to finish...
error: linking with `rust-lld` failed: exit code: 1
  |
  = note: "rust-lld" "-flavor" "gnu" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustc24g1BV\\list.def" "--dynamicbase" "--disable-auto-image-base" "-m" "i386pep" "--high-entropy-va" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained\\dllcrt2.o" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsbegin.o" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustc24g1BV\\symbols.o" "<2 object files omitted>" "D:\\WATG\\src-tauri\\target\\debug\\deps\\cssparser_macros-954f786fb14c8a8c.3wzmp4st5juloty2y2gegq8np.rcgu.rmeta" "<1 object files omitted>" "-Bstatic" "D:\\WATG\\src-tauri\\target\\debug\\deps/{libsyn-3cd2291dfc477a9c.rlib,libquote-1fbfa083aab3e3d1.rlib,libproc_macro2-384037bd613fa7f4.rlib,libunicode_ident-a92a9d4b0c49f45e.rlib}.rlib" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib/{libproc_macro-*,libstd-*,libpanic_unwind-*,libobject-*,libmemchr-*,libaddr2line-*,libgimli-*,libwindows_targets-*,librustc_demangle-*,libstd_detect-*,libhashbrown-*,librustc_std_workspace_alloc-*,libminiz_oxide-*,libadler2-*,libunwind-*,libcfg_if-*,liblibc-*,liballoc-*,librustc_std_workspace_core-*,libcore-*,libcompiler_builtins-*}.rlib" "-Bdynamic" "-lkernel32" "-lkernel32" "-lntdll" "-luserenv" "-lws2_32" "-ldbghelp" "-lgcc_eh" "-l:libpthread.a" "-lmsvcrt" "-lmingwex" "-lmingw32" "-lgcc" "-lmsvcrt" "-lmingwex" "-luser32" "-lkernel32" "--nxcompat" "-L" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained" "-o" "D:\\WATG\\src-tauri\\target\\debug\\deps\\cssparser_macros-954f786fb14c8a8c.dll" "--gc-sections" "-shared" "--out-implib=D:\\WATG\\src-tauri\\target\\debug\\deps\\libcssparser_macros-954f786fb14c8a8c.dll.a" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsend.o"
  = note: some arguments are omitted. use `--verbose` to show all linker arguments
  = note: rust-lld: error: <root>: undefined symbol: _DllMainCRTStartup␍


error: could not compile `cssparser-macros` (lib) due to 1 previous error
error: linking with `rust-lld` failed: exit code: 1
  |
  = note: "rust-lld" "-flavor" "gnu" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustcyVOZgn\\list.def" "--dynamicbase" "--disable-auto-image-base" "-m" "i386pep" "--high-entropy-va" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained\\dllcrt2.o" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsbegin.o" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustcyVOZgn\\symbols.o" "<8 object files omitted>" "D:\\WATG\\src-tauri\\target\\debug\\deps\\displaydoc-302ff96f74babfa7.5ms6scf4i17a6njye6y5lblxb.rcgu.rmeta" "<1 object files omitted>" "-Bstatic" "D:\\WATG\\src-tauri\\target\\debug\\deps/{libsyn-3cd2291dfc477a9c.rlib,libquote-1fbfa083aab3e3d1.rlib,libproc_macro2-384037bd613fa7f4.rlib,libunicode_ident-a92a9d4b0c49f45e.rlib}.rlib" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib/{libproc_macro-*,libstd-*,libpanic_unwind-*,libobject-*,libmemchr-*,libaddr2line-*,libgimli-*,libwindows_targets-*,librustc_demangle-*,libstd_detect-*,libhashbrown-*,librustc_std_workspace_alloc-*,libminiz_oxide-*,libadler2-*,libunwind-*,libcfg_if-*,liblibc-*,liballoc-*,librustc_std_workspace_core-*,libcore-*,libcompiler_builtins-*}.rlib" "-Bdynamic" "-lkernel32" "-lkernel32" "-lntdll" "-luserenv" "-lws2_32" "-ldbghelp" "-lgcc_eh" "-l:libpthread.a" "-lmsvcrt" "-lmingwex" "-lmingw32" "-lgcc" "-lmsvcrt" "-lmingwex" "-luser32" "-lkernel32" "--nxcompat" "-L" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained" "-o" "D:\\WATG\\src-tauri\\target\\debug\\deps\\displaydoc-302ff96f74babfa7.dll" "--gc-sections" "-shared" "--out-implib=D:\\WATG\\src-tauri\\target\\debug\\deps\\libdisplaydoc-302ff96f74babfa7.dll.a" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsend.o"
  = note: some arguments are omitted. use `--verbose` to show all linker arguments
  = note: rust-lld: error: <root>: undefined symbol: _DllMainCRTStartup␍


error: could not compile `displaydoc` (lib) due to 1 previous error
error: linking with `rust-lld` failed: exit code: 1
  |
  = note: "rust-lld" "-flavor" "gnu" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustcLD9L6y\\list.def" "--dynamicbase" "--disable-auto-image-base" "-m" "i386pep" "--high-entropy-va" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained\\dllcrt2.o" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsbegin.o" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustcLD9L6y\\symbols.o" "<5 object files omitted>" "D:\\WATG\\src-tauri\\target\\debug\\deps\\proc_macro_hack-e8f221ffbe9180fd.8jxcorequxza9pmw5hz2pp58x.rcgu.rmeta" "<1 object files omitted>" "-Bstatic" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib/{libproc_macro-*,libstd-*,libpanic_unwind-*,libobject-*,libmemchr-*,libaddr2line-*,libgimli-*,libwindows_targets-*,librustc_demangle-*,libstd_detect-*,libhashbrown-*,librustc_std_workspace_alloc-*,libminiz_oxide-*,libadler2-*,libunwind-*,libcfg_if-*,liblibc-*,liballoc-*,librustc_std_workspace_core-*,libcore-*,libcompiler_builtins-*}.rlib" "-Bdynamic" "-lkernel32" "-lkernel32" "-lntdll" "-luserenv" "-lws2_32" "-ldbghelp" "-lgcc_eh" "-l:libpthread.a" "-lmsvcrt" "-lmingwex" "-lmingw32" "-lgcc" "-lmsvcrt" "-lmingwex" "-luser32" "-lkernel32" "--nxcompat" "-L" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained" "-o" "D:\\WATG\\src-tauri\\target\\debug\\deps\\proc_macro_hack-e8f221ffbe9180fd.dll" "--gc-sections" "-shared" "--out-implib=D:\\WATG\\src-tauri\\target\\debug\\deps\\libproc_macro_hack-e8f221ffbe9180fd.dll.a" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsend.o"
  = note: some arguments are omitted. use `--verbose` to show all linker arguments
  = note: rust-lld: error: <root>: undefined symbol: _DllMainCRTStartup␍


error: could not compile `proc-macro-hack` (lib) due to 1 previous error
error: linking with `rust-lld` failed: exit code: 1
  |
  = note: "rust-lld" "-flavor" "gnu" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustcnHR6Cy\\list.def" "--dynamicbase" "--disable-auto-image-base" "-m" "i386pep" "--high-entropy-va" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained\\dllcrt2.o" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsbegin.o" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustcnHR6Cy\\symbols.o" "<12 object files omitted>" "D:\\WATG\\src-tauri\\target\\debug\\deps\\yoke_derive-99b80dad15cfa4c7.55rpcxtu23ks5gssm7ala3nbu.rcgu.rmeta" "<1 object files omitted>" "-Bstatic" "D:\\WATG\\src-tauri\\target\\debug\\deps/{libsynstructure-d59bdaf21f603e0c.rlib,libsyn-3cd2291dfc477a9c.rlib,libquote-1fbfa083aab3e3d1.rlib,libproc_macro2-384037bd613fa7f4.rlib,libunicode_ident-a92a9d4b0c49f45e.rlib}.rlib" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib/{libproc_macro-*,libstd-*,libpanic_unwind-*,libobject-*,libmemchr-*,libaddr2line-*,libgimli-*,libwindows_targets-*,librustc_demangle-*,libstd_detect-*,libhashbrown-*,librustc_std_workspace_alloc-*,libminiz_oxide-*,libadler2-*,libunwind-*,libcfg_if-*,liblibc-*,liballoc-*,librustc_std_workspace_core-*,libcore-*,libcompiler_builtins-*}.rlib" "-Bdynamic" "-lkernel32" "-lkernel32" "-lntdll" "-luserenv" "-lws2_32" "-ldbghelp" "-lgcc_eh" "-l:libpthread.a" "-lmsvcrt" "-lmingwex" "-lmingw32" "-lgcc" "-lmsvcrt" "-lmingwex" "-luser32" "-lkernel32" "--nxcompat" "-L" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained" "-o" "D:\\WATG\\src-tauri\\target\\debug\\deps\\yoke_derive-99b80dad15cfa4c7.dll" "--gc-sections" "-shared" "--out-implib=D:\\WATG\\src-tauri\\target\\debug\\deps\\libyoke_derive-99b80dad15cfa4c7.dll.a" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsend.o"
  = note: some arguments are omitted. use `--verbose` to show all linker arguments
  = note: rust-lld: error: <root>: undefined symbol: _DllMainCRTStartup␍


error: could not compile `yoke-derive` (lib) due to 1 previous error
error: linking with `rust-lld` failed: exit code: 1
  |
  = note: "rust-lld" "-flavor" "gnu" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustcIB9HMc\\list.def" "--dynamicbase" "--disable-auto-image-base" "-m" "i386pep" "--high-entropy-va" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained\\dllcrt2.o" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsbegin.o" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustcIB9HMc\\symbols.o" "<10 object files omitted>" "D:\\WATG\\src-tauri\\target\\debug\\deps\\zerovec_derive-410a12a743d6d390.bzpx45d7gyu445jgjilkqjftj.rcgu.rmeta" "<1 object files omitted>" "-Bstatic" "D:\\WATG\\src-tauri\\target\\debug\\deps/{libsyn-3cd2291dfc477a9c.rlib,libquote-1fbfa083aab3e3d1.rlib,libproc_macro2-384037bd613fa7f4.rlib,libunicode_ident-a92a9d4b0c49f45e.rlib}.rlib" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib/{libproc_macro-*,libstd-*,libpanic_unwind-*,libobject-*,libmemchr-*,libaddr2line-*,libgimli-*,libwindows_targets-*,librustc_demangle-*,libstd_detect-*,libhashbrown-*,librustc_std_workspace_alloc-*,libminiz_oxide-*,libadler2-*,libunwind-*,libcfg_if-*,liblibc-*,liballoc-*,librustc_std_workspace_core-*,libcore-*,libcompiler_builtins-*}.rlib" "-Bdynamic" "-lkernel32" "-lkernel32" "-lntdll" "-luserenv" "-lws2_32" "-ldbghelp" "-lgcc_eh" "-l:libpthread.a" "-lmsvcrt" "-lmingwex" "-lmingw32" "-lgcc" "-lmsvcrt" "-lmingwex" "-luser32" "-lkernel32" "--nxcompat" "-L" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained" "-o" "D:\\WATG\\src-tauri\\target\\debug\\deps\\zerovec_derive-410a12a743d6d390.dll" "--gc-sections" "-shared" "--out-implib=D:\\WATG\\src-tauri\\target\\debug\\deps\\libzerovec_derive-410a12a743d6d390.dll.a" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsend.o"
  = note: some arguments are omitted. use `--verbose` to show all linker arguments
  = note: rust-lld: error: <root>: undefined symbol: _DllMainCRTStartup␍


error: could not compile `zerovec-derive` (lib) due to 1 previous error
error: linking with `rust-lld` failed: exit code: 1
  |
  = note: "rust-lld" "-flavor" "gnu" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustcsc5zjj\\list.def" "--dynamicbase" "--disable-auto-image-base" "-m" "i386pep" "--high-entropy-va" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained\\dllcrt2.o" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsbegin.o" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustcsc5zjj\\symbols.o" "<13 object files omitted>" "D:\\WATG\\src-tauri\\target\\debug\\deps\\zerofrom_derive-726b813046e21dab.3luf4war9gedzevse57nbqfzk.rcgu.rmeta" "<1 object files omitted>" "-Bstatic" "D:\\WATG\\src-tauri\\target\\debug\\deps/{libsynstructure-d59bdaf21f603e0c.rlib,libsyn-3cd2291dfc477a9c.rlib,libquote-1fbfa083aab3e3d1.rlib,libproc_macro2-384037bd613fa7f4.rlib,libunicode_ident-a92a9d4b0c49f45e.rlib}.rlib" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib/{libproc_macro-*,libstd-*,libpanic_unwind-*,libobject-*,libmemchr-*,libaddr2line-*,libgimli-*,libwindows_targets-*,librustc_demangle-*,libstd_detect-*,libhashbrown-*,librustc_std_workspace_alloc-*,libminiz_oxide-*,libadler2-*,libunwind-*,libcfg_if-*,liblibc-*,liballoc-*,librustc_std_workspace_core-*,libcore-*,libcompiler_builtins-*}.rlib" "-Bdynamic" "-lkernel32" "-lkernel32" "-lntdll" "-luserenv" "-lws2_32" "-ldbghelp" "-lgcc_eh" "-l:libpthread.a" "-lmsvcrt" "-lmingwex" "-lmingw32" "-lgcc" "-lmsvcrt" "-lmingwex" "-luser32" "-lkernel32" "--nxcompat" "-L" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained" "-o" "D:\\WATG\\src-tauri\\target\\debug\\deps\\zerofrom_derive-726b813046e21dab.dll" "--gc-sections" "-shared" "--out-implib=D:\\WATG\\src-tauri\\target\\debug\\deps\\libzerofrom_derive-726b813046e21dab.dll.a" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsend.o"
  = note: some arguments are omitted. use `--verbose` to show all linker arguments
  = note: rust-lld: error: <root>: undefined symbol: _DllMainCRTStartup␍


error: could not compile `zerofrom-derive` (lib) due to 1 previous error
error: linking with `rust-lld` failed: exit code: 1
  |
  = note: "rust-lld" "-flavor" "gnu" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustcAf4KnE\\list.def" "--dynamicbase" "--disable-auto-image-base" "-m" "i386pep" "--high-entropy-va" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained\\dllcrt2.o" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsbegin.o" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustcAf4KnE\\symbols.o" "<16 object files omitted>" "D:\\WATG\\src-tauri\\target\\debug\\deps\\thiserror_impl-76e160b6e4e626e6.b3pr1wue3nfgwq3p1jndy0tv6.rcgu.rmeta" "<1 object files omitted>" "-Bstatic" "D:\\WATG\\src-tauri\\target\\debug\\deps/{libsyn-3cd2291dfc477a9c.rlib,libquote-1fbfa083aab3e3d1.rlib,libproc_macro2-384037bd613fa7f4.rlib,libunicode_ident-a92a9d4b0c49f45e.rlib}.rlib" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib/{libproc_macro-*,libstd-*,libpanic_unwind-*,libobject-*,libmemchr-*,libaddr2line-*,libgimli-*,libwindows_targets-*,librustc_demangle-*,libstd_detect-*,libhashbrown-*,librustc_std_workspace_alloc-*,libminiz_oxide-*,libadler2-*,libunwind-*,libcfg_if-*,liblibc-*,liballoc-*,librustc_std_workspace_core-*,libcore-*,libcompiler_builtins-*}.rlib" "-Bdynamic" "-lkernel32" "-lkernel32" "-lntdll" "-luserenv" "-lws2_32" "-ldbghelp" "-lgcc_eh" "-l:libpthread.a" "-lmsvcrt" "-lmingwex" "-lmingw32" "-lgcc" "-lmsvcrt" "-lmingwex" "-luser32" "-lkernel32" "--nxcompat" "-L" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained" "-o" "D:\\WATG\\src-tauri\\target\\debug\\deps\\thiserror_impl-76e160b6e4e626e6.dll" "--gc-sections" "-shared" "--out-implib=D:\\WATG\\src-tauri\\target\\debug\\deps\\libthiserror_impl-76e160b6e4e626e6.dll.a" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsend.o"
  = note: some arguments are omitted. use `--verbose` to show all linker arguments
  = note: rust-lld: error: <root>: undefined symbol: _DllMainCRTStartup␍


error: could not compile `thiserror-impl` (lib) due to 1 previous error
error: linking with `rust-lld` failed: exit code: 1
  |
  = note: "rust-lld" "-flavor" "gnu" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustcLP0rXK\\list.def" "--dynamicbase" "--disable-auto-image-base" "-m" "i386pep" "--high-entropy-va" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained\\dllcrt2.o" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsbegin.o" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustcLP0rXK\\symbols.o" "<16 object files omitted>" "D:\\WATG\\src-tauri\\target\\debug\\deps\\derive_more-22bc94b13f491d55.8zcv5d04rxqb93df1cmznuhno.rcgu.rmeta" "<1 object files omitted>" "-Bstatic" "D:\\WATG\\src-tauri\\target\\debug\\deps/{libconvert_case-07f194ddddf8693f.rlib,libsyn-3cd2291dfc477a9c.rlib,libquote-1fbfa083aab3e3d1.rlib,libproc_macro2-384037bd613fa7f4.rlib,libunicode_ident-a92a9d4b0c49f45e.rlib}.rlib" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib/{libproc_macro-*,libstd-*,libpanic_unwind-*,libobject-*,libmemchr-*,libaddr2line-*,libgimli-*,libwindows_targets-*,librustc_demangle-*,libstd_detect-*,libhashbrown-*,librustc_std_workspace_alloc-*,libminiz_oxide-*,libadler2-*,libunwind-*,libcfg_if-*,liblibc-*,liballoc-*,librustc_std_workspace_core-*,libcore-*,libcompiler_builtins-*}.rlib" "-Bdynamic" "-lkernel32" "-lkernel32" "-lntdll" "-luserenv" "-lws2_32" "-ldbghelp" "-lgcc_eh" "-l:libpthread.a" "-lmsvcrt" "-lmingwex" "-lmingw32" "-lgcc" "-lmsvcrt" "-lmingwex" "-luser32" "-lkernel32" "--nxcompat" "-L" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained" "-o" "D:\\WATG\\src-tauri\\target\\debug\\deps\\derive_more-22bc94b13f491d55.dll" "--gc-sections" "-shared" "--out-implib=D:\\WATG\\src-tauri\\target\\debug\\deps\\libderive_more-22bc94b13f491d55.dll.a" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsend.o"
  = note: some arguments are omitted. use `--verbose` to show all linker arguments
  = note: rust-lld: error: <root>: undefined symbol: _DllMainCRTStartup␍


error: could not compile `derive_more` (lib) due to 1 previous error
error: linking with `rust-lld` failed: exit code: 1
  |
  = note: "rust-lld" "-flavor" "gnu" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustcBc483H\\list.def" "--dynamicbase" "--disable-auto-image-base" "-m" "i386pep" "--high-entropy-va" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained\\dllcrt2.o" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsbegin.o" "C:\\Users\\Utente\\AppData\\Local\\Temp\\rustcBc483H\\symbols.o" "<16 object files omitted>" "D:\\WATG\\src-tauri\\target\\debug\\deps\\serde_derive-4c234d7d28ebe085.11k9uc3rooai86igveqkf5gwn.rcgu.rmeta" "<1 object files omitted>" "-Bstatic" "D:\\WATG\\src-tauri\\target\\debug\\deps/{libsyn-3cd2291dfc477a9c.rlib,libquote-1fbfa083aab3e3d1.rlib,libproc_macro2-384037bd613fa7f4.rlib,libunicode_ident-a92a9d4b0c49f45e.rlib}.rlib" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib/{libproc_macro-*,libstd-*,libpanic_unwind-*,libobject-*,libmemchr-*,libaddr2line-*,libgimli-*,libwindows_targets-*,librustc_demangle-*,libstd_detect-*,libhashbrown-*,librustc_std_workspace_alloc-*,libminiz_oxide-*,libadler2-*,libunwind-*,libcfg_if-*,liblibc-*,liballoc-*,librustc_std_workspace_core-*,libcore-*,libcompiler_builtins-*}.rlib" "-Bdynamic" "-lkernel32" "-lkernel32" "-lntdll" "-luserenv" "-lws2_32" "-ldbghelp" "-lgcc_eh" "-l:libpthread.a" "-lmsvcrt" "-lmingwex" "-lmingw32" "-lgcc" "-lmsvcrt" "-lmingwex" "-luser32" "-lkernel32" "--nxcompat" "-L" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\self-contained" "-o" "D:\\WATG\\src-tauri\\target\\debug\\deps\\serde_derive-4c234d7d28ebe085.dll" "--gc-sections" "-shared" "--out-implib=D:\\WATG\\src-tauri\\target\\debug\\deps\\libserde_derive-4c234d7d28ebe085.dll.a" "<sysroot>\\lib\\rustlib\\x86_64-pc-windows-gnu\\lib\\rsend.o"
  = note: some arguments are omitted. use `--verbose` to show all linker arguments
  = note: rust-lld: error: <root>: undefined symbol: _DllMainCRTStartup␍


error: could not compile `serde_derive` (lib) due to 1 previous error
``` 
