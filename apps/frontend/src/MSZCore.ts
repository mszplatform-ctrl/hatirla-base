// ------------------------------------------------------
// MSZ Lite — FINAL v1
// Hatırla Base için minimalist yapay zeka yorumlayıcısı
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

  // Singleton
  static get instance() {
    if (!this._instance) this._instance = new MSZLiteCore();
    return this._instance;
  }

  // Basit log sistemi
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

  // Mini-hafıza
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

    // FINAL v1 → daha temiz, daha profesyonel yorumlar
    if (score > 0.75) {
      return "Oldukça detaylı bir plan tarzın var. AI bu kadar çok veriyle çok daha iyi bir plan çıkaracaktır.";
    }

    if (score > 0.45) {
      return "Fena değil. AI planı çıkarır ama birkaç ekleme yapmak planı iyileştirir.";
    }

    return "AI plan çıkarır ama çok az seçim yaptın, biraz daha eklemeyi düşünebilirsin.";
  }
}

export default MSZLiteCore.instance;

