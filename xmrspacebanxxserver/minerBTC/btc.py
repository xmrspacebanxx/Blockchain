import socket
import json
import hashlib
import struct
import random
import time

# Configuración del pool Braiins
POOL = "stratum.braiins.com"
PORT = 3333
USER = "xmrspacebanxx.workerName"   # ej: pepe123.miworker1
PASSWORD = "anything123"

# -------------------------------
# Funciones auxiliares
# -------------------------------
def sha256d(data: bytes) -> bytes:
    """Doble SHA256"""
    return hashlib.sha256(hashlib.sha256(data).digest()).digest()

def little_endian(hex_str: str) -> bytes:
    """Convierte string hex a little endian"""
    return bytes.fromhex(hex_str)[::-1]

def bits_to_target(bits: str) -> int:
    """Convierte nBits (compact format) a target entero"""
    b = bytes.fromhex(bits)
    exponent = b[0]
    coefficient = int.from_bytes(b[1:], "big")
    target = coefficient * (1 << (8 * (exponent - 3)))
    return target

def hash_meets_target(hash_bytes: bytes, target: int) -> bool:
    """Verifica si el hash está por debajo del target"""
    hash_int = int.from_bytes(hash_bytes, "big")
    return hash_int < target

# -------------------------------
# Cliente Stratum
# -------------------------------
def connect_to_pool():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((POOL, PORT))

    # Suscripción
    s.send((json.dumps({"id": 1, "method": "mining.subscribe", "params": []}) + "\n").encode())
    # Autorización
    s.send((json.dumps({"id": 2, "method": "mining.authorize", "params": [USER, PASSWORD]}) + "\n").encode())

    buffer = ""
    extranonce1 = None
    extranonce2_size = None
    share_difficulty = 2**256  # por defecto enorme, se ajusta luego

    while True:
        data = s.recv(4096).decode()
        if not data:
            continue
        buffer += data

        while "\n" in buffer:
            line, buffer = buffer.split("\n", 1)
            if not line.strip():
                continue

            try:
                message = json.loads(line)
            except:
                continue

            # Guardar extranonce del subscribe
            if message.get("id") == 1 and message.get("result"):
                result = message["result"]
                extranonce1 = result[1]
                extranonce2_size = result[2]
                print(f"ExtraNonce1: {extranonce1}, ExtraNonce2 size: {extranonce2_size}")

            # Ajustar dificultad del pool
            if message.get("method") == "mining.set_difficulty":
                diff = message["params"][0]
                # Fórmula: share_target = 2^256 / diff
                share_target = (1 << 256) // diff
                share_difficulty = share_target
                print(f"🎚️ Dificultad del pool ajustada: {diff}, Target: {hex(share_target)}")

            # Recibir trabajo
            if message.get("method") == "mining.notify":
                job_id, prevhash, coinb1, coinb2, merkle_branch, version, nbits, ntime, clean_jobs = message["params"]

                print("\n🆕 Nuevo trabajo recibido")
                print(f"Job ID: {job_id}")
                print(f"PrevHash: {prevhash}")
                print(f"nBits: {nbits}, nTime: {ntime}")

                # Crear extranonce2 (aleatorio del tamaño correcto)
                extranonce2 = "{:0{}x}".format(random.randint(0, 2**32-1), extranonce2_size*2)

                # Construir coinbase simplificada
                coinbase = coinb1 + extranonce1 + extranonce2 + coinb2
                coinbase_bin = bytes.fromhex(coinbase)

                # Hash de coinbase
                coinbase_hash = sha256d(coinbase_bin)

                # Construir merkle root
                merkle_root = coinbase_hash
                for h in merkle_branch:
                    merkle_root = sha256d(merkle_root + bytes.fromhex(h)[::-1])
                merkle_root_hex = merkle_root[::-1].hex()

                print(f"Merkle Root: {merkle_root_hex}")

                # Preparar header base
                header_base = (
                    little_endian(version) +
                    little_endian(prevhash) +
                    bytes.fromhex(merkle_root_hex) +
                    little_endian(ntime) +
                    little_endian(nbits)
                )

                # Calcular target global (Bitcoin)
                global_target = bits_to_target(nbits)
                print(f"Target global: {hex(global_target)}")

                # Probar nonces (educativo: hasta 100000)
                for nonce in range(100000):
                    header = header_base + struct.pack("<I", nonce)
                    hash_result = sha256d(header)
                    hash_hex = hash_result[::-1].hex()
                    hash_int = int.from_bytes(hash_result, "big")

                    # 1) Comparar contra dificultad del pool (share)
                    if hash_int < share_difficulty:
                        print(f"✅ Share válido! Nonce={nonce}, Hash={hash_hex}")

                        submit = {
                            "id": 4,
                            "method": "mining.submit",
                            "params": [USER, job_id, extranonce2, ntime, "{:08x}".format(nonce)]
                        }
                        s.send((json.dumps(submit) + "\n").encode())
                        print("📤 Share enviado al pool\n")

                    # 2) Comparar contra dificultad global (bloque Bitcoin)
                    if hash_int < global_target:
                        print(f"🎉 BLOQUE VÁLIDO ENCONTRADO!!! Nonce={nonce}, Hash={hash_hex}\n")
                        # Esto le daría recompensa real al pool
                        break


if __name__ == "__main__":
    try:
        connect_to_pool()
    except KeyboardInterrupt:
        print("\n🛑 Minero detenido por el usuario.")
