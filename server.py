from flask import Flask, request, jsonify
import os

app = Flask(__name__)

# Chave secreta e ID do dono
SECRET_KEY = "X9g7P2kL8aQ3rV1m"
OWNER_ID = 19017521

@app.route("/getBuffs")
def get_buffs():
    # Pegando parâmetros da query
    user_id = request.args.get("userId", type=int, default=0)
    key = request.args.get("key", "")

    # Checando a chave secreta
    if key != SECRET_KEY:
        return jsonify({"buffs": []})

    # Se for o dono, retorna buffs especiais
    if user_id == OWNER_ID:
        return jsonify({"buffs": ["HitParameter", "QuickAction"]})

    # Caso contrário, retorna vazio
    return jsonify({"buffs": []})

# Porta dinâmica para Render
port = int(os.environ.get("PORT", 3000))
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=port)
