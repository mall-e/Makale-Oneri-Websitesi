from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Firebase Admin'i başlat
cred = credentials.Certificate('/Users/mali/Desktop/articlesuggestion-firebase-adminsdk-cmt89-493bc1648d.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route('/api/fasttext', methods=['POST'])
def recommend_fasttext():
    return recommend_articles('/Users/mali/Desktop/Yazlab2_3/yazlab2_3/src/preprocessing/fasttextres.py', 'fasttext')

# @app.route('/api/scibert', methods=['POST'])
# def recommend_scibert():
#     return recommend_articles('/Users/mali/Desktop/Yazlab2_3/yazlab2_3/src/preprocessing/scibertres.py', 'scibert')

def recommend_articles(script_name, model_name):
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        user_doc_ref = db.collection('users').document(user_id)
        user_doc = user_doc_ref.get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            if user_data.get(f'{model_name}_processed', False):
                # Veritabanından makale önerilerini al
                articles_ref = db.collection('article_vectors').where('model', '==', model_name)
                articles = [doc.to_dict() for doc in articles_ref.stream()]
                return jsonify(articles)

        # Python scriptini çalıştır ve çıktısını al
        result = subprocess.run(['python3', script_name, user_id], capture_output=True, text=True)

        if result.returncode != 0:
            return jsonify({"error": "Script execution failed", "details": result.stderr}), 500

        response_data = json.loads(result.stdout)

        # Script çalıştıktan sonra kullanıcı verisini güncelle
        user_doc_ref.set({f'{model_name}_processed': True}, merge=True)

        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001)
