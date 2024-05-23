import firebase_admin
from firebase_admin import credentials, firestore
from transformers import BertTokenizer, BertModel
import torch
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from gensim.models import FastText
import json

# Firebase Admin'i başlat
cred = credentials.Certificate('/Users/mali/Desktop/articlesuggestion-firebase-adminsdk-cmt89-493bc1648d.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def get_user_interests(user_id):
    interests_ref = db.collection('users').document(user_id).collection('interests')
    interests_docs = interests_ref.stream()
    interests_list = []
    for doc in interests_docs:
        interests_list.append(doc.to_dict())
        print(doc.to_dict())  # İlgi alanlarını yazdır
    return interests_list

# Model ve Tokenizer yükleme
tokenizer = BertTokenizer.from_pretrained('allenai/scibert_scivocab_uncased')
model = BertModel.from_pretrained('allenai/scibert_scivocab_uncased')

def get_interest_vector(interests):
    # Her bir ilgi alanı için vektör hesapla ve bir listeye ekle
    vectors = []
    for interest in interests:
        text = interest['name']
        inputs = tokenizer(text, return_tensors='pt', padding=True, truncation=True, max_length=512)
        outputs = model(**inputs)
        vectors.append(outputs.last_hidden_state.mean(dim=1).detach().numpy())

    # Tüm vektörleri numpy array'ine dönüştür
    vectors = np.array(vectors)

    # Vektörlerin ortalamasını hesapla
    interest_vector = np.mean(vectors, axis=0)
    return interest_vector


user_interests = get_user_interests("WPAEXx7knqNveXCo4kXfGX1HSrp2")
user_vector = get_interest_vector(user_interests)

def load_data(input_path):
    with open(input_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    return data

input_path = '/Users/mali/Desktop/processed_data.json'
data = load_data(input_path)

def create_fasttext_embeddings(data):
    # Abstract metinleri üzerinde FastText modelini eğit
    sentences = [value['abstract'].split() for key, value in data.items()]
    model = FastText(sentences, vector_size=768, window=5, min_count=1, workers=4)
    return model

ft_model = create_fasttext_embeddings(data)

def create_scibert_embeddings(data):
    embeddings = {}
    for key, value in data.items():
        inputs = tokenizer(value['abstract'], return_tensors='pt', padding=True, truncation=True, max_length=512)
        outputs = model(**inputs)
        title = value.get('title', 'No Title Available')
        embeddings[key] = {"vector": outputs.last_hidden_state.mean(dim=1).detach().numpy(), "title": title}
    return embeddings

scibert_embeddings = create_scibert_embeddings(data)

def recommend_articles_optimized(user_vector, article_vectors):
    article_ids = list(article_vectors.keys())
    article_matrix = np.vstack([article_vectors[id]['vector'] for id in article_ids])
    user_vector_reshaped = user_vector.reshape(1, -1)
    similarities = cosine_similarity(user_vector_reshaped, article_matrix)[0]
    recommended_indices = np.argsort(-similarities)[:5]
    recommended_articles = [(article_ids[idx], article_vectors[article_ids[idx]]['title'], similarities[idx]) for idx in recommended_indices]
    return recommended_articles

# SciBERT önerileri
recommended_scibert = recommend_articles_optimized(user_vector, scibert_embeddings)
print("SciBERT ile Önerilen Makaleler:")
for article_id, title, similarity in recommended_scibert:
    print(f"Makale ID: {article_id}, Başlık: {title}, Benzerlik: {similarity}")

# FastText önerileri için vektörleri oluştur
def get_fasttext_vectors(model, data):
    ft_vectors = {}
    for key, value in data.items():
        words = value['abstract'].split()
        vectors = [model.wv[word] for word in words if word in model.wv]
        if vectors:
            vector_average = np.mean(vectors, axis=0)
            ft_vectors[key] = {"vector": vector_average, "title": value['title']}
    return ft_vectors

ft_vectors = get_fasttext_vectors(ft_model, data)
recommended_ft = recommend_articles_optimized(user_vector, ft_vectors)
print("FastText ile Önerilen Makaleler:")
for article_id, title, similarity in recommended_ft:
    print(f"Makale ID: {article_id}, Başlık: {title}, Benzerlik: {similarity}")
