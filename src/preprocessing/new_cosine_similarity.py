import numpy as np
from pymongo import MongoClient
from sklearn.metrics.pairwise import cosine_similarity
import json

def fetch_vectors_from_db():
    client = MongoClient('mongodb+srv://mall-e:efmukl123@cluster0.gc0ynhe.mongodb.net/?retryWrites=true&w=majority&appName=cluster0')
    db = client.yazlab23
    fasttext_vectors = list(db['fasttext.article_vectors'].find())
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

def find_top_matches(user_vector, vectors, top_n=5, exclude_titles=set()):
    similarities = calculate_cosine_similarity(user_vector, vectors)
    if len(similarities) == 0:
        return []
    sorted_indices = np.argsort(similarities)[::-1]
    top_matches = []
    seen_titles = set(exclude_titles)
    for i in sorted_indices:
        title = vectors[i].get('title', 'No Title')
        if title not in seen_titles:
            seen_titles.add(title)
            match = {
                "title": title,
                "similarity": similarities[i]
            }
            top_matches.append(match)
            if len(top_matches) >= top_n:
                break
    return top_matches

def create_average_vector(vectors):
    vectors = np.array(vectors)
    if len(vectors) == 0:
        return np.zeros(300)  # Varsayılan vektör boyutunu belirtin
    return np.mean(vectors, axis=0)

def main(selected_articles):
    fasttext_vectors, scibert_vectors = fetch_vectors_from_db()

    # Seçilen makalelerin vektörlerini bul
    selected_fasttext_vectors = [doc['vector'] for doc in fasttext_vectors if doc['title'] in selected_articles]
    selected_scibert_vectors = [doc['vector'] for doc in scibert_vectors if doc['title'] in selected_articles]

    # Seçilen makalelerin ortalama vektörlerini oluştur
    user_vector_ft = create_average_vector(selected_fasttext_vectors)
    user_vector_sb = create_average_vector(selected_scibert_vectors)

    top_fasttext_matches = find_top_matches(user_vector_ft, fasttext_vectors, exclude_titles=selected_articles)
    top_scibert_matches = find_top_matches(user_vector_sb, scibert_vectors, exclude_titles=selected_articles)

    return top_fasttext_matches, top_scibert_matches

if __name__ == "__main__":
    import sys
    selected_articles = json.loads(sys.argv[1])
    top_fasttext_matches, top_scibert_matches = main(selected_articles)
    results = {
        "fastText": top_fasttext_matches,
        "sciBERT": top_scibert_matches
    }
    print(json.dumps(results, indent=2))  # JSON formatında çıktı yazdırma
