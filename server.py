from flask import Flask, request, jsonify

app = Flask(__name__)

SECRET_KEY = "X9g7P2kL8aQ3rV1m"
OWNER_ID = 19017521

@app.route("/getBuffs")
def get_buffs():
    user_id = int(request.args.get("userId", 0))
    key = request.args.get("key", "")
    if key != SECRET_KEY:
        return jsonify({"buffs": []})
    if user_id == OWNER_ID:
        return jsonify({"buffs": ["HitParameter", "QuickAction"]})
    return jsonify({"buffs": []})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
