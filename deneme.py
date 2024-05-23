import firebase_admin
from firebase_admin import credentials, firestore
import fasttext
from transformers import AutoTokenizer, AutoModel
import numpy as np
from scipy.spatial.distance import cosine
import json
import time

# Firebase admin SDK'sı için kimlik bilgilerini yükle
cred = credentials.Certificate("/Users/mali/Desktop/articlesuggestion-firebase-adminsdk-cmt89-493bc1648d.json")
firebase_admin.initialize_app(cred)

# Firestore istemcisini oluştur
db = firestore.client()

# Zaman ölçme fonksiyonu
def log_time(start_time, message):
    elapsed_time = time.time() - start_time
    print(f"\033[1;32m{message} - Süre: {elapsed_time:.2f} saniye\033[0m")

start_time = time.time()
# FastText modelini yükle
fasttext_model = fasttext.load_model('/Users/mali/Desktop/cc.en.300.bin')
log_time(start_time, "FastText modeli yüklendi")

start_time = time.time()
# SciBERT modelini yükle
scibert_model_name = "allenai/scibert_scivocab_uncased"
tokenizer = AutoTokenizer.from_pretrained(scibert_model_name)
scibert_model = AutoModel.from_pretrained(scibert_model_name)
log_time(start_time, "SciBERT modeli yüklendi")

def get_fasttext_vector(text):
    return fasttext_model.get_sentence_vector(text)

def get_scibert_vector(text):
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True, max_length=512)
    outputs = scibert_model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).detach().numpy().flatten()

def get_user_profile_vector(interests, model='fasttext'):
    vectors = []
    for interest in interests:
        if model == 'fasttext':
            vectors.append(get_fasttext_vector(interest))
        elif model == 'scibert':
            vectors.append(get_scibert_vector(interest))
    return np.mean(vectors, axis=0)

def get_article_vector(article, model='fasttext'):
    if model == 'fasttext':
        return get_fasttext_vector(article['abstract'])
    elif model == 'scibert':
        return get_scibert_vector(article['abstract'])

def get_user_interests(user_id):
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    if user_doc.exists:
        return user_doc.to_dict().get('interests', [])
    return []

def load_articles(file_path):
    with open(file_path, 'r') as f:
        articles = json.load(f)
    return articles

start_time = time.time()
articles = load_articles('/Users/mali/Desktop/processed_data.json')
log_time(start_time, "Makaleler yüklendi")

def recommend_articles(user_id, model='fasttext'):
    start_time = time.time()
    interests = get_user_interests(user_id)
    log_time(start_time, "Kullanıcı ilgi alanları alındı")
    print(f"Kullanıcı ilgi alanları: {interests}")

    if not interests:
        return []

    start_time = time.time()
    user_vector = get_user_profile_vector(interests, model)
    log_time(start_time, "Kullanıcı vektörü oluşturuldu")

    start_time = time.time()
    article_vectors = [(article_id, get_article_vector(article, model)) for article_id, article in articles.items()]
    log_time(start_time, "Makale vektörleri oluşturuldu")

    start_time = time.time()
    similarities = [(articles[article_id]['title'], 1 - cosine(user_vector, article_vector)) for article_id, article_vector in article_vectors]
    similarities.sort(key=lambda x: x[1], reverse=True)
    log_time(start_time, "Benzerlikler hesaplandı ve sıralandı")

    return similarities[:5]

user_id = "6PNi2IrSiWd9bIWdx4K8vGztdcu1"  # Kullanıcı ID'sini burada belirt
fasttext_recommendations = recommend_articles(user_id, model='fasttext')
scibert_recommendations = recommend_articles(user_id, model='scibert')

print("\033[1;34mFastText Önerileri:\033[0m")
for title, score in fasttext_recommendations:
    print(f"\033[1;33m{title}\033[0m - Benzerlik Skoru: {score:.4f}")

print("\033[1;34mSciBERT Önerileri:\033[0m")
for title, score in scibert_recommendations:
    print(f"\033[1;33m{title}\033[0m - Benzerlik Skoru: {score:.4f}")
