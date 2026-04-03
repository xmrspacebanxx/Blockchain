import ccxt from "ccxt";
import { exec } from "child_process";

// ======================
// Configuración
// ======================
const SYMBOL = "USDC/WLD";   // Par de trading
const TIMEFRAME = "1m";      // Velas de 1 minuto
const LIMIT = 50;            // Número de velas
const SLEEP = 60 * 1000;     // 60 segundos
const SMA_SHORT = 5;         // Media móvil rápida
const SMA_LONG = 20;         // Media móvil lenta

let running = true;

// ======================
// Conexión al exchange
// ======================
const exchange = new ccxt.binance({
  enableRateLimit: true,
});

// ======================
// Funciones auxiliares
// ======================
async function fetchOHLCV() {
  const ohlcv = await exchange.fetchOHLCV(SYMBOL, TIMEFRAME, undefined, LIMIT);
  return ohlcv.map((candle) => ({
    time: candle[0],
    close: candle[4],
  }));
}

function SMA(data, length) {
  return data.slice(-length).reduce((a, b) => a + b, 0) / length;
}

function beep(freq = 880, duration = 0.2) {
  exec(`play -nq -t alsa synth ${duration} sine ${freq}`);
}

function vibrate(ms = 500) {
  exec(`termux-vibrate -d ${ms}`);
}

async function tradingSignal() {
  const data = await fetchOHLCV();
  const closes = data.map((d) => d.close);

  const smaShortNow = SMA(closes.slice(-SMA_SHORT), SMA_SHORT);
  const smaLongNow = SMA(closes.slice(-SMA_LONG), SMA_LONG);

  const smaShortPrev = SMA(closes.slice(-(SMA_SHORT + 1), -1), SMA_SHORT);
  const smaLongPrev = SMA(closes.slice(-(SMA_LONG + 1), -1), SMA_LONG);

  const lastPrice = closes[closes.length - 1];

  if (smaShortNow > smaLongNow && smaShortPrev <= smaLongPrev) {
    console.log(`🚀 Señal de COMPRA a ${lastPrice}`);
    vibrate(500);
    beep(880, 0.2);
  } else if (smaShortNow < smaLongNow && smaShortPrev >= smaLongPrev) {
    console.log(`⛔ Señal de VENTA a ${lastPrice}`);
    vibrate(1000);
    beep(440, 0.2);
  } else {
    console.log(`🟡 Sin señal. Precio actual: ${lastPrice}`);
  }
}

// ======================
// Loop principal
// ======================
console.log(`📊 Bot de análisis iniciado para ${SYMBOL}`);
console.log("ℹ️ Escribe Ctrl + C para finalizar.");

(async function loop() {
  while (running) {
    try {
      await tradingSignal();
    } catch (err) {
      console.error("❌ Error:", err);
    }
    await new Promise((res) => setTimeout(res, SLEEP));
  }
})();
