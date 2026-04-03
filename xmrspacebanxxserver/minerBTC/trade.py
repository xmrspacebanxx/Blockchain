import time
import pandas as pd
import ccxt
import os
import threading

# ======================
# Configuración
# ======================
SYMBOL = 'WLD/USDT'        # Par de trading
TIMEFRAME = '1m'           # Velas de 1 minuto
LIMIT = 50                 # Número de velas para análisis
SLEEP = 60                 # Tiempo entre análisis (segundos)
SMA_SHORT = 5              # Media móvil rápida
SMA_LONG = 20              # Media móvil lenta

# Variable global para controlar el loop
running = True

# ======================
# Conexión al exchange
# ======================
exchange = ccxt.binance({'enableRateLimit': True})

def fetch_ohlcv():
    """Descargar velas y devolver DataFrame"""
    ohlcv = exchange.fetch_ohlcv(SYMBOL, timeframe=TIMEFRAME, limit=LIMIT)
    df = pd.DataFrame(ohlcv, columns=['timestamp','open','high','low','close','volume'])
    df['close'] = df['close'].astype(float)
    return df

def trading_signal(df):
    """Analizar señales de compra/venta con medias móviles"""
    df['sma_short'] = df['close'].rolling(SMA_SHORT).mean()
    df['sma_long'] = df['close'].rolling(SMA_LONG).mean()
    
    sma_short_now = df['sma_short'].iloc[-1]
    sma_long_now = df['sma_long'].iloc[-1]
    sma_short_prev = df['sma_short'].iloc[-2]
    sma_long_prev = df['sma_long'].iloc[-2]
    last_price = df['close'].iloc[-1]

    if sma_short_now > sma_long_now and sma_short_prev <= sma_long_prev:
        print(f"🚀 Señal de COMPRA a {last_price}")
        os.system("termux-vibrate -d 500")
        os.system("play -nq -t alsa synth 0.2 sine 880")
    elif sma_short_now < sma_long_now and sma_short_prev >= sma_long_prev:
        print(f"⛔ Señal de VENTA a {last_price}")
        os.system("termux-vibrate -d 1000")
        os.system("play -nq -t alsa synth 0.2 sine 440")
    else:
        print(f"🟡 Sin señal. Precio actual: {last_price}")

def user_input_listener():
    """Hilo para escuchar si el usuario escribe 'exit'"""
    global running
    while running:
        cmd = input()
        if cmd.lower() == "exit":
            print("👋 Finalizando bot por comando del usuario...")
            running = False
            break

# ======================
# Loop principal
# ======================
print(f"📊 Bot de análisis iniciado para {SYMBOL}")
print("ℹ️ Escribe 'exit' y presiona ENTER para finalizar el bot.")

# Iniciar hilo que escucha comandos del usuario
threading.Thread(target=user_input_listener, daemon=True).start()

try:
    while running:
        df = fetch_ohlcv()
        trading_signal(df)
        time.sleep(SLEEP)
except KeyboardInterrupt:
    print("\n👋 Finalizando bot por Ctrl + C...")

