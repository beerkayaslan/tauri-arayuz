import { useEffect, useState } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

interface UpdateInfo {
  version: string;
  body?: string;
}

export function Updater() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkForUpdates();
  }, []);

  async function checkForUpdates() {
    try {
      const update = await check();
      if (update) {
        setUpdateAvailable(true);
        setUpdateInfo({
          version: update.version,
          body: update.body,
        });
      }
    } catch (e) {
      console.error("Güncelleme kontrolü hatası:", e);
      setError(String(e));
    }
  }

  async function downloadAndInstall() {
    try {
      setDownloading(true);
      setError(null);

      const update = await check();
      if (!update) return;

      // İndirme progress'ini takip et
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            console.log(
              "İndirme başladı, toplam boyut:",
              event.data.contentLength
            );
            break;
          case "Progress": {
            const downloaded = event.data.chunkLength;
            setProgress((prev) => prev + downloaded);
            break;
          }
          case "Finished":
            console.log("İndirme tamamlandı");
            break;
        }
      });

      // Güncelleme tamamlandı, uygulamayı yeniden başlat
      await relaunch();
    } catch (e) {
      console.error("Güncelleme hatası:", e);
      setError(String(e));
      setDownloading(false);
    }
  }

  if (error) {
    return (
      <div className="updater error">
        <p>⚠️ Güncelleme hatası: {error}</p>
        <button onClick={() => setError(null)}>Kapat</button>
      </div>
    );
  }

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="updater">
      <div className="update-banner">
        <h3>🎉 Yeni Güncelleme Mevcut!</h3>
        <p>Versiyon: {updateInfo?.version}</p>
        {updateInfo?.body && (
          <div className="update-notes">
            <p>{updateInfo.body}</p>
          </div>
        )}

        {downloading ? (
          <div className="download-progress">
            <p>İndiriliyor... {Math.round(progress / 1024)} KB</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "100%" }}></div>
            </div>
          </div>
        ) : (
          <div className="update-actions">
            <button onClick={downloadAndInstall} className="update-btn">
              Güncelle ve Yeniden Başlat
            </button>
            <button
              onClick={() => setUpdateAvailable(false)}
              className="skip-btn"
            >
              Daha Sonra
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
