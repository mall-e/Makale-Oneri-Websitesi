import numpy as np
from pymongo import MongoClient
from sklearn.metrics.pairwise import cosine_similarity
import fasttext
from transformers import AutoTokenizer, AutoModel
import torch
import json

# FastText modelini yükle
ft = fasttext.load_model('/Users/mali/Desktop/cc.en.300.bin')

# SciBERT modelini ve tokenizer'ı yükle
tokenizer = AutoTokenizer.from_pretrained('allenai/scibert_scivocab_uncased')
scibert_model = AutoModel.from_pretrained('allenai/scibert_scivocab_uncased')

def fetch_vectors_from_db():
    client = MongoClient('mongodb+srv://mall-e:efmukl123@cluster0.gc0ynhe.mongodb.net/?retryWrites=true&w=majority&appName=cluster0')
    db = client.yazlab231
    fasttext_vectors = list(db['fasttext'].find())
    scibert_vectors = list(db['scibert'].find())

    # ObjectId'leri string'e çevir ve vektörleri numpy array'den listeye çevir
    for doc in fasttext_vectors:
        doc['_id'] = str(doc['_id'])
        doc['vector'] = np.array(doc['vector']).tolist()
    for doc in scibert_vectors:
        doc['_id'] = str(doc['_id'])
        doc['vector'] = np.array(doc['vector']).tolist()

    return fasttext_vectors, scibert_vectors

def calculate_cosine_similarity(user_vector, vectors):
    vectors = np.array([v['vector'] for v in vectors])
    if len(vectors) == 0:
        return np.array([])
    similarities = cosine_similarity([user_vector], vectors)[0]
    return similarities

def find_top_matches(user_vector, vectors, top_n=5):
    similarities = calculate_cosine_similarity(user_vector, vectors)
    if len(similarities) == 0:
        return []
    sorted_indices = np.argsort(similarities)[::-1][:top_n]
    top_matches = []
    for i in sorted_indices:
        match = {
            "title": vectors[i].get('title', 'No Title'),
            "abstract": vectors[i].get('abstract', 'No Abstract'),
            "similarity": similarities[i]
        }
        top_matches.append(match)
    return top_matches

def create_fasttext_vector(user_interests):
    user_interests = ' '.join(user_interests)  # Listeyi stringe çevirin
    user_vector = ft.get_sentence_vector(user_interests)
    return user_vector

def create_scibert_vector(user_interests):
    user_interests = ' '.join(user_interests)  # Listeyi stringe çevirin
    inputs = tokenizer(user_interests, return_tensors='pt', max_length=512, truncation=True, padding=True)
    with torch.no_grad():
        outputs = scibert_model(**inputs)
    user_vector = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
    return user_vector

def main(user_id, user_interests):
    user_vector_ft = create_fasttext_vector(user_interests)
    user_vector_sb = create_scibert_vector(user_interests)

    fasttext_vectors, scibert_vectors = fetch_vectors_from_db()

    top_fasttext_matches = find_top_matches(user_vector_ft, fasttext_vectors)
    top_scibert_matches = find_top_matches(user_vector_sb, scibert_vectors)

    return top_fasttext_matches, top_scibert_matches

if __name__ == "__main__":
    import sys
    user_id = sys.argv[1]
    user_interests = sys.argv[2].strip('[]').replace('"', '').split(',')
    top_fasttext_matches, top_scibert_matches = main(user_id, user_interests)
    results = {
        "fastText": top_fasttext_matches,
        "sciBERT": top_scibert_matches
    }
    print(json.dumps(results, indent=2))  # JSON formatında çıktı yazdırma
