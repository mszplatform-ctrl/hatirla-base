// ------------------------------------------------------
// MSZ Lite — FINAL v1 (XOTIJI Base Edition)
// Minimalist Yapay Zeka Yorumlayıcı & Hafif Hafıza Motoru
// ------------------------------------------------------
//
// Bu modül, XOTIJI Base'in ilk yapay zeka katmanı olan
// "MSZ Lite Core" için optimize edilmiş sürümdür.
// Hafif hafıza, seçim analizi ve AI ön-yorumlaması sağlar.
//
// ------------------------------------------------------

export type MSZLogItem = {
  ts: number;
  type: "info" | "warn" | "error";
  message: string;
};

class MSZLiteCore {
  private static _instance: MSZLiteCore;
  private logs: MSZLogItem[] = [];
  private memory: Record<string, any> = {};

  // ------------------------------------------------------
  // Singleton
  // ------------------------------------------------------
  static get instance() {
    if (!this._instance) this._instance = new MSZLiteCore();
    return this._instance;
  }

  // ------------------------------------------------------
  // Loglama Sistemi
  // ------------------------------------------------------
  log(type: "info" | "warn" | "error", message: string) {
    this.logs.push({
      ts: Date.now(),
      type,
      message,
    });
  }

  getLogs(limit: number = 20) {
    return this.logs.slice(-limit);
  }

  // ------------------------------------------------------
  // Mini Hafıza Motoru
  // ------------------------------------------------------
  remember(key: string, value: any) {
    this.memory[key] = value;
    this.log("info", `Memory saved: ${key}`);
  }

  recall(key: string) {
    this.log("info", `Memory recalled: ${key}`);
    return this.memory[key];
  }

  // ------------------------------------------------------
  // FINAL v1 ANALYTICS — OTEL & DENEYİM ANALİZİ
  // XOTIJI Base için optimize edilmiş versiyon
  // ------------------------------------------------------
  analyzeBeforeCompose(items: any[]) {
    const count = items.length;
    const hotels = items.filter((i) => i.type === "hotel").length;
    const exps = items.filter((i) => i.type === "experience").length;

    // Skor hesaplama
    const score =
      0.4 * Math.min(1, hotels / 2) +
      0.4 * Math.min(1, exps / 3) +
      0.2 * Math.min(1, count / 5);

    this.log(
      "info",
      `MSZ Analysis → Items: ${count}, Hotels: ${hotels}, Experiences: ${exps}, Score: ${score.toFixed(
        2
      )}`
    );

    // FINAL v1 — profesyonel, sade yorumlar
    if (score > 0.75) {
      return "Oldukça zengin bir seçim yaptın. AI bu verilerle son derece güçlü ve tutarlı bir seyahat planı çıkarabilir.";
    }

    if (score > 0.45) {
      return "Fena değil. AI bir plan oluşturabilir ancak birkaç seçim daha eklemek sonuçları güçlendirebilir.";
    }

    return "AI bir plan çıkarabilir fakat seçim sayısı düşük. Birkaç ekleme yapman sonuçları belirgin şekilde iyileştirir.";
  }
}

export default MSZLiteCore.instance;

