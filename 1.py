from flask import Flask, request, jsonify
import threading
import time
import psutil
import requests

app = Flask(__name__)

MAIN_SERVER_URL = "https://bdff33aa8708.ngrok-free.app/receive_metrics"  
send_attack_metrics = False

def get_network_bytes():
    counters = psutil.net_io_counters()
    return counters.bytes_sent + counters.bytes_recv

def send_metrics_loop():
    global send_attack_metrics
    prev_network = get_network_bytes()
    time.sleep(1)

    while True:
        try:
            curr_network = get_network_bytes()
            network_diff = curr_network - prev_network
            prev_network = curr_network

            if send_attack_metrics:
                metrics = {
                    "cpu": 95,
                    "memory": 90,
                    "disk": 92,
                    "network": 1e9
                }
                send_attack_metrics = False  # Reset after one attack simulation
            else:
                metrics = {
                    "cpu": psutil.cpu_percent(),
                    "memory": psutil.virtual_memory().percent,
                    "disk": psutil.disk_usage('/').percent,
                    "network": round(network_diff / 1024, 2)
                }

            requests.post(MAIN_SERVER_URL, json=metrics)
            print(f"[INFO] Sent metrics: {metrics}")
        except Exception as e:
            print(f"[ERROR] Failed to send metrics: {e}")
        time.sleep(10)

@app.route("/start_attack", methods=["POST"])
def start_attack():
    global send_attack_metrics
    send_attack_metrics = True
    return jsonify({"status": "attack triggered"}), 200

if __name__ == "__main__":
    threading.Thread(target=send_metrics_loop, daemon=True).start()
    app.run(host="0.0.0.0", port=6000)
