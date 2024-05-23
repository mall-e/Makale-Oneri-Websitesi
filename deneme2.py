import firebase_admin
from firebase_admin import credentials, firestore
import fasttext
import numpy as np
from scipy.spatial.distance import cosine
import json

# Firebase admin SDK'sı için kimlik bilgilerini yükle
cred = credentials.Certificate("/Users/mali/Desktop/articlesuggestion-firebase-adminsdk-cmt89-493bc1648d.json")
firebase_admin.initialize_app(cred)

# Firestore istemcisini oluştur
db = firestore.client()

# FastText modelini yükle
fasttext_model = fasttext.load_model('/Users/mali/Desktop/cc.en.300.bin')

def get_fasttext_vector(text):
    # Metni satır sonu karakterlerinden temizleyin
    text = text.replace('\n', ' ')
    return fasttext_model.get_sentence_vector(text).astype(np.float32)

def get_user_interests(user_id):
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    if user_doc.exists:
        return user_doc.to_dict().get('interests', [])
    return []

def get_user_profile_vector(interests):
    vectors = [get_fasttext_vector(interest) for interest in interests]
    if vectors:
        return np.mean(vectors, axis=0)
    else:
        return np.zeros(fasttext_model.get_dimension())

def load_articles(file_path):
    with open(file_path, 'r') as f:
        articles = json.load(f)
    return articles

def cosine_similarity(v1, v2):
    dot_product = np.dot(v1, v2)
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)
    if norm_v1 == 0 or norm_v2 == 0:
        return 0
    return dot_product / (norm_v1 * norm_v2)

def recommend_articles(user_id):
    interests = get_user_interests(user_id)
    print(f"Kullanıcı ilgi alanları: {interests}")

    if not interests:
        return []

    user_vector = get_user_profile_vector(interests)
    article_vectors = [(article_id, get_fasttext_vector(article['abstract'])) for article_id, article in articles.items()]

    similarities = [(articles[article_id]['title'], cosine_similarity(user_vector, article_vector)) for article_id, article_vector in article_vectors]
    similarities.sort(key=lambda x: x[1], reverse=True)

    return similarities[:5]

# Makaleleri yükle
articles = load_articles('/Users/mali/Desktop/processed_data.json')

# Kullanıcı ID'sini belirtin
user_id = "6PNi2IrSiWd9bIWdx4K8vGztdcu1"

# Önerileri alın
recommendations = recommend_articles(user_id)

print("\033[1;34mFastText Önerileri:\033[0m")
for title, score in recommendations:
    print(f"\033[1;33m{title}\033[0m - Benzerlik Skoru: {score:.4f}")
